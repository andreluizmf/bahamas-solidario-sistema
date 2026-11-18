import test from "node:test";
import assert from "node:assert/strict";
import { createTeamHandler } from "../supabase/functions/manage-team/handler.js";
import { invokeTeamInvitation } from "../src/lib/team.js";
const site = "https://portal.example.test",
  project = "https://project.supabase.co";
function setup(options = {}) {
  const calls = [];
  const link = `${project}/auth/v1/verify?token=fake-test-token&type=invite&redirect_to=${encodeURIComponent(site + "/admin/nova-senha")}`;
  const target = options.existing || {
    id: "new-user",
    email: "person@example.test",
  };
  const db = {
    auth: {
      getUser: async () => ({
        data: { user: options.invalidSession ? null : { id: "caller" } },
        error: null,
      }),
      admin: {
        listUsers: async () => {
          calls.push("list");
          return {
            data: { users: options.existing ? [options.existing] : [] },
            error: null,
          };
        },
        inviteUserByEmail: async () => {
          calls.push("email");
          return options.invalidEmail
            ? {
                data: {},
                error: {
                  code: "email_address_invalid",
                  message: "Email address is invalid",
                },
              }
            : options.emailFails
              ? { data: {}, error: { message: "Email address not authorized" } }
              : { data: { user: target }, error: null };
        },
        generateLink: async (params) => {
          calls.push("link:" + params.type);
          return options.invalidEmail
            ? {
                data: {},
                error: {
                  code: "email_address_invalid",
                  message: "Email address is invalid",
                },
              }
            : options.linkFails
              ? { data: {}, error: { message: "Failure" } }
              : {
                  data: { user: target, properties: { action_link: link } },
                  error: null,
                };
        },
      },
    },
    from: () => ({
      select: () => ({
        eq: (_key, id) => ({
          maybeSingle: async () => ({
            data:
              id === "caller"
                ? options.notAdmin
                  ? null
                  : { user_id: id }
                : options.alreadyAdmin
                  ? { user_id: id }
                  : null,
            error: null,
          }),
        }),
      }),
      insert: async (value) => {
        calls.push({ insert: value });
        return {
          error: options.insertFails ? { code: "database_error" } : null,
        };
      },
    }),
  };
  const env = (k) =>
    ({
      SITE_URL: site,
      SUPABASE_URL: project,
      SUPABASE_SERVICE_ROLE_KEY: "test-server-key",
    })[k];
  const handler = createTeamHandler({ createClient: () => db, env });
  const invoke = (
    body = {
      action: "invite",
      name: "Person",
      email: "person@example.test",
      delivery: "link",
    },
    headers = {},
  ) =>
    handler(
      new Request(site + "/functions/manage-team", {
        method: "POST",
        headers: {
          origin: site,
          authorization: "Bearer test-session",
          "content-type": "application/json",
          ...headers,
        },
        body: JSON.stringify(body),
      }),
    );
  return { calls, invoke, link, handler };
}
test("convites exigem sessão válida e autorização administrativa", async () => {
  for (const options of [{ invalidSession: true }, { notAdmin: true }]) {
    const s = setup(options);
    const r = await s.invoke();
    assert.equal(r.status, options.invalidSession ? 401 : 403);
    assert.equal(s.calls.length, 0);
  }
  const s = setup();
  assert.equal(
    (await s.invoke(undefined, { origin: "https://other.test" })).status,
    403,
  );
  assert.equal(s.calls.length, 0);
});
test("convite por link autoriza somente a conta do e-mail solicitado e não envia e-mail", async () => {
  const s = setup();
  const r = await s.invoke({
    action: "invite",
    name: " Person ",
    email: " PERSON@example.test ",
    delivery: "link",
  });
  const data = await r.json();
  assert.equal(data.delivery, "link");
  assert.equal(data.invitationUrl, s.link);
  assert.equal(r.headers.get("cache-control"), "no-store");
  assert.deepEqual(s.calls, [
    "list",
    "link:invite",
    {
      insert: {
        user_id: "new-user",
        name: "Person",
        email: "person@example.test",
      },
    },
  ]);
});
test("falha de e-mail retorna alternativa utilizável sem simular envio", async () => {
  const s = setup({ emailFails: true });
  const data = await (
    await s.invoke({
      action: "invite",
      name: "Person",
      email: "person@example.test",
      delivery: "email",
    })
  ).json();
  assert.equal(data.delivery, "link");
  assert.equal(data.emailFailed, true);
  assert.ok(s.calls.includes("email"));
  assert.ok(s.calls.includes("link:invite"));
});
test("envio por e-mail só é confirmado quando a API aceita a entrega", async () => {
  const s = setup();
  const data = await (
    await s.invoke({
      action: "invite",
      name: "Person",
      email: "person@example.test",
      delivery: "email",
    })
  ).json();
  assert.equal(data.delivery, "email");
  assert.equal(data.invitationUrl, undefined);
  assert.ok(!s.calls.includes("link:invite"));
});
test("conta confirmada existente recebe autorização sem redefinir senha nem gerar token", async () => {
  const s = setup({
    existing: {
      id: "existing-user",
      email: "person@example.test",
      email_confirmed_at: "2026-01-01",
    },
  });
  const data = await (await s.invoke()).json();
  assert.equal(data.delivery, "existing");
  assert.equal(data.invitationUrl, undefined);
  assert.equal(
    s.calls.filter((x) => typeof x === "string" && x !== "list").length,
    0,
  );
  assert.equal(s.calls[1].insert.user_id, "existing-user");
});
test("administrador já autorizado não é duplicado nem tem seus dados alterados", async () => {
  const s = setup({
    existing: { id: "existing-user", email: "person@example.test" },
    alreadyAdmin: true,
  });
  const data = await (await s.invoke()).json();
  assert.equal(data.alreadyAdmin, true);
  assert.deepEqual(s.calls, ["list"]);
});
test("falhas de geração e gravação não devolvem link privilegiado", async () => {
  for (const options of [{ linkFails: true }, { insertFails: true }]) {
    const s = setup(options);
    const r = await s.invoke();
    const data = await r.json();
    assert.ok(r.status >= 500);
    assert.equal(data.invitationUrl, undefined);
    if (options.linkFails)
      assert.ok(!s.calls.some((c) => typeof c === "object"));
  }
});
test("entrada inválida é rejeitada antes de consultar contas", async () => {
  const s = setup();
  for (const email of ["person@other@example.test", "bad", ""]) {
    const r = await s.invoke({
      action: "invite",
      name: "Person",
      email,
      delivery: "link",
    });
    assert.equal(r.status, 400);
  }
  assert.equal((await s.invoke(null)).status, 400);
  assert.equal(s.calls.length, 0);
});
test("cliente apresenta erro da função em vez de atribuir falha genérica à publicação", async () => {
  const client = {
    functions: {
      invoke: async () => ({
        data: null,
        error: {
          context: new Response(
            JSON.stringify({ error: "Sua sessão expirou." }),
            { status: 401 },
          ),
        },
      }),
    },
  };
  await assert.rejects(invokeTeamInvitation(client, {}), /Sua sessão expirou/);
});
test("cliente rejeita resposta antiga e aceita retorno de convite por link", async () => {
  const client = (data) => ({
    functions: { invoke: async () => ({ data, error: null }) },
  });
  await assert.rejects(
    invokeTeamInvitation(client({ ok: true }), {}),
    /precisa ser atualizado/,
  );
  assert.equal(
    (
      await invokeTeamInvitation(
        client({
          ok: true,
          delivery: "link",
          invitationUrl: "https://example.test",
        }),
        {},
      )
    ).delivery,
    "link",
  );
});

test("e-mail recusado pelo Auth mostra a causa e não autoriza acesso", async () => {
  for (const delivery of ["email", "link"]) {
    const s = setup({ invalidEmail: true });
    const r = await s.invoke({
      action: "invite",
      name: "Person",
      email: "person@example.test",
      delivery,
    });
    const data = await r.json();
    assert.equal(r.status, 400);
    assert.match(data.error, /recusou este endereço/);
    assert.ok(!s.calls.some((c) => typeof c === "object"));
  }
});
