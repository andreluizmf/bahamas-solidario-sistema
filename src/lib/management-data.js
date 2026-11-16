import { supabase, all } from "./data";
const fields = {
  campaign_plans: [
    "campaign_id",
    "objective",
    "responsible",
    "audience",
    "value_proposition",
    "budget",
    "analysis",
  ],
  management_tasks: [
    "campaign_id",
    "title",
    "responsible",
    "deadline",
    "status",
    "notes",
  ],
  campaign_expenses: [
    "campaign_id",
    "description",
    "category",
    "amount",
    "occurred_on",
    "status",
  ],
  marketing_actions: [
    "campaign_id",
    "title",
    "channel",
    "responsible",
    "publish_on",
    "status",
    "message",
    "reach",
    "interactions",
    "clicks",
    "conversions",
    "cost",
  ],
};
export async function getManagementData(campaignId) {
  const entries = await Promise.all(
    Object.keys(fields).map(async (table) => [
      table,
      await all(() =>
        supabase
          .from(table)
          .select("*")
          .eq("campaign_id", campaignId)
          .order("created_at")
          .order("id"),
      ),
    ]),
  );
  return Object.fromEntries(entries);
}
export async function saveManagement(table, record) {
  if (!fields[table]) throw new Error("Tipo de registro não permitido.");
  const values = Object.fromEntries(
    fields[table].map((key) => [key, record[key]]),
  );
  let request;
  if (record.id)
    request = supabase
      .from(table)
      .update(values)
      .eq("id", record.id)
      .eq("updated_at", record.updated_at)
      .select()
      .maybeSingle();
  else request = supabase.from(table).insert(values).select().single();
  const { data, error } = await request;
  if (error?.code === "23505")
    throw new Error(
      "Já existe um plano para esta campanha. Atualize os dados antes de editar.",
    );
  if (error) throw error;
  if (!data)
    throw new Error(
      "Este registro mudou em outra sessão. Atualize os dados e revise a edição.",
    );
  return data;
}
