import test from "node:test";
import assert from "node:assert/strict";
import { authReturnUrl } from "../src/lib/auth-return.js";

test("convites e recuperação abrem a definição de senha preservando o fragmento para o SDK", () => {
  for (const type of ["invite", "recovery"]) {
    const hash = `#access_token=token-de-teste&type=${type}`;
    assert.equal(authReturnUrl({ hash }), `/admin/nova-senha${hash}`);
  }
  assert.equal(authReturnUrl({ hash: "#type=signup" }), null);
  assert.equal(authReturnUrl({ hash: "", search: "?pagina=1" }), null);
});
