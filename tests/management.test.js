import test from "node:test";
import assert from "node:assert/strict";
import {
  managementSummary,
  marketingSummary,
  campaignMessage,
  campaignUrl,
} from "../src/lib/management.js";
test("orçamento soma custos uma vez e preserva custo de divulgação cancelada", () => {
  const s = managementSummary(
    { budget: 100 },
    [
      { status: "done", deadline: "2026-01-01" },
      { status: "todo", deadline: "2026-01-01" },
      { status: "cancelled", deadline: "2026-01-01" },
    ],
    [
      { amount: 60, status: "recorded" },
      { amount: 999, status: "cancelled" },
    ],
    [{ cost: 50, status: "cancelled" }],
    "2026-11-15",
  );
  assert.equal(s.spent, 110);
  assert.equal(s.balance, -10);
  assert.equal(s.overdue, 1);
  assert.equal(s.completion, 50);
});
test("indicadores de marketing usam somente ações publicadas e não dividem por zero", () => {
  const r = marketingSummary([
    {
      status: "published",
      reach: 100,
      interactions: 10,
      clicks: 20,
      conversions: 2,
      cost: 40,
    },
    { status: "draft", reach: 900 },
    { status: "cancelled", reach: 800 },
  ]);
  assert.equal(r.reach, 100);
  assert.equal(r.engagement, 10);
  assert.equal(r.ctr, 20);
  assert.equal(r.costPerConversion, 20);
  assert.equal(r.conversionRate, 10);
  assert.equal(marketingSummary([]).engagement, null);
  assert.equal(marketingSummary([]).costPerConversion, null);
});
test("modelo de divulgação usa apenas itens ativos com necessidade e link só para campanha publicada", () => {
  const c = {
    id: "c1",
    name: "Mesa Cheia",
    ends_on: "2026-12-20",
    description: "Descrição",
    published: false,
    needs: [
      { item: "Arroz", goal: 100, received: 20 },
      { item: "Feijão", goal: 10, received: 10 },
      { item: "Antigo", goal: 10, received: 0, active: false },
    ],
  };
  const text = campaignMessage(c, { value_proposition: "Ajude a comunidade" });
  assert.match(text, /Arroz/);
  assert.doesNotMatch(text, /Feijão|Antigo/);
  assert.match(text, /20\/12\/2026/);
  assert.equal(campaignUrl(c, "whatsapp", "https://example.test"), null);
  const url = new URL(
    campaignUrl({ ...c, published: true }, "whatsapp", "https://example.test"),
  );
  assert.equal(url.pathname, "/campanhas/c1");
  assert.equal(url.searchParams.get("utm_source"), "whatsapp");
});
