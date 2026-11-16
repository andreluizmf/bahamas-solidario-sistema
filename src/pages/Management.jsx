import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Download,
  Copy,
  Target,
  ListChecks,
  Wallet,
  Megaphone,
  RefreshCw,
  ClipboardList,
} from "lucide-react";
import {
  Badge,
  Button,
  Empty,
  ErrorBox,
  Field,
  Form,
  FormSection,
  Loading,
  Metric,
  Modal,
  SectionHead,
} from "../components/ui";
import { csv, date, download, number, progress, today } from "../lib/domain";
import { configured, message } from "../lib/data";
import { getManagementData, saveManagement } from "../lib/management-data";
import {
  actionStatuses,
  campaignMessage,
  campaignUrl,
  channels,
  expenseCategories,
  managementSummary,
  marketingSummary,
  money,
  taskStatuses,
} from "../lib/management";

const blankData = () => ({
  campaign_plans: [],
  management_tasks: [],
  campaign_expenses: [],
  marketing_actions: [],
});
export const analysisFields = [
  ["why", "Por quê?", "Justificativa da campanha"],
  ["where", "Onde?", "Locais e recursos necessários"],
  ["how", "Como?", "Etapas, parcerias e forma de execução"],
  ["strengths", "Forças", "Recursos e capacidades da equipe"],
  ["weaknesses", "Fraquezas", "Limitações internas que precisam de atenção"],
  ["opportunities", "Oportunidades", "Condições externas que podem ajudar"],
  ["threats", "Ameaças", "Riscos externos e possíveis respostas"],
  ["product", "Causa e benefício", "Que necessidade a campanha atende?"],
  [
    "price",
    "Esforço de participação",
    "O que facilita ou dificulta contribuir?",
  ],
  [
    "place",
    "Acesso e distribuição",
    "Onde a comunidade participa e entrega os itens?",
  ],
  ["promotion", "Divulgação", "Canais, linguagem e chamada para ação"],
];
const defaults = (type, campaignId) =>
  ({
    campaign_plans: {
      campaign_id: campaignId,
      objective: "",
      responsible: "",
      audience: "",
      value_proposition: "",
      budget: 0,
      analysis: {},
    },
    management_tasks: {
      campaign_id: campaignId,
      title: "",
      responsible: "",
      deadline: today(),
      status: "todo",
      notes: "",
    },
    campaign_expenses: {
      campaign_id: campaignId,
      description: "",
      category: "operacao",
      amount: "",
      occurred_on: today(),
      status: "recorded",
    },
    marketing_actions: {
      campaign_id: campaignId,
      title: "",
      channel: "instagram",
      responsible: "",
      publish_on: today(),
      status: "draft",
      message: "",
      reach: 0,
      interactions: 0,
      clicks: 0,
      conversions: 0,
      cost: 0,
    },
  })[type];
const names = {
  campaign_plans: "Plano da campanha",
  management_tasks: "Tarefa da campanha",
  campaign_expenses: "Gasto operacional",
  marketing_actions: "Ação de divulgação",
};
export function ManagementEditor({ type, initial, busy, close, submit }) {
  const [value, setValue] = useState(initial),
    [error, setError] = useState("");
  const dirty = JSON.stringify(value) !== JSON.stringify(initial);
  const set = (key, next) => setValue((v) => ({ ...v, [key]: next }));
  const field = (key) => ({
    value: value[key] ?? "",
    onChange: (e) => set(key, e.target.value),
  });
  const input = (key, label, props = {}, hint) => (
    <Field key={key} label={label} hint={hint}>
      <input {...props} {...field(key)} />
    </Field>
  );
  const text = (key, label, max = 1500, hint) => (
    <Field key={key} label={label} hint={hint}>
      <textarea rows={3} maxLength={max} {...field(key)} />
    </Field>
  );
  const select = (key, label, options) => (
    <Field key={key} label={label}>
      <select {...field(key)}>
        {Object.entries(options).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
    </Field>
  );
  const analysisGroup = (title, items) => (
    <FormSection title={title}>
      <div className="form-grid">
        {items.map(([key, label, hint]) => (
          <Field key={key} label={label} hint={hint}>
            <textarea
              rows={3}
              maxLength={1500}
              value={value.analysis?.[key] || ""}
              onChange={(e) =>
                setValue((v) => ({
                  ...v,
                  analysis: { ...v.analysis, [key]: e.target.value },
                }))
              }
            />
          </Field>
        ))}
      </div>
    </FormSection>
  );
  return (
    <Modal
      title={names[type]}
      onClose={close}
      busy={busy}
      dirty={dirty}
      wide={type === "campaign_plans" || type === "marketing_actions"}
    >
      <Form
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          try {
            if (
              type === "marketing_actions" &&
              !["published", "cancelled"].includes(value.status) &&
              ["reach", "interactions", "clicks", "conversions"].some(
                (k) => Number(value[k]) > 0,
              )
            )
              throw new Error(
                "Resultados só podem ser informados em ações publicadas ou canceladas. Zere os indicadores ou revise a situação.",
              );
            await submit(value);
          } catch (err) {
            setError(message(err));
          }
        }}
      >
        <fieldset disabled={busy}>
          {type === "campaign_plans" && (
            <>
              <FormSection
                title="Objetivo e organização"
                description="Planeje um resultado específico e verificável. O prazo e as metas por item vêm do cadastro da campanha."
              >
                <div className="form-grid">
                  {text(
                    "objective",
                    "O que será feito? — Objetivo SMART",
                    1500,
                    "Descreva o resultado, a medida de sucesso e o prazo. Ex.: alcançar 100 kg de arroz até o encerramento.",
                  )}
                  {input("responsible", "Quem coordena?", { maxLength: 100 })}
                  {input("budget", "Quanto pode custar? — Orçamento (R$)", {
                    type: "number",
                    min: 0,
                    max: 100000000,
                    step: "0.01",
                    inputMode: "decimal",
                  })}
                </div>
              </FormSection>
              {analysisGroup(
                "Plano de ação — 5W2H",
                analysisFields.slice(0, 3),
              )}
              {analysisGroup(
                "Análise de cenário — SWOT",
                analysisFields.slice(3, 7),
              )}
              <FormSection title="Público e posicionamento">
                {text(
                  "audience",
                  "Público-alvo",
                  800,
                  "Indique segmentos e necessidades. Evite nomes ou informações pessoais de doadores.",
                )}
                {text(
                  "value_proposition",
                  "Proposta de valor",
                  1000,
                  "Por que participar desta campanha? Qual benefício coletivo ela busca?",
                )}
              </FormSection>
              {analysisGroup(
                "Marketing social — adaptação dos 4 Ps",
                analysisFields.slice(7),
              )}
            </>
          )}
          {type === "management_tasks" && (
            <FormSection title="Organização do trabalho">
              <div className="form-grid">
                {input("title", "Tarefa", {
                  required: true,
                  minLength: 3,
                  maxLength: 160,
                })}
                {input("responsible", "Responsável", { maxLength: 100 })}
                {input("deadline", "Prazo", { required: true, type: "date" })}
                {select("status", "Situação", taskStatuses)}
              </div>
              {text("notes", "Orientações e acompanhamento", 2000)}
            </FormSection>
          )}
          {type === "campaign_expenses" && (
            <FormSection
              title="Controle de recursos"
              description="Registre apenas gastos operacionais realizados. Custos de divulgação são informados nas ações de marketing para evitar contagem dupla."
            >
              <div className="form-grid">
                {input("description", "Descrição do gasto", {
                  required: true,
                  minLength: 3,
                  maxLength: 160,
                })}
                {select("category", "Categoria", expenseCategories)}
                {input("amount", "Valor realizado (R$)", {
                  required: true,
                  type: "number",
                  min: "0.01",
                  max: 100000000,
                  step: "0.01",
                  inputMode: "decimal",
                })}
                {input("occurred_on", "Data do gasto", {
                  required: true,
                  type: "date",
                  max: today(),
                })}
                {select("status", "Registro", {
                  recorded: "Válido",
                  cancelled: "Desconsiderado",
                })}
              </div>
              <p className="form-help">
                Desconsiderar corrige o registro sem apagar o histórico. Não
                inclui doações financeiras ou atribui valor aos produtos
                recebidos.
              </p>
            </FormSection>
          )}
          {type === "marketing_actions" && (
            <>
              <FormSection
                title="Calendário e mensagem"
                description="O agendamento organiza o trabalho da equipe. O sistema não publica automaticamente nas redes sociais."
              >
                <div className="form-grid">
                  {input("title", "Título da ação", {
                    required: true,
                    minLength: 3,
                    maxLength: 160,
                  })}
                  {select("channel", "Canal", channels)}
                  {input("publish_on", "Data de divulgação", {
                    required: true,
                    type: "date",
                    max: value.status === "published" ? today() : undefined,
                  })}
                  {input("responsible", "Responsável", { maxLength: 100 })}
                  {select("status", "Situação", actionStatuses)}
                </div>
                {text(
                  "message",
                  "Mensagem de divulgação",
                  3000,
                  "Revise o conteúdo, o prazo e o local antes de divulgar.",
                )}
              </FormSection>
              <FormSection title="Custo realizado">
                {input(
                  "cost",
                  "Valor efetivamente gasto (R$)",
                  {
                    type: "number",
                    min: 0,
                    max: 100000000,
                    step: "0.01",
                    inputMode: "decimal",
                  },
                  "O valor integra o custo da campanha, mesmo se a ação for cancelada. Não registre este gasto novamente na área de operação.",
                )}
              </FormSection>
              <FormSection
                title="Resultados informados pela equipe"
                description="Registre após a divulgação. Não há sincronização com plataformas nem atribuição automática das doações."
              >
                <div className="form-grid">
                  {[
                    ["reach", "Alcance informado"],
                    ["interactions", "Interações"],
                    ["clicks", "Cliques"],
                    ["conversions", "Participações atribuídas pela equipe"],
                  ].map(([key, label]) =>
                    input(key, label, {
                      type: "number",
                      min: 0,
                      max: 100000000,
                      step: 1,
                    }),
                  )}
                </div>
                {!["published", "cancelled"].includes(value.status) && (
                  <p className="form-help">
                    Para voltar ao rascunho ou agendamento, zere os resultados
                    registrados.
                  </p>
                )}
              </FormSection>
            </>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="form-actions sticky-actions">
            <Button type="button" variant="secondary" data-close-modal>
              Cancelar
            </Button>
            <Button type="submit" loading={busy}>
              Salvar{" "}
              {type === "campaign_plans"
                ? "plano"
                : type === "management_tasks"
                  ? "tarefa"
                  : type === "campaign_expenses"
                    ? "gasto"
                    : "ação"}
            </Button>
          </div>
        </fieldset>
      </Form>
    </Modal>
  );
}
function PlanReadout({ plan, campaign, edit, disabled, marketing }) {
  return (
    <section className="panel">
      <SectionHead
        title={
          marketing
            ? "Estratégia de marketing social"
            : "Planejamento da campanha"
        }
        text={
          marketing
            ? "Público-alvo, proposta de valor e formas de participação."
            : "Objetivo, plano de ação, responsáveis e cenário da campanha."
        }
        action={
          <Button variant="secondary" disabled={disabled} onClick={edit}>
            <Pencil size={16} />
            {plan.id ? "Editar plano" : "Criar plano"}
          </Button>
        }
      />
      {!plan.id ? (
        <Empty title="Defina o plano desta campanha">
          Organize o objetivo, a equipe, o orçamento e a estratégia antes de
          iniciar as ações.
        </Empty>
      ) : (
        <>
          <dl className="planning-facts">
            <div>
              <dt>{marketing ? "Público-alvo" : "Objetivo SMART"}</dt>
              <dd>
                {marketing
                  ? plan.audience || "Não definido"
                  : plan.objective || "Não definido"}
              </dd>
            </div>
            <div>
              <dt>{marketing ? "Proposta de valor" : "Responsável"}</dt>
              <dd>
                {marketing
                  ? plan.value_proposition || "Não definida"
                  : plan.responsible || "Não definido"}
              </dd>
            </div>
            <div>
              <dt>Prazo da campanha</dt>
              <dd>
                {date(campaign.starts_on)} a {date(campaign.ends_on)}
              </dd>
            </div>
            <div>
              <dt>
                {marketing ? "Indicador de mobilização" : "Metas da campanha"}
              </dt>
              <dd>
                {progress(campaign)}% das metas de itens; dados de recebimentos
                confirmados.
              </dd>
            </div>
          </dl>
          <div className={marketing ? "strategy-grid" : "swot-grid"}>
            {(marketing
              ? analysisFields.slice(7)
              : analysisFields.slice(0, 7)
            ).map(([key, label]) => (
              <article key={key}>
                <h3>{label}</h3>
                <p>{plan.analysis?.[key] || "Ainda não definido."}</p>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
export function ManagementWorkspace({
  mode,
  campaigns,
  records,
  disabled,
  busy,
  edit,
  notify,
  Link,
}) {
  const [selected, setSelected] = useState(
    campaigns.find((c) => c.status === "active")?.id || campaigns[0]?.id || "",
  );
  const campaign = campaigns.find((c) => c.id === selected) || campaigns[0];
  if (!campaign)
    return (
      <Empty
        title="Cadastre uma campanha primeiro"
        action={
          <Link to="/admin/campanhas" className="button primary">
            Organizar campanhas
          </Link>
        }
      >
        O planejamento e a divulgação são vinculados a uma campanha.
      </Empty>
    );
  return (
    <WorkspaceBody
      key={campaign.id + mode}
      mode={mode}
      campaign={campaign}
      campaigns={campaigns}
      select={setSelected}
      records={records}
      disabled={disabled}
      busy={busy}
      edit={edit}
      notify={notify}
    />
  );
}
function WorkspaceBody({
  mode,
  campaign,
  campaigns,
  select,
  records,
  disabled,
  busy,
  edit,
  notify,
}) {
  const marketing = mode === "marketing";
  const plan =
    records.campaign_plans.find((p) => p.campaign_id === campaign.id) ||
    defaults("campaign_plans", campaign.id);
  const tasks = records.management_tasks.filter(
      (t) => t.campaign_id === campaign.id,
    ),
    expenses = records.campaign_expenses.filter(
      (e) => e.campaign_id === campaign.id,
    ),
    actions = records.marketing_actions
      .filter((a) => a.campaign_id === campaign.id)
      .sort((a, b) => a.publish_on.localeCompare(b.publish_on));
  const summary = managementSummary(plan, tasks, expenses, actions, today()),
    metrics = marketingSummary(actions);
  const [channel, setChannel] = useState("whatsapp");
  const open = (type, value) =>
    edit(type, value || defaults(type, campaign.id));
  const copy = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      notify("Conteúdo copiado. Revise antes de divulgar.");
    } catch {
      notify(
        "Não foi possível copiar. Selecione o texto e copie pelo navegador.",
        "error",
      );
    }
  };
  const exportPlan = () =>
    download(
      `plano-${campaign.id}.txt`,
      [
        `PLANO DA CAMPANHA: ${campaign.name}`,
        `Objetivo SMART: ${plan.objective}`,
        `Coordenação: ${plan.responsible}`,
        `Prazo: ${date(campaign.starts_on)} a ${date(campaign.ends_on)}`,
        `Público: ${plan.audience}`,
        `Proposta de valor: ${plan.value_proposition}`,
        ...analysisFields.map(
          ([key, label]) =>
            `${label}: ${plan.analysis?.[key] || "Não definido"}`,
        ),
        `Orçamento: ${money(plan.budget)}`,
        `Gastos realizados: ${money(summary.spent)}`,
        `Tarefas concluídas: ${summary.done}/${summary.total}`,
        "\nACOMPANHAMENTO",
        ...tasks.map(
          (t) =>
            `${t.title} | ${taskStatuses[t.status]} | ${t.responsible || "Sem responsável"} | ${date(t.deadline)}`,
        ),
      ].join("\n\n"),
      "text/plain;charset=utf-8",
    );
  const exportActions = () =>
    download(
      `marketing-${campaign.id}.csv`,
      csv([
        [
          "Ação",
          "Canal",
          "Data",
          "Situação",
          "Responsável",
          "Alcance",
          "Interações",
          "Cliques",
          "Participações informadas",
          "Custo realizado (R$)",
        ],
        ...actions.map((a) => [
          a.title,
          channels[a.channel],
          a.publish_on,
          actionStatuses[a.status],
          a.responsible,
          Number(a.reach),
          Number(a.interactions),
          Number(a.clicks),
          Number(a.conversions),
          Number(a.cost),
        ]),
      ]),
    );
  return (
    <>
      <div className="workspace-toolbar">
        <Field label="Campanha em planejamento">
          <select
            value={campaign.id}
            disabled={busy}
            onChange={(e) => select(e.target.value)}
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.status === "archived" ? " — Arquivada" : ""}
              </option>
            ))}
          </select>
        </Field>
        <Button
          variant="secondary"
          onClick={marketing ? exportActions : exportPlan}
        >
          <Download size={16} />
          {marketing ? "Exportar divulgação" : "Exportar plano"}
        </Button>
      </div>
      <p className="workspace-privacy">
        Área interna. Planejamento, custos e resultados de divulgação não são
        exibidos no portal público.
      </p>
      {!marketing ? (
        <div className="admin-metrics management-metrics">
          <Metric
            label="Orçamento previsto"
            value={plan.id ? money(summary.budget) : "Não definido"}
            hint="Limite planejado da campanha"
            icon={Wallet}
          />
          <Metric
            label="Gasto realizado"
            value={money(summary.spent)}
            hint="Operação + divulgação, sem duplicar"
            icon={Wallet}
          />
          <Metric
            label="Tarefas concluídas"
            value={`${summary.done}/${summary.total}`}
            hint={`${summary.completion}% do trabalho planejado`}
            icon={ListChecks}
          />
          <Metric
            label="Tarefas em atraso"
            value={summary.overdue}
            hint="Pendentes com prazo anterior a hoje"
            icon={ClipboardList}
          />
        </div>
      ) : (
        <div className="admin-metrics management-metrics">
          <Metric
            label="Ações publicadas"
            value={metrics.published}
            hint="Somente status Publicada"
            icon={Megaphone}
          />
          <Metric
            label="Alcance informado"
            value={metrics.reach}
            hint="Soma por ação; pode repetir pessoas"
            icon={Target}
          />
          <Metric
            label="Interações"
            value={metrics.interactions}
            hint="Informadas manualmente pela equipe"
            icon={Target}
          />
          <Metric
            label="Participações atribuídas"
            value={metrics.conversions}
            hint="Registro manual, sem prova de causalidade"
            icon={ListChecks}
          />
        </div>
      )}
      <PlanReadout
        plan={plan}
        campaign={campaign}
        edit={() => open("campaign_plans", plan)}
        disabled={disabled || busy}
        marketing={marketing}
      />
      {!marketing ? (
        <>
          <section className="panel">
            <SectionHead
              title="Execução e responsabilidades"
              text="Organize as tarefas e acompanhe o andamento. O cancelamento mantém o histórico."
              action={
                <Button
                  disabled={disabled || busy}
                  onClick={() => open("management_tasks")}
                >
                  <Plus size={16} />
                  Nova tarefa
                </Button>
              }
            />
            <div className="task-board">
              {Object.entries(taskStatuses).map(([status, label]) => (
                <section className="task-column" key={status}>
                  <h3>
                    {label}
                    <span>
                      {tasks.filter((t) => t.status === status).length}
                    </span>
                  </h3>
                  {tasks
                    .filter((t) => t.status === status)
                    .sort((a, b) => a.deadline.localeCompare(b.deadline))
                    .map((t) => (
                      <article key={t.id}>
                        <h4>{t.title}</h4>
                        <p>{t.responsible || "Responsável não definido"}</p>
                        <div className="inline spread">
                          <small>{date(t.deadline)}</small>
                          {t.deadline < today() &&
                            !["done", "cancelled"].includes(t.status) && (
                              <Badge tone="red">Em atraso</Badge>
                            )}
                          <button
                            className="icon-button"
                            disabled={disabled || busy}
                            aria-label={`Editar tarefa ${t.title}`}
                            onClick={() => open("management_tasks", t)}
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                      </article>
                    ))}
                  {!tasks.some((t) => t.status === status) && (
                    <p className="muted">Nenhuma tarefa.</p>
                  )}
                </section>
              ))}
            </div>
          </section>
          <section className="panel">
            <SectionHead
              title="Orçamento e uso de recursos"
              text="Compare o limite planejado com os gastos efetivamente informados."
              action={
                <Button
                  disabled={disabled || busy}
                  onClick={() => open("campaign_expenses")}
                >
                  <Plus size={16} />
                  Registrar gasto
                </Button>
              }
            />
            <div className="budget-breakdown">
              <span>
                Operação <strong>{money(summary.operational)}</strong>
              </span>
              <span>
                Divulgação <strong>{money(summary.marketing)}</strong>
              </span>
              <span>
                {summary.balance < 0 ? "Acima do previsto" : "Saldo previsto"}{" "}
                <strong>
                  {plan.id
                    ? money(Math.abs(summary.balance))
                    : "Defina o orçamento"}
                </strong>
              </span>
            </div>
            {plan.id && summary.balance < 0 && (
              <p className="form-error" role="status">
                Os gastos registrados excedem o orçamento em{" "}
                {money(-summary.balance)}. Revise o plano e os recursos
                disponíveis.
              </p>
            )}
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Gasto operacional</th>
                    <th>Data</th>
                    <th>Valor</th>
                    <th>Registro</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id}>
                      <td>
                        {e.description}
                        <small>{expenseCategories[e.category]}</small>
                      </td>
                      <td>{date(e.occurred_on)}</td>
                      <td>{money(e.amount)}</td>
                      <td>
                        {e.status === "recorded" ? "Válido" : "Desconsiderado"}
                      </td>
                      <td>
                        <button
                          className="icon-button"
                          disabled={disabled || busy}
                          aria-label={`Editar gasto ${e.description}`}
                          onClick={() => open("campaign_expenses", e)}
                        >
                          <Pencil size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!expenses.length && (
              <Empty title="Nenhum gasto operacional registrado">
                Os custos de divulgação são registrados na área Marketing.
              </Empty>
            )}
          </section>
          <section className="explanation">
            <ListChecks size={24} />
            <div>
              <h3>Revisão e melhoria contínua — PDCA</h3>
              <p>
                Planeje o objetivo e os recursos; execute as tarefas; confira as
                metas, os prazos e o orçamento; registre ajustes no plano e nas
                observações das tarefas.
              </p>
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="panel">
            <SectionHead
              title="Calendário de divulgação"
              text="Datas, canais, mensagens e responsáveis. Agendar aqui não envia nem publica conteúdos."
              action={
                <Button
                  disabled={disabled || busy}
                  onClick={() => open("marketing_actions")}
                >
                  <Plus size={16} />
                  Nova ação
                </Button>
              }
            />
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Ação e canal</th>
                    <th>Responsável</th>
                    <th>Situação</th>
                    <th>Custo realizado</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {actions.map((a) => (
                    <tr key={a.id}>
                      <td>{date(a.publish_on)}</td>
                      <td>
                        {a.title}
                        <small>{channels[a.channel]}</small>
                      </td>
                      <td>{a.responsible || "Não definido"}</td>
                      <td>
                        <Badge tone={a.status === "published" ? "blue" : ""}>
                          {actionStatuses[a.status]}
                        </Badge>
                        {a.status === "scheduled" && a.publish_on < today() && (
                          <small>Revisar agendamento</small>
                        )}
                      </td>
                      <td>{money(a.cost)}</td>
                      <td>
                        <button
                          className="icon-button"
                          disabled={disabled || busy}
                          aria-label={`Editar divulgação ${a.title}`}
                          onClick={() => open("marketing_actions", a)}
                        >
                          <Pencil size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!actions.length && (
              <Empty title="Organize a primeira divulgação">
                Defina o canal, a mensagem e quem ficará responsável por
                publicá-la.
              </Empty>
            )}
          </section>
          <section className="panel">
            <SectionHead
              title="Material para divulgação"
              text="Modelo baseado nos dados da campanha e na proposta de valor. A equipe revisa e decide onde publicar."
            />
            <p className="form-help">
              Confira se a campanha está publicada e dentro do prazo antes de
              divulgar. O modelo é montado a partir dos campos cadastrados, sem
              geração por um serviço de IA.
            </p>
            <pre className="message-preview">
              {campaignMessage(campaign, plan)}
            </pre>
            <div className="quick-actions">
              <Button
                variant="secondary"
                onClick={() => copy(campaignMessage(campaign, plan))}
              >
                <Copy size={16} />
                Copiar mensagem
              </Button>
              <Button
                disabled={disabled || busy}
                onClick={() =>
                  open("marketing_actions", {
                    ...defaults("marketing_actions", campaign.id),
                    title: `Divulgação — ${campaign.name}`.slice(0, 160),
                    message: campaignMessage(campaign, plan),
                  })
                }
              >
                <Plus size={16} />
                Criar rascunho com modelo
              </Button>
            </div>
            <div className="link-builder">
              <Field label="Canal do link">
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                >
                  {Object.entries(channels).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
              <Button
                variant="secondary"
                disabled={!campaign.published}
                onClick={() =>
                  copy(campaignUrl(campaign, channel, window.location.origin))
                }
              >
                <Copy size={16} />
                Copiar link da campanha
              </Button>
            </div>
            <p className="form-help">
              {campaign.published
                ? "O link usa parâmetros UTM para identificar o canal em ferramentas compatíveis. Este portal não rastreia acessos nem calcula atribuição automaticamente."
                : "Publique a campanha para disponibilizar um link público de divulgação."}
            </p>
          </section>
          <section className="panel">
            <SectionHead
              title="Avaliação da divulgação"
              text="Cálculos sobre ações marcadas como Publicada. Alcances de ações diferentes podem incluir as mesmas pessoas."
            />
            <div className="budget-breakdown">
              <span>
                Interações / alcance{" "}
                <strong>
                  {metrics.engagement === null
                    ? "Sem base"
                    : `${number(metrics.engagement)}%`}
                </strong>
              </span>
              <span>
                Cliques / alcance{" "}
                <strong>
                  {metrics.ctr === null
                    ? "Sem base"
                    : `${number(metrics.ctr)}%`}
                </strong>
              </span>
              <span>
                Custo por participação informada{" "}
                <strong>
                  {metrics.costPerConversion === null
                    ? "Sem base"
                    : money(metrics.costPerConversion)}
                </strong>
              </span>
            </div>
            <p className="form-help">
              Participações atribuídas são informadas pela equipe e não
              equivalem às doações confirmadas no sistema. Estes indicadores não
              comprovam que uma ação de marketing causou uma doação.
            </p>
          </section>
        </>
      )}
    </>
  );
}
export default function Management({ mode, campaigns, notify, Link }) {
  return (
    <CampaignWorkspace
      mode={mode}
      campaigns={campaigns}
      notify={notify}
      Link={Link}
    />
  );
}
function CampaignWorkspace({ mode, campaigns, notify, Link }) {
  const [campaignId, setCampaignId] = useState(
    campaigns.find((c) => c.status === "active")?.id || campaigns[0]?.id || "",
  );
  const [records, setRecords] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [modal, setModal] = useState(null),
    [version, setVersion] = useState(0);
  useEffect(() => {
    if (!campaigns.some((c) => c.id === campaignId))
      setCampaignId(campaigns[0]?.id || "");
  }, [campaigns, campaignId]);
  useEffect(() => {
    let active = true;
    setRecords(null);
    setError("");
    if (!campaignId) return;
    if (!configured) {
      setRecords(blankData());
      return;
    }
    getManagementData(campaignId)
      .then((r) => {
        if (active) setRecords(r);
      })
      .catch((e) => {
        if (active) setError(message(e));
      });
    return () => {
      active = false;
    };
  }, [campaignId, version]);
  const campaign = campaigns.find((c) => c.id === campaignId);
  if (!campaign)
    return (
      <Empty
        title="Cadastre uma campanha primeiro"
        action={
          <Link to="/admin/campanhas" className="button primary">
            Organizar campanhas
          </Link>
        }
      >
        O planejamento e a divulgação são vinculados a uma campanha.
      </Empty>
    );
  const edit = (type, initial) => setModal({ type, initial });
  const save = async (value) => {
    setBusy(true);
    try {
      await saveManagement(modal.type, value);
      setModal(null);
      setVersion((v) => v + 1);
      notify("Registro salvo no planejamento da campanha.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      {error ? (
        <ErrorBox error={error} retry={() => setVersion((v) => v + 1)} />
      ) : !records ? (
        <Loading />
      ) : (
        <WorkspaceBody
          key={campaign.id + mode}
          mode={mode}
          campaign={campaign}
          campaigns={campaigns}
          select={setCampaignId}
          records={records}
          disabled={!configured}
          busy={busy}
          edit={edit}
          notify={notify}
        />
      )}
      <div className="workspace-refresh">
        <Button
          variant="secondary"
          disabled={busy || Boolean(modal)}
          onClick={() => setVersion((v) => v + 1)}
        >
          <RefreshCw size={16} />
          Atualizar planejamento
        </Button>
      </div>
      {modal && (
        <ManagementEditor
          type={modal.type}
          initial={modal.initial}
          busy={busy}
          close={() => setModal(null)}
          submit={save}
        />
      )}
    </>
  );
}
