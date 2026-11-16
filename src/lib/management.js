const numeric = (value) => Number(value || 0);
export const money = (value) =>
  numeric(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
export const taskStatuses = {
  todo: "A fazer",
  doing: "Em andamento",
  done: "Concluída",
  cancelled: "Cancelada",
};
export const actionStatuses = {
  draft: "Rascunho",
  scheduled: "Agendada",
  published: "Publicada",
  cancelled: "Cancelada",
};
export const channels = {
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  email: "E-mail",
  loja: "Loja física",
  parcerias: "Parcerias",
  outros: "Outros",
};
export const expenseCategories = {
  operacao: "Operação",
  logistica: "Logística",
  materiais: "Materiais",
  outros: "Outros",
};
export function managementSummary(
  plan = {},
  tasks = [],
  expenses = [],
  actions = [],
  day,
) {
  const validTasks = tasks.filter((t) => t.status !== "cancelled"),
    done = validTasks.filter((t) => t.status === "done");
  const operational = expenses
    .filter((e) => e.status !== "cancelled")
    .reduce((s, e) => s + numeric(e.amount), 0);
  // Actual marketing costs remain incurred even if the publication was cancelled.
  const marketing = actions.reduce((s, a) => s + numeric(a.cost), 0);
  const spent = Math.round((operational + marketing) * 100) / 100;
  return {
    budget: numeric(plan.budget),
    operational,
    marketing,
    spent,
    balance: Math.round((numeric(plan.budget) - spent) * 100) / 100,
    overdue: validTasks.filter((t) => t.status !== "done" && t.deadline < day)
      .length,
    done: done.length,
    total: validTasks.length,
    completion: validTasks.length
      ? Math.round((done.length / validTasks.length) * 100)
      : 0,
  };
}
export function marketingSummary(actions = []) {
  const published = actions.filter((a) => a.status === "published");
  const sum = (key) => published.reduce((s, a) => s + numeric(a[key]), 0);
  const reach = sum("reach"),
    interactions = sum("interactions"),
    clicks = sum("clicks"),
    conversions = sum("conversions"),
    cost = sum("cost");
  const ratio = (a, b) => (b ? Math.round((a / b) * 10000) / 100 : null);
  return {
    published: published.length,
    reach,
    interactions,
    clicks,
    conversions,
    cost,
    engagement: ratio(interactions, reach),
    ctr: ratio(clicks, reach),
    conversionRate: ratio(conversions, clicks),
    costPerConversion: conversions ? cost / conversions : null,
  };
}
export function campaignMessage(campaign, plan = {}) {
  const items = (campaign.needs || [])
    .filter((n) => n.active !== false && numeric(n.received) < numeric(n.goal))
    .map((n) => n.item)
    .join(", ");
  return [
    campaign.name,
    plan.value_proposition || campaign.description,
    items
      ? `Itens necessários: ${items}.`
      : "Consulte os itens e as metas no portal.",
    `Prazo da campanha: ${String(campaign.ends_on).split("-").reverse().join("/")}.`,
    campaign.location
      ? `Local: ${campaign.location}.`
      : "Combine o local de entrega com a equipe.",
    "Saiba como participar no portal Bahamas Solidário.",
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 3000);
}
export function campaignUrl(campaign, channel, origin) {
  if (!campaign.published) return null;
  const url = new URL(`/campanhas/${encodeURIComponent(campaign.id)}`, origin);
  url.searchParams.set("utm_source", channel);
  url.searchParams.set(
    "utm_medium",
    ["instagram", "whatsapp"].includes(channel)
      ? "social"
      : channel === "email"
        ? "email"
        : "offline",
  );
  url.searchParams.set("utm_campaign", campaign.id);
  return url.toString();
}
