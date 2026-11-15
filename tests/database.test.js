import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("migração, regras de acesso e operações no PostgreSQL", async (t) => {
  const db = new PGlite();
  const admin = "11111111-1111-4111-8111-111111111111";
  const outsider = "22222222-2222-4222-8222-222222222222";
  const otherAdmin = "33333333-3333-4333-8333-333333333333";
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      insert into auth.users values('${admin}'),('${outsider}'),('${otherAdmin}');`);
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202611150001_platform.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    await db.query(
      "insert into public.administrators(user_id,name,email) values($1,$2,$3),($4,$5,$6)",
      [
        admin,
        "Admin",
        "admin@example.test",
        otherAdmin,
        "Equipe",
        "equipe@example.test",
      ],
    );
    const role = async (name, id = "") => {
      await db.exec("reset role");
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
        id,
      ]);
      await db.exec(`set role ${name}`);
    };
    const save = async (payload) =>
      (
        await db.query("select public.save_campaign($1::jsonb) id", [
          JSON.stringify(payload),
        ])
      ).rows[0].id;
    const payload = {
      name: "Mesa Cheia",
      category: "Alimentos",
      description: "Descrição pública",
      starts_on: "2026-01-01",
      ends_on: "2027-12-20",
      status: "active",
      published: true,
      needs: [{ item: "Arroz", goal: 100, unit: "kg" }],
    };
    let campaignId, needId;
    await t.test(
      "público não consegue ler doadores nem administradores",
      async () => {
        await role("anon");
        assert.deepEqual(
          (await db.query("select public.public_campaigns() data")).rows[0]
            .data,
          [],
        );
        await assert.rejects(
          db.query("select * from public.donations"),
          /permission denied/,
        );
        await assert.rejects(
          db.query("select * from public.administrators"),
          /permission denied/,
        );
        await assert.rejects(save(payload), /permission denied/);
      },
    );
    await t.test(
      "conta autenticada sem autorização não administra nem escala privilégios",
      async () => {
        await role("authenticated", outsider);
        assert.equal(
          (await db.query("select * from public.donations")).rows.length,
          0,
        );
        await assert.rejects(save(payload), /Acesso negado/);
        await assert.rejects(
          db.query(
            "insert into public.administrators(user_id,name,email) values($1,$2,$3)",
            [outsider, "Intruso", "x@example.test"],
          ),
          /permission denied/,
        );
      },
    );
    await t.test(
      "administrador salva campanha e itens atomicamente",
      async () => {
        await role("authenticated", admin);
        campaignId = await save(payload);
        needId = (
          await db.query(
            "select id from public.campaign_needs where campaign_id=$1",
            [campaignId],
          )
        ).rows[0].id;
        assert.ok(needId);
        await assert.rejects(
          save({
            ...payload,
            name: "Inválida",
            needs: [{ item: "Arroz", goal: -1, unit: "kg" }],
          }),
          /check constraint/,
        );
        assert.equal(
          (
            await db.query(
              "select count(*) n from public.campaigns where name='Inválida'",
            )
          ).rows[0].n,
          0,
        );
        await assert.rejects(save({ ...payload, needs: [] }), /entre 1 e 50/);
      },
    );
    await t.test(
      "recebidas contam; pendentes não contam; auditoria não copia dados pessoais",
      async () => {
        await db.query(
          "insert into public.donations(need_id,quantity,donor_name,donor_contact,status) values($1,25,$2,$3,$4),($1,20,$2,$3,$5)",
          [needId, "Doador privado", "contato privado", "received", "pending"],
        );
        const audit = await db.query(
          "select * from public.audit_log where entity='donations'",
        );
        assert.equal(audit.rows.length, 2);
        assert.ok(!JSON.stringify(audit.rows).includes("Doador privado"));
        await role("anon");
        const output = (await db.query("select public.public_campaigns() data"))
          .rows[0].data;
        assert.equal(output[0].needs[0].received, 25);
        assert.equal(output[0].donation_count, 1);
        assert.ok(!JSON.stringify(output).includes("privado"));
        await assert.rejects(
          db.query("update public.site_settings set about='Ataque'"),
          /permission denied/,
        );
      },
    );
    await t.test(
      "editar com versão antiga não sobrescreve alterações",
      async () => {
        await role("authenticated", admin);
        await assert.rejects(
          save({
            ...payload,
            id: campaignId,
            updated_at: "2020-01-01",
            needs: [{ id: needId, item: "Arroz", goal: 100, unit: "kg" }],
          }),
          /alterada por outra pessoa/,
        );
      },
    );
    await t.test("item com doações não pode mudar de unidade", async () => {
      const c = (
        await db.query("select * from public.campaigns where id=$1", [
          campaignId,
        ])
      ).rows[0];
      await assert.rejects(
        save({
          ...c,
          needs: [{ id: needId, item: "Arroz", goal: 100, unit: "unidades" }],
        }),
        /mantém o nome e a unidade/,
      );
    });
    await t.test("arquivar tira do portal e preserva doações", async () => {
      const c = (
        await db.query("select * from public.campaigns where id=$1", [
          campaignId,
        ])
      ).rows[0];
      await save({
        ...c,
        status: "archived",
        needs: [{ id: needId, item: "Arroz", goal: 100, unit: "kg" }],
      });
      await role("anon");
      assert.equal(
        (await db.query("select public.public_campaigns() data")).rows[0].data
          .length,
        0,
      );
      await role("authenticated", admin);
      assert.equal(
        (await db.query("select * from public.donations")).rows.length,
        2,
      );
      await assert.rejects(
        db.query("delete from public.donations"),
        /permission denied/,
      );
    });
    await t.test(
      "importação preserva registros anteriores e bloqueia duplicação",
      async () => {
        const legacy = {
          campaigns: [
            {
              id: "a",
              name: "Inverno Solidário",
              category: "Agasalhos",
              status: "Concluída",
              end: "2026-08-30",
              needs: [{ item: "Casacos", goal: 50, unit: "unidades" }],
            },
          ],
          donations: [
            {
              campaign: "a",
              item: "Casacos",
              quantity: 2,
              unit: "unidades",
              status: "Recebida",
            },
          ],
        };
        await db.query("select public.import_legacy($1::jsonb)", [
          JSON.stringify(legacy),
        ]);
        assert.equal(
          (
            await db.query(
              "select published from public.campaigns where name='Inverno Solidário'",
            )
          ).rows[0].published,
          false,
        );
        assert.equal(
          (await db.query("select * from public.donations")).rows.length,
          3,
        );
        await assert.rejects(
          db.query("select public.import_legacy($1::jsonb)", [
            JSON.stringify(legacy),
          ]),
          /já foi importado/,
        );
      },
    );
    await t.test(
      "não permite revogar o próprio acesso e revogação bloqueia novas leituras",
      async () => {
        await assert.rejects(
          db.query("select public.remove_administrator($1)", [admin]),
          /próprio acesso/,
        );
        await db.query("select public.remove_administrator($1)", [otherAdmin]);
        await role("authenticated", otherAdmin);
        assert.equal(
          (await db.query("select * from public.donations")).rows.length,
          0,
        );
        await assert.rejects(save(payload), /Acesso negado/);
      },
    );
  } finally {
    await db.close();
  }
});
