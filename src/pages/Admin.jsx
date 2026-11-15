import React, { useEffect, useState } from "react";
import {
  Archive,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Download,
  ExternalLink,
  FileUp,
  Heart,
  History,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  Badge,
  Button,
  Empty,
  ErrorBox,
  Field,
  Loading,
  Metric,
  Modal,
  Paginated,
  Progress,
  SectionHead,
} from "../components/ui";
import {
  categories,
  csv,
  date,
  donationStatuses,
  download,
  effectiveStatus,
  emptyCampaign,
  number,
  progress,
  statuses,
  today,
} from "../lib/domain";
import {
  configured,
  defaultSettings,
  getAdminData,
  message,
  previewCampaigns,
  saveCampaign,
  saveDonation,
  saveSettings,
  supabase,
} from "../lib/data";

const tabs = [
  ["", "Visão geral", LayoutDashboard],
  ["campanhas", "Campanhas", Megaphone],
  ["doacoes", "Doações", Heart],
  ["necessidades", "Necessidades", Package],
  ["relatorios", "Relatórios", Download],
  ["conteudo", "Conteúdo do portal", Settings],
  ["equipe", "Equipe e acesso", Users],
  ["historico", "Histórico", History],
];
export default function Admin({
  path,
  Link: BaseLink,
  user,
  admin,
  notify,
  onSignOut,
}) {
  const Link = ({ to, ...props }) => (
    <BaseLink
      {...props}
      to={
        !configured && to.startsWith("/admin")
          ? to.replace("/admin", "/admin/previa")
          : to
      }
    />
  );
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState(null);
  const [mobile, setMobile] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("");
  const page = path.split("/")[2] || "";
  const active = tabs.find((t) => t[0] === page);
  const load = async () => {
    setError("");
    try {
      setData(
        configured
          ? await getAdminData()
          : {
              campaigns: previewCampaigns,
              donations: [],
              team: [],
              audit: [],
              settings: defaultSettings,
            },
      );
    } catch (e) {
      setError(message(e));
    }
  };
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    setQuery("");
    setFilter("");
    setCampaignFilter("");
    setMobile(false);
  }, [page]);
  const mutate = async (action, success) => {
    if (!configured) {
      notify(
        "A prévia é somente leitura. Conecte o Supabase para administrar.",
        "error",
      );
      return;
    }
    setBusy(true);
    try {
      await action();
      setModal(null);
      notify(success);
      await load();
    } catch (e) {
      notify(message(e), "error");
      throw e;
    } finally {
      setBusy(false);
    }
  };
  const changeCampaign = (c) =>
    setModal({ type: "campaign", value: structuredClone(c) });
  const findNeed = (id) =>
    data?.campaigns
      .flatMap((c) => c.needs.map((n) => ({ ...n, campaign: c })))
      .find((n) => n.id === id);
  const campaigns = data?.campaigns || [];
  const donations = data?.donations || [];
  const filteredCampaigns = campaigns.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) &&
      (!filter || (filter === "draft" ? !c.published : c.status === filter)),
  );
  const filteredDonations = donations.filter((d) => {
    const n = findNeed(d.need_id);
    return (
      `${d.donor_name} ${n?.item} ${n?.campaign.name}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!filter || d.status === filter) &&
      (!campaignFilter || n?.campaign.id === campaignFilter)
    );
  });
  const exportDonations = (records = filteredDonations) => {
    download(
      `doacoes-${today()}.csv`,
      csv([
        [
          "Campanha",
          "Item",
          "Quantidade",
          "Unidade",
          "Doador",
          "Contato",
          "Situação",
          "Data",
          "Observações",
        ],
        ...records.map((d) => {
          const n = findNeed(d.need_id);
          return [
            n?.campaign.name,
            n?.item,
            Number(d.quantity),
            n?.unit,
            d.donor_name,
            d.donor_contact,
            donationStatuses[d.status],
            date(d.donated_on),
            d.notes,
          ];
        }),
      ]),
    );
    notify("Relatório exportado. O arquivo contém dados internos de doadores.");
  };
  return (
    <div className="admin-layout">
      <a className="skip-link" href="#admin-main">
        Ir para o conteúdo
      </a>
      {mobile && (
        <div className="sidebar-shade" onClick={() => setMobile(false)} />
      )}
      <aside className={`admin-sidebar ${mobile ? "open" : ""}`}>
        <Link to="/" className="brand">
          <img src="/logo2.png" alt="Grupo Bahamas" />
          <span>
            Solidário<span className="brand-dot">.</span>
          </span>
        </Link>
        <div className="workspace-label">
          <ShieldCheck size={13} />
          ÁREA ADMINISTRATIVA
        </div>
        <nav aria-label="Administração">
          {tabs.map(([slug, label, I]) => (
            <Link
              key={slug}
              to={`/admin${slug ? "/" + slug : ""}`}
              className={page === slug ? "active" : ""}
              aria-current={page === slug ? "page" : undefined}
            >
              <I size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link to="/" className="sidebar-public">
            <ExternalLink size={16} />
            Ver portal público
          </Link>
          <div className="profile">
            <span>{(admin?.name || "PR").slice(0, 2).toUpperCase()}</span>
            <div>
              <strong>{admin?.name || "Prévia do painel"}</strong>
              <small>{user?.email || "Somente leitura"}</small>
            </div>
            {configured && (
              <button
                className="icon-button"
                aria-label="Sair da conta"
                onClick={onSignOut}
              >
                <LogOut size={17} />
              </button>
            )}
          </div>
        </div>
      </aside>
      <main className="admin-main" id="admin-main">
        <header className="admin-topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Abrir menu"
            onClick={() => setMobile(true)}
          >
            <Menu size={21} />
          </button>
          <div>
            <span>Administração</span>
            <span className="slash">/</span>
            <strong>{active?.[1] || "Página não encontrada"}</strong>
          </div>
          <div className="inline">
            <Badge tone="blue">
              {configured ? "Ambiente conectado" : "Prévia visual"}
            </Badge>
            <button
              className="icon-button"
              aria-label="Atualizar dados"
              onClick={load}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </header>
        <div className="admin-content">
          <div className="page-title">
            <div>
              <p className="eyebrow">BAHAMAS SOLIDÁRIO · GESTÃO</p>
              <h1>
                {page === ""
                  ? `Olá, ${(admin?.name || "equipe").split(" ")[0]}.`
                  : active?.[1] || "Página não encontrada"}
              </h1>
              <p className="muted">
                {page === ""
                  ? "Uma visão clara do cuidado que se transforma em ação."
                  : "Organize cada etapa com cuidado, clareza e transparência."}
              </p>
            </div>
            {(page === "campanhas" || page === "doacoes") && (
              <Button
                disabled={!configured}
                onClick={() =>
                  setModal({
                    type: page === "campanhas" ? "campaign" : "donation",
                    value:
                      page === "campanhas"
                        ? emptyCampaign()
                        : {
                            need_id: "",
                            quantity: "",
                            donor_name: "",
                            donor_contact: "",
                            notes: "",
                            status: "received",
                            donated_on: today(),
                          },
                  })
                }
              >
                <Plus size={17} />
                {page === "campanhas" ? "Nova campanha" : "Registrar doação"}
              </Button>
            )}
          </div>
          {!configured && (
            <div className="notice">
              <ShieldCheck size={18} />
              <span>
                Prévia somente leitura. Dados de exemplo. Login e alterações
                ficam disponíveis após configurar o Supabase.
              </span>
            </div>
          )}
          {error ? (
            <ErrorBox error={error} retry={load} />
          ) : !data ? (
            <Loading />
          ) : (
            <>
              {page === "" && (
                <>
                  <div className="admin-metrics">
                    <Metric
                      featured
                      icon={Megaphone}
                      label="Campanhas ativas"
                      value={
                        campaigns.filter((c) => effectiveStatus(c) === "active")
                          .length
                      }
                      hint="Iniciativas dentro do prazo"
                    />
                    <Metric
                      icon={CheckCircle2}
                      label="Doações recebidas"
                      value={
                        donations.filter((d) => d.status === "received").length
                      }
                      hint="Registros com recebimento confirmado"
                    />
                    <Metric
                      icon={Heart}
                      label="Aguardando recebimento"
                      value={
                        donations.filter((d) => d.status === "pending").length
                      }
                      hint="Doações que ainda precisam chegar"
                    />
                    <Metric
                      icon={Users}
                      label="Campanhas publicadas"
                      value={
                        campaigns.filter(
                          (c) => c.published && c.status !== "archived",
                        ).length
                      }
                      hint="Visíveis no portal público"
                    />
                  </div>
                  <div className="dashboard-grid">
                    <section className="panel">
                      <SectionHead
                        title="Campanhas em destaque"
                        text="O andamento das metas, sem perder nenhum detalhe."
                        action={
                          <Link to="/admin/campanhas" className="text-link">
                            Gerenciar
                            <ArrowRight size={15} />
                          </Link>
                        }
                      />
                      {campaigns
                        .filter((c) => c.status !== "archived")
                        .slice(0, 4)
                        .map((c) => (
                          <div key={c.id} className="campaign-row">
                            <div>
                              <strong>{c.name}</strong>
                              <span>
                                {c.category} · até {date(c.ends_on)}
                              </span>
                            </div>
                            <div>
                              <strong className="mono">{progress(c)}%</strong>
                              <Progress value={progress(c)} />
                            </div>
                          </div>
                        ))}
                      {!campaigns.length && (
                        <Empty title="Vamos começar?">
                          Cadastre sua primeira campanha para organizar as
                          necessidades.
                        </Empty>
                      )}
                    </section>
                    <section className="panel navy-panel">
                      <span className="eyebrow">O PRÓXIMO PASSO</span>
                      <HandHeartIcon />
                      <h2>
                        Uma gestão atenta.
                        <br />
                        Um impacto maior.
                      </h2>
                      <p>
                        {donations.filter((d) => d.status === "pending").length
                          ? "Confira as doações pendentes e mantenha as metas atualizadas."
                          : "Revise as campanhas, publique informações e acompanhe cada contribuição."}
                      </p>
                      <Link to="/admin/doacoes" className="button white">
                        Acompanhar doações
                        <ArrowRight size={16} />
                      </Link>
                    </section>
                  </div>
                  <section className="panel">
                    <SectionHead
                      title="Últimas doações"
                      text="A informação certa para acompanhar os recebimentos."
                    />
                    {donations.length ? (
                      <DonationTable
                        records={donations.slice(0, 5)}
                        findNeed={findNeed}
                        edit={(d) => setModal({ type: "donation", value: d })}
                      />
                    ) : (
                      <Empty title="Ainda não há doações registradas">
                        Os recebimentos aparecerão aqui assim que forem
                        cadastrados.
                      </Empty>
                    )}
                  </section>
                </>
              )}
              {page === "campanhas" && (
                <>
                  <div className="filters admin-filters">
                    <Field label="Buscar campanha">
                      <input
                        type="search"
                        placeholder="Nome da campanha"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </Field>
                    <Field label="Situação">
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                      >
                        <option value="">Todas</option>
                        <option value="draft">Não publicadas</option>
                        {Object.entries(statuses).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  {filteredCampaigns.length ? (
                    <div className="admin-campaign-grid">
                      {filteredCampaigns.map((c) => (
                        <article className="panel admin-campaign" key={c.id}>
                          <div className="inline spread">
                            <Badge tone="blue">{c.category}</Badge>
                            <Badge tone={c.published ? "" : "red"}>
                              {c.published ? "Publicada" : "Rascunho"}
                            </Badge>
                          </div>
                          <h2>{c.name}</h2>
                          <p className="muted clamp">
                            {c.description ||
                              "Adicione uma descrição para apresentar esta iniciativa no portal."}
                          </p>
                          <div className="progress-label">
                            <span>
                              {statuses[c.status]} · até {date(c.ends_on)}
                            </span>
                            <strong>{progress(c)}%</strong>
                          </div>
                          <Progress value={progress(c)} />
                          <div className="campaign-actions">
                            <Button
                              variant="secondary"
                              disabled={!configured}
                              onClick={() => changeCampaign(c)}
                            >
                              <Pencil size={14} />
                              Editar
                            </Button>
                            {c.published && c.status !== "archived" && (
                              <Link
                                to={`/campanhas/${c.id}`}
                                className="icon-button"
                                aria-label={`Ver ${c.name} no portal`}
                              >
                                <ExternalLink size={16} />
                              </Link>
                            )}
                            {c.status !== "archived" && (
                              <button
                                className="icon-button danger-text"
                                disabled={!configured}
                                aria-label={`Arquivar ${c.name}`}
                                onClick={() =>
                                  setModal({ type: "archive", value: c })
                                }
                              >
                                <Archive size={16} />
                              </button>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <Empty title="Nenhuma campanha encontrada">
                      Cadastre uma campanha ou ajuste os filtros.
                    </Empty>
                  )}
                </>
              )}
              {page === "doacoes" && (
                <section className="panel">
                  <div className="filters admin-filters">
                    <Field label="Buscar registro">
                      <input
                        type="search"
                        placeholder="Doador, item ou campanha"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </Field>
                    <Field label="Situação">
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                      >
                        <option value="">Todas</option>
                        {Object.entries(donationStatuses).map(
                          ([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ),
                        )}
                      </select>
                    </Field>
                    <Field label="Campanha">
                      <select
                        value={campaignFilter}
                        onChange={(e) => setCampaignFilter(e.target.value)}
                      >
                        <option value="">Todas</option>
                        {campaigns.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <div className="inline spread table-caption">
                    <span className="muted">
                      {number(filteredDonations.length)} registros encontrados
                    </span>
                    <Button
                      variant="secondary"
                      onClick={() => exportDonations()}
                      disabled={!filteredDonations.length}
                    >
                      <Download size={15} />
                      Exportar CSV
                    </Button>
                  </div>
                  {filteredDonations.length ? (
                    <Paginated
                      key={`${query}-${filter}-${campaignFilter}`}
                      items={filteredDonations}
                      render={(items) => (
                        <DonationTable
                          records={items}
                          findNeed={findNeed}
                          edit={(d) => setModal({ type: "donation", value: d })}
                        />
                      )}
                    />
                  ) : (
                    <Empty title="Nenhuma doação encontrada">
                      Cadastre um recebimento ou ajuste a pesquisa.
                    </Empty>
                  )}
                </section>
              )}
              {page === "necessidades" && (
                <>
                  <div className="filters admin-filters">
                    <Field label="Buscar necessidade">
                      <input
                        type="search"
                        placeholder="Item ou campanha"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </Field>
                    <Field label="Mostrar">
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                      >
                        <option value="">Todas as metas</option>
                        <option value="missing">Ainda precisam de ajuda</option>
                        <option value="met">Metas alcançadas</option>
                      </select>
                    </Field>
                  </div>
                  <div className="needs-grid">
                    {campaigns
                      .filter((c) => c.status !== "archived")
                      .flatMap((c) =>
                        c.needs
                          .filter((n) => n.active !== false)
                          .map((n) => ({ ...n, campaign: c })),
                      )
                      .filter(
                        (n) =>
                          `${n.item} ${n.campaign.name}`
                            .toLowerCase()
                            .includes(query.toLowerCase()) &&
                          (!filter ||
                            (filter === "missing"
                              ? n.received < n.goal
                              : n.received >= n.goal)),
                      )
                      .map((n) => {
                        const urgent =
                          effectiveStatus(n.campaign) === "active" &&
                          n.campaign.ends_on <=
                            new Date(
                              Date.now() + 14 * 86400000,
                            ).toLocaleDateString("en-CA", {
                              timeZone: "America/Sao_Paulo",
                            }) &&
                          n.received / n.goal < 0.3;
                        return (
                          <article className="panel need-card" key={n.id}>
                            <div className="need-labels">
                              <Badge tone="blue">{n.campaign.name}</Badge>
                              {urgent && <Badge tone="red">Prioridade</Badge>}
                            </div>
                            <h2>{n.item}</h2>
                            <strong className="need-count">
                              {number(n.received)}
                              <small>
                                {" "}
                                / {number(n.goal)} {n.unit}
                              </small>
                            </strong>
                            <Progress
                              value={Math.round(
                                Math.min(100, (n.received / n.goal) * 100),
                              )}
                            />
                            <p className="muted">
                              {n.received >= n.goal
                                ? "Meta alcançada"
                                : `Faltam ${number(n.goal - n.received)} ${n.unit}`}
                            </p>
                            <small className="muted">
                              Até {date(n.campaign.ends_on)}
                            </small>
                          </article>
                        );
                      })}
                  </div>
                  {!campaigns.length && (
                    <Empty title="Sem necessidades cadastradas">
                      Os itens aparecem aqui depois do cadastro de uma campanha.
                    </Empty>
                  )}
                </>
              )}
              {page === "relatorios" && (
                <Reports
                  data={data}
                  findNeed={findNeed}
                  exportDonations={exportDonations}
                />
              )}
              {page === "conteudo" && (
                <ContentForm
                  settings={data.settings}
                  busy={busy}
                  disabled={!configured}
                  onSave={(values) =>
                    mutate(
                      () => saveSettings(values),
                      "Conteúdo do portal atualizado.",
                    )
                  }
                  onImport={() => setModal({ type: "import" })}
                />
              )}
              {page === "equipe" && (
                <section className="panel">
                  <SectionHead
                    title="Pessoas que cuidam da operação"
                    text="Apenas contas autorizadas podem acessar os dados internos."
                    action={
                      <Button
                        disabled={!configured}
                        onClick={() => setModal({ type: "invite" })}
                      >
                        <Plus size={16} />
                        Convidar administrador
                      </Button>
                    }
                  />
                  {data.team.length ? (
                    <div className="team-list">
                      {data.team.map((person) => (
                        <div className="team-row" key={person.user_id}>
                          <span className="avatar">
                            {person.name.slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <strong>{person.name}</strong>
                            <p className="muted">{person.email}</p>
                          </div>
                          <Badge>Administrador</Badge>
                          <button
                            className="icon-button danger-text"
                            disabled={person.user_id === user?.id}
                            aria-label={`Revogar acesso de ${person.name}`}
                            onClick={() =>
                              setModal({ type: "remove", value: person })
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty title="Nenhum administrador nesta prévia">
                      A equipe real será carregada do Supabase.
                    </Empty>
                  )}
                </section>
              )}
              {page === "historico" && (
                <section className="panel">
                  <SectionHead
                    title="Rastreabilidade da gestão"
                    text="As últimas 100 alterações registradas pelo banco. Dados pessoais de doadores não são copiados para o histórico."
                  />
                  {data.audit.length ? (
                    <Paginated
                      items={data.audit}
                      render={(items) => (
                        <div className="table-scroll">
                          <table>
                            <thead>
                              <tr>
                                <th>Quando</th>
                                <th>Ação</th>
                                <th>Área</th>
                                <th>Responsável</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((a) => (
                                <tr key={a.id}>
                                  <td>
                                    {new Date(a.created_at).toLocaleString(
                                      "pt-BR",
                                    )}
                                  </td>
                                  <td>
                                    {{
                                      INSERT: "Cadastro",
                                      UPDATE: "Atualização",
                                      DELETE: "Remoção",
                                    }[a.action] || a.action}
                                  </td>
                                  <td>
                                    {{
                                      campaigns: "Campanhas",
                                      donations: "Doações",
                                      site_settings: "Conteúdo",
                                      administrators: "Equipe",
                                    }[a.entity] || a.entity}
                                  </td>
                                  <td>
                                    {data.team.find(
                                      (t) => t.user_id === a.actor_id,
                                    )?.name || "Sistema / conta não listada"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    />
                  ) : (
                    <Empty title="Histórico sem registros">
                      As ações administrativas serão registradas
                      automaticamente.
                    </Empty>
                  )}
                </section>
              )}
              {!active && (
                <Empty title="Página não encontrada">
                  Escolha uma opção no menu administrativo.
                </Empty>
              )}
            </>
          )}
        </div>
        <footer className="admin-footer">
          <span>Bahamas Solidário · Gestão com cuidado.</span>
          <Link to="/privacidade">Privacidade</Link>
        </footer>
      </main>
      {modal?.type === "campaign" && (
        <CampaignForm
          initial={modal.value}
          busy={busy}
          close={() => {
            if (!busy) setModal(null);
          }}
          submit={(v) =>
            mutate(() => saveCampaign(v), "Campanha salva com sucesso.")
          }
        />
      )}
      {modal?.type === "donation" && (
        <DonationForm
          initial={modal.value}
          campaigns={campaigns}
          busy={busy}
          close={() => {
            if (!busy) setModal(null);
          }}
          submit={(v) =>
            mutate(() => saveDonation(v), "Doação salva com sucesso.")
          }
        />
      )}
      {modal?.type === "archive" && (
        <Modal title="Arquivar campanha?" onClose={() => setModal(null)}>
          <p>
            A campanha <strong>{modal.value.name}</strong> deixará de aparecer
            no portal. Os registros e as doações serão preservados. Você poderá
            reativá-la pela edição.
          </p>
          <div className="form-actions">
            <Button variant="secondary" onClick={() => setModal(null)}>
              Voltar
            </Button>
            <Button
              loading={busy}
              onClick={() =>
                mutate(
                  () =>
                    saveCampaign({
                      ...modal.value,
                      status: "archived",
                      published: false,
                    }),
                  "Campanha arquivada.",
                ).catch(() => {})
              }
            >
              Arquivar campanha
            </Button>
          </div>
        </Modal>
      )}
      {modal?.type === "invite" && (
        <InviteForm
          busy={busy}
          close={() => setModal(null)}
          submit={(values) =>
            mutate(async () => {
              const { data, error } = await supabase.functions.invoke(
                "manage-team",
                { body: { action: "invite", ...values } },
              );
              if (error || data?.error)
                throw new Error(
                  data?.error ||
                    "Não foi possível convidar. Confira se a função manage-team está publicada.",
                );
            }, "Convite enviado. A pessoa receberá um e-mail para definir sua senha.")
          }
        />
      )}
      {modal?.type === "remove" && (
        <Modal
          title="Revogar acesso administrativo?"
          onClose={() => setModal(null)}
        >
          <p>
            <strong>{modal.value.name}</strong> perderá o acesso aos dados
            internos. Seus registros anteriores permanecerão no histórico.
          </p>
          <div className="form-actions">
            <Button variant="secondary" onClick={() => setModal(null)}>
              Voltar
            </Button>
            <Button
              loading={busy}
              onClick={() =>
                mutate(async () => {
                  const { error } = await supabase.rpc("remove_administrator", {
                    target: modal.value.user_id,
                  });
                  if (error) throw error;
                }, "Acesso revogado.").catch(() => {})
              }
            >
              Revogar acesso
            </Button>
          </div>
        </Modal>
      )}
      {modal?.type === "import" && (
        <ImportForm
          busy={busy}
          close={() => setModal(null)}
          submit={(payload) =>
            mutate(async () => {
              const { error } = await supabase.rpc("import_legacy", {
                payload,
              });
              if (error) throw error;
            }, "Dados importados. Revise as campanhas antes de publicá-las.")
          }
        />
      )}
    </div>
  );
}
function HandHeartIcon() {
  return <Heart size={38} strokeWidth={1.3} />;
}
function DonationTable({ records, findNeed, edit }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Doação</th>
            <th>Campanha</th>
            <th>Doador</th>
            <th>Data</th>
            <th>Situação</th>
            <th>
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((d) => {
            const n = findNeed(d.need_id);
            return (
              <tr key={d.id}>
                <td>
                  <strong>
                    {number(d.quantity)} {n?.unit}
                  </strong>
                  <small>{n?.item || "Item não encontrado"}</small>
                </td>
                <td>{n?.campaign.name || "—"}</td>
                <td>{d.donor_name || "Não informado"}</td>
                <td>{date(d.donated_on)}</td>
                <td>
                  <Badge
                    tone={
                      d.status === "received"
                        ? "blue"
                        : d.status === "cancelled"
                          ? "red"
                          : ""
                    }
                  >
                    {donationStatuses[d.status]}
                  </Badge>
                </td>
                <td>
                  <button
                    className="icon-button"
                    aria-label={`Editar doação de ${n?.item}`}
                    onClick={() => edit(d)}
                  >
                    <Pencil size={15} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
function CampaignForm({ initial, busy, close, submit }) {
  const [value, setValue] = useState({
    ...initial,
    needs: initial.needs.filter((n) => n.active !== false),
  });
  const [error, setError] = useState("");
  const field = (name) => ({
    value: value[name] ?? "",
    onChange: (e) => setValue((v) => ({ ...v, [name]: e.target.value })),
  });
  const handle = async (e) => {
    e.preventDefault();
    setError("");
    if (value.ends_on < value.starts_on) {
      setError("O encerramento deve ser posterior ou igual ao início.");
      return;
    }
    try {
      await submit(value);
    } catch (e) {
      setError(message(e));
    }
  };
  return (
    <Modal
      title={value.id ? "Editar campanha" : "Nova campanha"}
      onClose={close}
      wide
    >
      <form onSubmit={handle}>
        <fieldset disabled={busy}>
          <div className="form-grid">
            <Field label="Nome da campanha" className="full">
              <input
                required
                minLength={3}
                maxLength={120}
                {...field("name")}
              />
            </Field>
            <Field label="Categoria">
              <select {...field("category")}>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Situação">
              <select {...field("status")}>
                {Object.entries(statuses).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Início">
              <input required type="date" {...field("starts_on")} />
            </Field>
            <Field label="Encerramento">
              <input
                required
                type="date"
                min={value.starts_on}
                {...field("ends_on")}
              />
            </Field>
            <Field label="Quem será beneficiado">
              <input maxLength={200} {...field("beneficiary")} />
            </Field>
            <Field label="Local / ponto de coleta">
              <input maxLength={300} {...field("location")} />
            </Field>
            <Field label="Descrição pública" className="full">
              <textarea rows={4} maxLength={5000} {...field("description")} />
            </Field>
          </div>
          <div className="section-head compact">
            <div>
              <h3>Itens necessários</h3>
              <p className="muted">
                Metas e unidades individuais para cada item.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={value.needs.length >= 50}
              onClick={() =>
                setValue((v) => ({
                  ...v,
                  needs: [...v.needs, { item: "", goal: "", unit: "unidades" }],
                }))
              }
            >
              <Plus size={14} />
              Adicionar
            </Button>
          </div>
          {value.needs.map((n, i) => (
            <div className="need-form-row" key={n.id || `new-${i}`}>
              <Field label="Item">
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={n.item}
                  onChange={(e) =>
                    setValue((v) => ({
                      ...v,
                      needs: v.needs.map((x, j) =>
                        i === j ? { ...x, item: e.target.value } : x,
                      ),
                    }))
                  }
                />
              </Field>
              <Field label="Meta">
                <input
                  required
                  type="number"
                  min="0.01"
                  max="100000000"
                  step="0.01"
                  value={n.goal}
                  onChange={(e) =>
                    setValue((v) => ({
                      ...v,
                      needs: v.needs.map((x, j) =>
                        i === j ? { ...x, goal: e.target.value } : x,
                      ),
                    }))
                  }
                />
              </Field>
              <Field label="Unidade">
                <input
                  required
                  maxLength={30}
                  value={n.unit}
                  onChange={(e) =>
                    setValue((v) => ({
                      ...v,
                      needs: v.needs.map((x, j) =>
                        i === j ? { ...x, unit: e.target.value } : x,
                      ),
                    }))
                  }
                />
              </Field>
              <button
                type="button"
                className="icon-button danger-text"
                disabled={value.needs.length === 1}
                aria-label={`Retirar item ${i + 1}`}
                onClick={() =>
                  setValue((v) => ({
                    ...v,
                    needs: v.needs.filter((_, j) => j !== i),
                  }))
                }
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <p className="form-help">
            Itens retirados deixam de aparecer na campanha; o histórico de
            doações é preservado. Itens com doações mantêm seu nome e unidade.
          </p>
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={value.published}
              onChange={(e) =>
                setValue((v) => ({ ...v, published: e.target.checked }))
              }
              disabled={value.status === "archived"}
            />
            <span>
              Publicar no portal público
              <small>Deixe desmarcado para manter como rascunho.</small>
            </span>
          </label>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={close}>
              Cancelar
            </Button>
            <Button type="submit" loading={busy}>
              Salvar campanha
            </Button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
function DonationForm({ initial, campaigns, busy, close, submit }) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState("");
  const field = (name) => ({
    value: value[name] ?? "",
    onChange: (e) => setValue((v) => ({ ...v, [name]: e.target.value })),
  });
  const options = campaigns.flatMap((c) =>
    c.needs
      .filter(
        (n) =>
          (n.active !== false && c.status === "active") ||
          n.id === initial.need_id,
      )
      .map((n) => ({ ...n, campaign: c })),
  );
  return (
    <Modal
      title={value.id ? "Editar doação" : "Registrar doação"}
      onClose={close}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          try {
            await submit(value);
          } catch (e) {
            setError(message(e));
          }
        }}
      >
        <fieldset disabled={busy}>
          <Field label="Campanha e item">
            <select required {...field("need_id")}>
              <option value="">Selecione o item</option>
              {options.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.campaign.name} · {n.item} ({n.unit})
                </option>
              ))}
            </select>
          </Field>
          <div className="form-grid">
            <Field label="Quantidade">
              <input
                required
                type="number"
                min="0.01"
                max="100000000"
                step="0.01"
                {...field("quantity")}
              />
            </Field>
            <Field label="Data">
              <input
                required
                type="date"
                max={today()}
                {...field("donated_on")}
              />
            </Field>
            <Field label="Nome do doador (opcional)">
              <input maxLength={150} {...field("donor_name")} />
            </Field>
            <Field label="Contato (opcional)">
              <input maxLength={200} {...field("donor_contact")} />
            </Field>
          </div>
          <Field label="Situação">
            <select {...field("status")}>
              {Object.entries(donationStatuses).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Observações internas">
            <textarea rows={3} maxLength={2000} {...field("notes")} />
          </Field>
          <p className="form-help">
            <ShieldCheck size={14} />
            Nomes, contatos e observações não aparecem no portal público.
            Doações pendentes e canceladas não entram nas metas.
          </p>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={close}>
              Cancelar
            </Button>
            <Button loading={busy} type="submit">
              Salvar doação
            </Button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
function ContentForm({ settings, busy, disabled, onSave, onImport }) {
  const [value, setValue] = useState(settings);
  const [error, setError] = useState("");
  useEffect(() => setValue(settings), [settings]);
  const fields = [
    ["hero_title", "Título da página inicial", 160],
    ["hero_description", "Apresentação da página inicial", 600],
    ["about", "Sobre o projeto", 5000],
    ["donation_instructions", "Orientações para doar", 3000],
    ["collection_address", "Endereço de coleta", 500],
    ["opening_hours", "Horários de atendimento", 200],
    ["contact_email", "E-mail de contato", 254],
    ["contact_phone", "Telefone", 40],
    ["privacy_notice", "Aviso de privacidade", 3000],
  ];
  return (
    <>
      <section className="panel">
        <SectionHead
          title="O que a comunidade vê"
          text="Estas informações são públicas. Não inclua informações internas ou dados de doadores."
        />
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            try {
              await onSave(value);
            } catch (e) {
              setError(message(e));
            }
          }}
        >
          <fieldset disabled={busy || disabled}>
            <div className="form-grid">
              {fields.map(([key, label, max]) => (
                <Field
                  label={label}
                  key={key}
                  className={max > 500 || key === "hero_title" ? "full" : ""}
                >
                  {max > 300 ? (
                    <textarea
                      rows={3}
                      maxLength={max}
                      value={value[key]}
                      onChange={(e) =>
                        setValue((v) => ({ ...v, [key]: e.target.value }))
                      }
                    />
                  ) : (
                    <input
                      type={
                        key === "contact_email"
                          ? "email"
                          : key === "contact_phone"
                            ? "tel"
                            : "text"
                      }
                      required={key === "hero_title"}
                      minLength={key === "hero_title" ? 5 : undefined}
                      maxLength={max}
                      value={value[key]}
                      onChange={(e) =>
                        setValue((v) => ({ ...v, [key]: e.target.value }))
                      }
                    />
                  )}
                </Field>
              ))}
            </div>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <div className="form-actions">
              <Button loading={busy} type="submit">
                Salvar conteúdo público
              </Button>
            </div>
          </fieldset>
        </form>
      </section>
      <section className="panel import-panel">
        <div>
          <h3>Trazer dados da versão anterior</h3>
          <p className="muted">
            Importe campanhas e doações salvas no navegador ou em um arquivo
            JSON. As campanhas entram como rascunho para revisão.
          </p>
        </div>
        <Button variant="secondary" disabled={disabled} onClick={onImport}>
          <FileUp size={16} />
          Importar registros
        </Button>
      </section>
    </>
  );
}
function Reports({ data, findNeed, exportDonations }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const records = data.donations.filter(
    (d) => (!from || d.donated_on >= from) && (!to || d.donated_on <= to),
  );
  const received = records.filter((d) => d.status === "received");
  return (
    <>
      <section className="panel">
        <SectionHead
          title="Um retrato do período"
          text="Filtre pela data da doação. Quantidades de unidades diferentes são apresentadas separadamente."
        />
        <div className="filters">
          <Field label="De">
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
            />
          </Field>
          <Field label="Até">
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
            />
          </Field>
          <Button
            variant="secondary"
            disabled={!records.length}
            onClick={() => exportDonations(records)}
          >
            <Download size={16} />
            Exportar período
          </Button>
        </div>
        <div className="admin-metrics three">
          <Metric
            featured
            label="Recebimentos"
            value={received.length}
            hint="Doações confirmadas no período"
          />
          <Metric
            label="Pendentes"
            value={records.filter((d) => d.status === "pending").length}
            hint="Registros aguardando recebimento"
          />
          <Metric
            label="Campanhas apoiadas"
            value={
              new Set(received.map((d) => findNeed(d.need_id)?.campaign.id))
                .size
            }
            hint="Com doações recebidas no período"
          />
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Campanha</th>
                <th>Item</th>
                <th>Recebido no período</th>
                <th>Meta total</th>
              </tr>
            </thead>
            <tbody>
              {data.campaigns.flatMap((c) =>
                c.needs.map((n) => {
                  const quantity = received
                    .filter((d) => d.need_id === n.id)
                    .reduce((sum, d) => sum + Number(d.quantity), 0);
                  return (
                    <tr key={n.id}>
                      <td>{c.name}</td>
                      <td>{n.item}</td>
                      <td>
                        {number(quantity)} {n.unit}
                      </td>
                      <td>
                        {number(n.goal)} {n.unit}
                      </td>
                    </tr>
                  );
                }),
              )}
            </tbody>
          </table>
        </div>
      </section>
      <div className="explanation">
        <ShieldCheck size={24} />
        <p>
          Os relatórios administrativos podem conter dados pessoais. Compartilhe
          arquivos somente com as pessoas autorizadas.
        </p>
      </div>
    </>
  );
}
function InviteForm({ busy, close, submit }) {
  const [error, setError] = useState("");
  return (
    <Modal title="Convidar administrador" onClose={close}>
      <p className="muted">
        A pessoa receberá um convite por e-mail e terá permissão para gerenciar
        campanhas, doações, conteúdo e equipe.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          try {
            await submit({ name: f.get("name"), email: f.get("email") });
          } catch (e) {
            setError(message(e));
          }
        }}
      >
        <fieldset disabled={busy}>
          <Field label="Nome">
            <input name="name" required minLength={2} maxLength={100} />
          </Field>
          <Field label="E-mail">
            <input name="email" type="email" required maxLength={254} />
          </Field>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="form-actions">
            <Button variant="secondary" type="button" onClick={close}>
              Cancelar
            </Button>
            <Button type="submit" loading={busy}>
              Enviar convite
            </Button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
function ImportForm({ busy, close, submit }) {
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState("");
  const parse = (text) => {
    try {
      const data = JSON.parse(text);
      if (!Array.isArray(data.campaigns) || !Array.isArray(data.donations))
        throw new Error("O arquivo precisa conter campaigns e donations.");
      setPayload(data);
      setError("");
    } catch (e) {
      setError(message(e));
      setPayload(null);
    }
  };
  return (
    <Modal title="Importar dados anteriores" onClose={close}>
      <p className="muted">
        A importação é feita de uma vez só. Revise as quantidades antes de
        confirmar. O mesmo arquivo não pode ser importado duas vezes.
      </p>
      <Field label="Arquivo JSON da versão anterior">
        <input
          type="file"
          accept="application/json,.json"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 2_000_000) {
              setError("O arquivo deve ter até 2 MB.");
              return;
            }
            parse(await file.text());
          }}
        />
      </Field>
      <Button
        variant="secondary"
        disabled={busy}
        onClick={() => {
          const saved = localStorage.getItem("bs-demo");
          if (saved) parse(saved);
          else
            setError(
              "Nenhum dado da versão anterior foi encontrado neste endereço do navegador. Use um arquivo JSON exportado.",
            );
        }}
      >
        Buscar dados deste navegador
      </Button>
      {payload && (
        <div className="notice">
          Serão importadas {payload.campaigns.length} campanhas e{" "}
          {payload.donations.length} doações. As campanhas ficarão como
          rascunho.
        </div>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="form-actions">
        <Button variant="secondary" onClick={close}>
          Cancelar
        </Button>
        <Button
          disabled={!payload}
          loading={busy}
          onClick={async () => {
            try {
              await submit(payload);
            } catch (e) {
              setError(message(e));
            }
          }}
        >
          Confirmar importação
        </Button>
      </div>
    </Modal>
  );
}
