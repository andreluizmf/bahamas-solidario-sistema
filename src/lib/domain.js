export const categories = [
  "Alimentos",
  "Agasalhos",
  "Higiene",
  "Brinquedos",
  "Educação",
  "Outros",
];
export const statuses = {
  planned: "Em breve",
  active: "Em andamento",
  completed: "Concluída",
  archived: "Arquivada",
};
export const donationStatuses = {
  pending: "Pendente",
  received: "Recebida",
  cancelled: "Cancelada",
};
export const number = (value) =>
  Number(value || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
export const today = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
export function date(value) {
  return value
    ? new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString(
        "pt-BR",
      )
    : "—";
}
export function progress(campaign) {
  const needs = campaign.needs?.filter((n) => n.active !== false) || [];
  return needs.length
    ? Math.round(
        (needs.reduce(
          (sum, n) =>
            sum + Math.min(1, Number(n.received || 0) / Number(n.goal || 1)),
          0,
        ) /
          needs.length) *
          100,
      )
    : 0;
}
export function effectiveStatus(campaign) {
  if (campaign.status === "active" && campaign.ends_on < today())
    return "closed";
  if (campaign.status === "active" && campaign.starts_on > today())
    return "planned";
  return campaign.status;
}
export function decorateCampaigns(campaigns, donations) {
  return campaigns.map((c) => ({
    ...c,
    needs: (c.campaign_needs || c.needs || []).map((n) => ({
      ...n,
      received: donations
        .filter((d) => d.need_id === n.id && d.status === "received")
        .reduce((sum, d) => sum + Number(d.quantity), 0),
    })),
  }));
}
export function csv(rows) {
  const escape = (value) => {
    const text = String(value ?? "");
    const safe =
      typeof value === "number"
        ? text
        : /^[\s]*[=+@\-\t\r]/.test(text)
          ? `'${text}`
          : text;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  return "\uFEFF" + rows.map((row) => row.map(escape).join(";")).join("\r\n");
}
export function download(name, text, type = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const emptyCampaign = () => ({
  name: "",
  category: "Alimentos",
  description: "",
  beneficiary: "",
  location: "",
  starts_on: today(),
  ends_on: today(),
  status: "active",
  published: false,
  needs: [{ item: "", goal: "", unit: "unidades" }],
});
