import test from "node:test";
import assert from "node:assert/strict";
import {
  csv,
  date,
  decorateCampaigns,
  effectiveStatus,
  progress,
} from "../src/lib/domain.js";

test("progresso usa a média por meta sem misturar kg e unidades", () => {
  assert.equal(
    progress({
      needs: [
        { goal: 100, received: 200 },
        { goal: 20, received: 0 },
      ],
    }),
    50,
  );
  assert.equal(progress({ needs: [] }), 0);
  assert.equal(
    progress({
      needs: [
        { goal: 100, received: 100, active: false },
        { goal: 10, received: 0 },
      ],
    }),
    0,
  );
});
test("somente doações recebidas aumentam o progresso", () => {
  const [campaign] = decorateCampaigns(
    [{ id: "c", campaign_needs: [{ id: "n", goal: 10 }] }],
    [
      { need_id: "n", quantity: 3, status: "received" },
      { need_id: "n", quantity: 5, status: "pending" },
      { need_id: "n", quantity: 2, status: "cancelled" },
    ],
  );
  assert.equal(campaign.needs[0].received, 3);
  assert.equal(progress(campaign), 30);
});
test("CSV protege células com fórmulas e mantém quantidades numéricas", () => {
  const result = csv([
    ['=HYPERLINK("x")', "+teste", "@SUM(1)", "-texto", 12.5],
  ]);
  assert.match(result, /'=HYPERLINK/);
  assert.match(result, /'\+teste/);
  assert.match(result, /'@SUM/);
  assert.match(result, /'-texto/);
  assert.match(result, /"12.5"/);
});
test("datas não retrocedem um dia no fuso brasileiro", () => {
  assert.equal(date("2026-08-30"), "30/08/2026");
  assert.equal(
    effectiveStatus({
      status: "active",
      starts_on: "2000-01-01",
      ends_on: "2001-01-01",
    }),
    "closed",
  );
  assert.equal(
    effectiveStatus({
      status: "active",
      starts_on: "2099-01-01",
      ends_on: "2099-12-31",
    }),
    "planned",
  );
});
