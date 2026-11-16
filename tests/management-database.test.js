import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
test("administração e marketing persistem com isolamento e validação", async (t) => {
  const db = new PGlite(),
    admin = "11111111-1111-4111-8111-111111111111",
    outsider = "22222222-2222-4222-8222-222222222222",
    campaign = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const tables = [
    "campaign_plans",
    "management_tasks",
    "campaign_expenses",
    "marketing_actions",
  ];
  try {
    await db.exec(
      `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;insert into auth.users values('${admin}'),('${outsider}');`,
    );
    for (const file of [
      "202611150001_platform.sql",
      "20261116004916_administration_marketing.sql",
    ])
      await db.exec(
        await readFile(
          new URL("../supabase/migrations/" + file, import.meta.url),
          "utf8",
        ),
      );
    await db.exec(
      `insert into public.administrators(user_id,name,email) values('${admin}','Equipe','admin@example.test');insert into public.campaigns(id,name,category,ends_on) values('${campaign}','Campanha teste','Alimentos','2027-12-31');`,
    );
    const role = async (name, id = "") => {
      await db.exec("reset role");
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
        id,
      ]);
      await db.exec(`set role ${name}`);
    };
    await t.test(
      "público não lê planos, tarefas, gastos ou métricas",
      async () => {
        await role("anon");
        for (const table of tables)
          await assert.rejects(
            db.query(`select * from public.${table}`),
            /permission denied/,
          );
      },
    );
    await t.test(
      "conta autenticada sem autorização não cria plano",
      async () => {
        await role("authenticated", outsider);
        for (const table of tables)
          assert.equal(
            (await db.query(`select * from public.${table}`)).rows.length,
            0,
          );
        await assert.rejects(
          db.query(
            "insert into public.campaign_plans(campaign_id) values($1)",
            [campaign],
          ),
          /row-level security/,
        );
      },
    );
    await role("authenticated", admin);
    const plan = (
      await db.query(
        "insert into public.campaign_plans(campaign_id,objective,budget) values($1,'Objetivo interno',100) returning *",
        [campaign],
      )
    ).rows[0];
    let task;
    await t.test(
      "plano, tarefa, gasto e divulgação são persistidos e auditados",
      async () => {
        task = (
          await db.query(
            "insert into public.management_tasks(campaign_id,title,deadline,status) values($1,'Separar alimentos',current_date,'done') returning *",
            [campaign],
          )
        ).rows[0];
        assert.ok(task.completed_on);
        await db.query(
          "insert into public.campaign_expenses(campaign_id,description,amount) values($1,'Material de coleta',50)",
          [campaign],
        );
        await db.query(
          "insert into public.marketing_actions(campaign_id,title,channel,publish_on,status,reach,clicks,cost) values($1,'Aviso na loja','loja',current_date,'published',100,10,20)",
          [campaign],
        );
        for (const table of tables)
          assert.equal(
            (await db.query(`select * from public.${table}`)).rows.length,
            1,
          );
        const audit = (
          await db.query(
            "select * from public.audit_log where entity = any($1)",
            [tables],
          )
        ).rows;
        assert.equal(audit.length, 4);
        assert.ok(!JSON.stringify(audit).includes("Objetivo interno"));
      },
    );
    await t.test(
      "valores negativos, resultados em rascunho e publicação futura são rejeitados",
      async () => {
        await assert.rejects(
          db.query("update public.campaign_plans set budget=-1 where id=$1", [
            plan.id,
          ]),
          /check constraint/,
        );
        await assert.rejects(
          db.query(
            "insert into public.marketing_actions(campaign_id,title,channel,publish_on,reach) values($1,'Rascunho indevido','email',current_date,50)",
            [campaign],
          ),
          /published_results_only/,
        );
        await assert.rejects(
          db.query(
            "insert into public.marketing_actions(campaign_id,title,channel,publish_on,status) values($1,'Publicação futura','email',current_date+1,'published')",
            [campaign],
          ),
          /publication_not_future/,
        );
      },
    );
    await t.test(
      "atualização com versão antiga não sobrescreve e reabertura limpa conclusão",
      async () => {
        await db.query(
          "update public.campaign_plans set objective='Revisado' where id=$1",
          [plan.id],
        );
        assert.equal(
          (
            await db.query(
              "update public.campaign_plans set objective='Antigo' where id=$1 and updated_at=$2 returning id",
              [plan.id, plan.updated_at],
            )
          ).rows.length,
          0,
        );
        assert.equal(
          (
            await db.query(
              "update public.management_tasks set status='doing' where id=$1 returning completed_on",
              [task.id],
            )
          ).rows[0].completed_on,
          null,
        );
        for (const table of tables)
          await assert.rejects(
            db.query(`delete from public.${table}`),
            /permission denied/,
          );
      },
    );
    await t.test(
      "revogação de administrador bloqueia acesso aos novos registros",
      async () => {
        await role("postgres");
        await db.query("delete from public.administrators where user_id=$1", [
          admin,
        ]);
        await role("authenticated", admin);
        for (const table of tables)
          assert.equal(
            (await db.query(`select * from public.${table}`)).rows.length,
            0,
          );
      },
    );
  } finally {
    await db.close();
  }
});
