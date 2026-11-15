import test from "node:test";
import assert from "node:assert/strict";
import { authFlowType, authReturnUrl } from "../src/lib/auth-return.js";

test("convites e recuperação abrem a definição de senha preservando o fragmento para o SDK", () => {
  for (const type of ["invite", "recovery"]) {
    const hash = `#access_token=token-de-teste&type=${type}`;
    assert.equal(authReturnUrl({ hash }), `/admin/nova-senha${hash}`);
  }
  assert.equal(authReturnUrl({ hash: "#type=signup" }), null);
  assert.equal(authReturnUrl({ hash: "", search: "?pagina=1" }), null);
});

test("convite emitido pelo servidor aceita o retorno implícito, mantendo PKCE nos demais acessos", () => {
  assert.equal(
    authFlowType("#access_token=token-de-teste&type=invite"),
    "implicit",
  );
  assert.equal(
    authFlowType("#access_token=token-de-teste&type=recovery"),
    "implicit",
  );
  assert.equal(authFlowType("#type=invite"), "pkce");
  assert.equal(authFlowType(""), "pkce");
});
