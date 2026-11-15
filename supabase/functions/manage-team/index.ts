import { createClient } from "npm:@supabase/supabase-js@2.119.0";

// O JWT é verificado pelo Auth antes de qualquer operação com a chave de serviço.
Deno.serve(async (req: Request) => {
  const site = Deno.env.get("SITE_URL");
  const origin = req.headers.get("origin");
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": site || "",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
  const reply = (body: object, status = 200) =>
    new Response(JSON.stringify(body), { status, headers });
  if (!site)
    return reply(
      { error: "Configure SITE_URL na função antes de convidar pessoas." },
      503,
    );
  if (origin && origin !== site)
    return reply({ error: "Origem não autorizada." }, 403);
  if (req.method === "OPTIONS")
    return new Response(null, { status: 204, headers });
  if (req.method !== "POST")
    return reply({ error: "Método não permitido." }, 405);
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return reply({ error: "Autenticação necessária." }, 401);
  const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
  const serverKey =
    Object.values(keys).find((key) => typeof key === "string") ||
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serverKey)
    return reply({ error: "Configuração de servidor indisponível." }, 503);
  const db = createClient(Deno.env.get("SUPABASE_URL")!, serverKey as string, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
    error: authError,
  } = await db.auth.getUser(token);
  if (authError || !user) return reply({ error: "Sessão inválida." }, 401);
  const { data: admin, error: roleError } = await db
    .from("administrators")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (roleError || !admin)
    return reply({ error: "Acesso administrativo necessário." }, 403);
  try {
    const text = await req.text();
    if (text.length > 2000)
      return reply({ error: "Requisição muito grande." }, 413);
    const { action, email, name } = JSON.parse(text);
    if (
      action !== "invite" ||
      typeof email !== "string" ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.length > 100
    )
      return reply({ error: "Informe um nome e um e-mail válidos." }, 400);
    const { data, error } = await db.auth.admin.inviteUserByEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${site}/admin/nova-senha` },
    );
    if (error)
      return reply(
        {
          error: error.message.includes("already")
            ? "Este e-mail já está cadastrado. Use o procedimento de autorização de conta existente descrito no guia."
            : "Não foi possível enviar o convite. Verifique o serviço de e-mail do Supabase.",
        },
        400,
      );
    const { error: insertError } = await db.from("administrators").insert({
      user_id: data.user.id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
    });
    if (insertError)
      return reply(
        {
          error:
            "O e-mail foi enviado, mas a autorização não foi salva. Autorize essa conta pelo procedimento do guia.",
        },
        500,
      );
    return reply({ ok: true });
  } catch {
    return reply({ error: "Não foi possível processar o convite." }, 400);
  }
});
