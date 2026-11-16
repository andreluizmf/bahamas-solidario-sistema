import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeSearch,
  fieldError,
  unsavedEditors,
  confirmNavigation,
} from "../src/lib/ux.js";
test("busca aceita acentos, caixa e espaços externos", () => {
  assert.equal(
    normalizeSearch("  DOAÇÕES de agasalhos "),
    "doacoes de agasalhos",
  );
  assert.equal(normalizeSearch(), "");
});
test("validação apresenta instruções para corrigir o campo", () => {
  assert.equal(
    fieldError({ validity: { valueMissing: true } }, "Nome da campanha"),
    "Preencha nome da campanha.",
  );
  assert.match(
    fieldError({ type: "email", validity: { typeMismatch: true } }),
    /e-mail válido/,
  );
  assert.match(
    fieldError({ type: "date", validity: { rangeUnderflow: true } }),
    /anterior ao início/,
  );
  assert.equal(fieldError({ validity: { valid: true } }), "");
});
test("navegação só pede descarte quando existe editor com mudanças", () => {
  const previous = globalThis.window;
  let calls = 0;
  globalThis.window = {
    confirm: () => {
      calls++;
      return false;
    },
  };
  try {
    unsavedEditors.clear();
    assert.equal(confirmNavigation(), true);
    assert.equal(calls, 0);
    unsavedEditors.add("editor");
    assert.equal(confirmNavigation(), false);
    assert.equal(calls, 1);
    globalThis.window.confirm = () => true;
    assert.equal(confirmNavigation(), true);
  } finally {
    unsavedEditors.clear();
    globalThis.window = previous;
  }
});
