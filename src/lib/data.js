import { createClient } from "@supabase/supabase-js";
import { decorateCampaigns } from "./domain";

const url = import.meta.env.VITE_SUPABASE_URL;
const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;
export const configured = Boolean(url && key);
export const supabase = configured
  ? createClient(url, key, {
      auth: {
        flowType: "pkce",
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const defaultSettings = {
  id: 1,
  hero_title: "Solidariedade que transforma a nossa comunidade.",
  hero_description:
    "Conheça as campanhas do Bahamas Solidário e descubra como fazer parte de cada transformação.",
  about:
    "Conectamos pessoas e iniciativas para apoiar quem mais precisa, com organização, cuidado e transparência.",
  contact_email: "",
  contact_phone: "",
  collection_address: "",
  opening_hours: "",
  donation_instructions:
    "Escolha uma campanha e confira os itens necessários. Entre em contato com nossa equipe para combinar a entrega.",
  privacy_notice:
    "As informações pessoais de doadores são restritas à equipe administrativa. O portal divulga somente campanhas e resultados agregados.",
};
export const previewCampaigns = [
  {
    id: "inverno",
    name: "Inverno Solidário",
    category: "Agasalhos",
    description:
      "Cobertores e casacos podem levar conforto e acolhimento para quem enfrenta os dias mais frios. Faça parte dessa corrente de cuidado.",
    beneficiary: "Comunidade local",
    location: "",
    starts_on: "2026-06-01",
    ends_on: "2026-08-30",
    status: "active",
    published: true,
    donation_count: 0,
    needs: [
      {
        id: "cobertores",
        item: "Cobertores",
        goal: 70,
        unit: "unidades",
        received: 0,
      },
      {
        id: "casacos",
        item: "Casacos",
        goal: 50,
        unit: "unidades",
        received: 0,
      },
    ],
  },
  {
    id: "mesa",
    name: "Mesa Cheia",
    category: "Alimentos",
    description:
      "A segurança alimentar começa com um gesto de solidariedade. Estamos reunindo alimentos para levar mais tranquilidade à mesa de famílias da nossa comunidade.",
    beneficiary: "Famílias da comunidade",
    location: "",
    starts_on: "2026-11-01",
    ends_on: "2026-12-20",
    status: "active",
    published: true,
    donation_count: 0,
    needs: [
      { id: "arroz", item: "Arroz", goal: 120, unit: "kg", received: 0 },
      { id: "feijao", item: "Feijão", goal: 80, unit: "kg", received: 0 },
    ],
  },
];
function unwrap(result) {
  if (result.error) throw result.error;
  return result.data;
}
async function all(query) {
  const result = [];
  for (let from = 0; from < 50000; from += 1000) {
    const page = unwrap(await query().range(from, from + 999));
    result.push(...page);
    if (page.length < 1000) return result;
  }
  throw new Error(
    "A consulta excedeu 50 mil registros. Refine a consulta no Supabase antes de continuar.",
  );
}
export async function getPublicData() {
  if (!configured)
    return { campaigns: previewCampaigns, settings: defaultSettings };
  const [campaigns, settings] = await Promise.all([
    supabase.rpc("public_campaigns"),
    supabase.from("site_settings").select("*").eq("id", 1).single(),
  ]);
  return { campaigns: unwrap(campaigns), settings: unwrap(settings) };
}
export async function getAdminData() {
  const [campaigns, donations, settings, team, audit] = await Promise.all([
    all(() =>
      supabase
        .from("campaigns")
        .select("*,campaign_needs(*)")
        .order("created_at", { ascending: false })
        .order("id"),
    ),
    all(() =>
      supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false })
        .order("id"),
    ),
    supabase.from("site_settings").select("*").eq("id", 1).single(),
    supabase.from("administrators").select("*").order("created_at"),
    supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);
  return {
    campaigns: decorateCampaigns(campaigns, donations),
    donations,
    settings: unwrap(settings),
    team: unwrap(team),
    audit: unwrap(audit),
  };
}
export async function saveCampaign(payload) {
  return unwrap(
    await supabase.rpc("save_campaign", {
      payload: {
        ...payload,
        needs: payload.needs
          .filter((n) => n.active !== false)
          .map(({ id, item, goal, unit }) => ({
            id,
            item,
            goal: Number(goal),
            unit,
          })),
      },
    }),
  );
}
export async function saveDonation(payload) {
  const { id, updated_at, ...values } = payload;
  const allowed = Object.fromEntries(
    [
      "need_id",
      "quantity",
      "donor_name",
      "donor_contact",
      "notes",
      "status",
      "donated_on",
    ].map((k) => [k, values[k]]),
  );
  allowed.quantity = Number(allowed.quantity);
  if (!id)
    return unwrap(
      await supabase.from("donations").insert(allowed).select().single(),
    );
  const result = await supabase
    .from("donations")
    .update(allowed)
    .eq("id", id)
    .eq("updated_at", updated_at)
    .select()
    .maybeSingle();
  const data = unwrap(result);
  if (!data)
    throw new Error(
      "Este registro foi alterado por outra pessoa. Atualize a página.",
    );
  return data;
}
export async function saveSettings(settings) {
  const { updated_at, ...values } = settings;
  const result = unwrap(
    await supabase
      .from("site_settings")
      .update(values)
      .eq("id", 1)
      .eq("updated_at", updated_at)
      .select()
      .maybeSingle(),
  );
  if (!result)
    throw new Error(
      "O conteúdo foi alterado por outra pessoa. Atualize a página.",
    );
  return result;
}
export function message(error) {
  if (error?.message === "Invalid login credentials")
    return "E-mail ou senha incorretos.";
  if (error?.message?.includes("Email not confirmed"))
    return "Confirme seu e-mail antes de entrar.";
  if (error?.code === "42501")
    return "Sua conta não tem permissão para esta ação.";
  if (error?.code === "23514")
    return "Confira os valores e as datas informados.";
  if (error?.message?.includes("Failed to fetch"))
    return "Não foi possível conectar. Verifique sua conexão e tente novamente.";
  return error?.message || "Não foi possível concluir a operação.";
}
