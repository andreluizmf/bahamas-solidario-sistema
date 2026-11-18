// Authentication and admin authorization are checked before using privileged APIs.
export function createTeamHandler({ createClient, env }) {
  return async function handle(req) {
    const site = env("SITE_URL")?.replace(/\/$/, "");
    const headers = {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": site || "",
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      Vary: "Origin",
    };
    const reply = (body, status = 200) =>
      new Response(JSON.stringify(body), { status, headers });
    if (!site)
      return reply(
        {
          error:
            "O endereço do portal não foi configurado no serviço de convites.",
        },
        503,
      );
    if (req.headers.get("origin") && req.headers.get("origin") !== site)
      return reply({ error: "Origem não autorizada." }, 403);
    if (req.method === "OPTIONS")
      return new Response(null, { status: 204, headers });
    if (req.method !== "POST")
      return reply({ error: "Método não permitido." }, 405);
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token)
      return reply(
        { error: "Entre novamente no painel antes de adicionar uma pessoa." },
        401,
      );
    try {
      let keys = {};
      try {
        keys = JSON.parse(env("SUPABASE_SECRET_KEYS") || "{}");
      } catch {
        /* A legacy key may still be configured. */
      }
      const serverKey =
        env("SUPABASE_SERVICE_ROLE_KEY") ||
        Object.values(keys).find((k) => typeof k === "string");
      if (!serverKey || !env("SUPABASE_URL"))
        return reply(
          { error: "O serviço de convites está sem configuração de servidor." },
          503,
        );
      const db = createClient(env("SUPABASE_URL"), serverKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const {
        data: { user },
        error: authError,
      } = await db.auth.getUser(token);
      if (authError || !user)
        return reply(
          { error: "Sua sessão expirou. Entre novamente no painel." },
          401,
        );
      const { data: admin, error: roleError } = await db
        .from("administrators")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (roleError)
        return reply(
          {
            error:
              "Não foi possível verificar sua autorização. Tente novamente.",
          },
          503,
        );
      if (!admin)
        return reply({ error: "Acesso administrativo necessário." }, 403);
      const text = await req.text();
      if (text.length > 2000)
        return reply({ error: "Requisição muito grande." }, 413);
      let body;
      try {
        body = JSON.parse(text);
      } catch {
        return reply({ error: "Dados do convite inválidos." }, 400);
      }
      if (!body || typeof body !== "object" || Array.isArray(body))
        return reply({ error: "Dados do convite inválidos." }, 400);
      const email =
        typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const name = typeof body.name === "string" ? body.name.trim() : "";
      const delivery = body.delivery || "email";
      if (
        body.action !== "invite" ||
        !["email", "link"].includes(delivery) ||
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        name.length < 2 ||
        name.length > 100
      )
        return reply({ error: "Informe um nome e um e-mail válidos." }, 400);
      // Resolve existing accounts without changing their password or bypassing email confirmation.
      let existing = null,
        complete = false;
      for (let page = 1; page <= 25; page++) {
        const { data, error } = await db.auth.admin.listUsers({
          page,
          perPage: 200,
        });
        if (error)
          return reply(
            { error: "Não foi possível consultar as contas. Tente novamente." },
            502,
          );
        existing = data.users.find((u) => u.email?.toLowerCase() === email);
        if (existing || data.users.length < 200) {
          complete = true;
          break;
        }
      }
      if (!complete)
        return reply(
          {
            error:
              "Não foi possível localizar a conta com segurança. Procure o responsável técnico.",
          },
          503,
        );
      if (existing) {
        const { data: authorized, error } = await db
          .from("administrators")
          .select("user_id")
          .eq("user_id", existing.id)
          .maybeSingle();
        if (error)
          return reply(
            { error: "Não foi possível conferir o acesso dessa pessoa." },
            503,
          );
        if (authorized)
          return reply({
            ok: true,
            delivery: "existing",
            alreadyAdmin: true,
            email,
            name,
          });
        if (
          existing.banned_until &&
          new Date(existing.banned_until) > new Date()
        )
          return reply(
            {
              error:
                "Esta conta está suspensa. O convite não altera essa restrição.",
            },
            409,
          );
      }
      const authorize = async (target) => {
        if (!target?.id || target.email?.toLowerCase() !== email)
          throw new Error("invalid_target");
        const { error } = await db
          .from("administrators")
          .insert({ user_id: target.id, email, name });
        if (error && error.code !== "23505")
          throw new Error("authorization_failed");
      };
      if (existing?.email_confirmed_at) {
        await authorize(existing);
        return reply({
          ok: true,
          delivery: "existing",
          alreadyAdmin: false,
          email,
          name,
        });
      }
      const invalidEmail = (error) =>
        error?.code === "email_address_invalid" ||
        /email address.*invalid/i.test(error?.message || "");
      const rejectedEmail = () =>
        reply(
          {
            error:
              "O Supabase recusou este endereço de e-mail. Confira a grafia, o domínio e use um endereço real e válido.",
          },
          400,
        );
      const redirectTo = `${site}/admin/nova-senha`;
      if (delivery === "email") {
        const { data, error } = await db.auth.admin.inviteUserByEmail(email, {
          redirectTo,
        });
        if (!error) {
          await authorize(data.user);
          return reply({ ok: true, delivery: "email", email, name });
        }
        if (invalidEmail(error)) return rejectedEmail();
        // SMTP restrictions must not leave the administrator without a usable invitation.
      }
      let generated = await db.auth.admin.generateLink({
        type: "invite",
        email,
        options: { redirectTo },
      });
      if (invalidEmail(generated.error)) return rejectedEmail();
      if (generated.error && existing && !existing.email_confirmed_at) {
        generated = await db.auth.admin.generateLink({
          type: "recovery",
          email,
          options: { redirectTo },
        });
      }
      if (invalidEmail(generated.error)) return rejectedEmail();
      if (generated.error || !generated.data?.properties?.action_link)
        return reply(
          {
            error:
              "Não foi possível gerar o convite. Nenhum novo acesso foi autorizado. Tente novamente.",
          },
          502,
        );
      const invitationUrl = generated.data.properties.action_link;
      const parsed = new URL(invitationUrl);
      if (
        parsed.origin !== new URL(env("SUPABASE_URL")).origin ||
        parsed.pathname !== "/auth/v1/verify" ||
        parsed.searchParams.get("redirect_to") !== redirectTo
      )
        throw new Error("invalid_link");
      await authorize(generated.data.user);
      return reply({
        ok: true,
        delivery: "link",
        email,
        name,
        invitationUrl,
        emailFailed: delivery === "email",
      });
    } catch (error) {
      if (error?.message === "authorization_failed")
        return reply(
          {
            error:
              "A conta existe, mas a autorização não foi salva. Tente adicionar novamente; não é necessário apagar a conta.",
          },
          500,
        );
      return reply(
        {
          error: "O serviço não conseguiu concluir o convite. Tente novamente.",
        },
        500,
      );
    }
  };
}
