import React, { useEffect, useMemo, useState } from "react";
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
  BriefcaseBusiness,
  Target,
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
import { confirmNavigation, normalizeSearch } from "../lib/ux";
import { useUnsavedChanges } from "../lib/use-unsaved";
import { invokeTeamInvitation } from "../lib/team";

const Management = React.lazy(() => import("./Management"));

const tabs = [
  ["", "Visão geral", LayoutDashboard],
  ["campanhas", "Campanhas", Megaphone],
  ["doacoes", "Doações", Heart],
  ["necessidades", "Necessidades", Package],
  ["relatorios", "Relatórios", Download],
  ["gestao", "Administração", BriefcaseBusiness],
  ["marketing", "Marketing", Target],
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
  const Link = useMemo(
    () =>
      ({ to, ...props }) => (
        <BaseLink
          {...props}
          to={
            !configured && to.startsWith("/admin")
              ? to.replace("/admin", "/admin/previa")
              : to
          }
        />
      ),
    [BaseLink],
  );
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState(null);
  const [mobile, setMobile] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const page = path.split("/")[2] || "";
  const active = tabs.find((t) => t[0] === page);
  const load = async () => {
    setError("");
    setRefreshing(true);
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
      setUpdatedAt(new Date());
    } catch (e) {
      setError(message(e));
    } finally {
      setRefreshing(false);
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
  useEffect(() => {
    if (!mobile) return;
    const escape = (event) => {
      if (event.key === "Escape") {
        setMobile(false);
        document.querySelector('[aria-controls="admin-navigation"]')?.focus();
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [mobile]);
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
      normalizeSearch(c.name).includes(normalizeSearch(query)) &&
      (!filter || (filter === "draft" ? !c.published : c.status === filter)),
  );
  const filteredDonations = donations.filter((d) => {
    const n = findNeed(d.need_id);
    return (
      normalizeSearch(
        `${d.donor_name} ${n?.item} ${n?.campaign.name}`,
      ).includes(normalizeSearch(query)) &&
      (!filter || d.status === filter) &&
      (!campaignFilter || n?.campaign.id === campaignFilter)
    );
  });
  const filteredNeeds = campaigns
    .filter((c) => c.status !== "archived")
    .flatMap((c) =>
      c.needs
        .filter((n) => n.active !== false)
        .map((n) => ({ ...n, campaign: c })),
    )
    .filter(
      (n) =>
        normalizeSearch(n.item + " " + n.campaign.name).includes(
          normalizeSearch(query),
        ) &&
        (!filter ||
          (filter === "missing" ? n.received < n.goal : n.received >= n.goal)),
    );
  const clearFilters = () => {
    setQuery("");
    setFilter("");
    setCampaignFilter("");
  };
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
        <button
          className="icon-button sidebar-close mobile-menu"
          aria-label="Fechar menu administrativo"
          onClick={() => setMobile(false)}
        >
          <X size={20} />
        </button>
        <nav aria-label="Administração" id="admin-navigation">
          {tabs.map(([slug, label, I], index) => (
            <React.Fragment key={slug}>
              {(index === 0 || index === 5 || index === 7) && (
                <span className="nav-group-label">
                  {index === 0
                    ? "Operação"
                    : index === 5
                      ? "Planejamento"
                      : "Configuração"}
                </span>
              )}
              <Link
                key={slug}
                to={`/admin${slug ? "/" + slug : ""}`}
                className={page === slug ? "active" : ""}
                aria-current={page === slug ? "page" : undefined}
              >
                <I size={18} />
                {label}
              </Link>
            </React.Fragment>
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
            aria-expanded={mobile}
            aria-controls="admin-navigation"
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
              aria-label={refreshing ? "Atualizando dados" : "Atualizar dados"}
              disabled={refreshing}
              aria-busy={refreshing}
              onClick={() => {
                if (confirmNavigation()) load();
              }}
            >
              <RefreshCw size={16} className={refreshing ? "spin" : ""} />
            </button>
          </div>
        </header>
        <div className="admin-content">
          {updatedAt && (
            <p className="data-freshness" role="status">
              Dados atualizados às{" "}
              {updatedAt.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {refreshing ? " · Atualizando…" : ""}
            </p>
          )}
          <div className="page-title">
            <div>
              <h1>
                {page === ""
                  ? `Olá, ${(admin?.name || "equipe").split(" ")[0]}.`
                  : active?.[1] || "Página não encontrada"}
              </h1>
              <p className="muted">
                {page === ""
                  ? "Uma visão clara do cuidado que se transforma em ação."
                  : page === "gestao"
                    ? "Planeje objetivos, responsabilidades e recursos de cada campanha."
                    : page === "marketing"
                      ? "Organize a comunicação e acompanhe os resultados informados pela equipe."
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
                  <section
                    className="quick-actions"
                    aria-label="Ações frequentes"
                  >
                    <div>
                      <strong>O que você precisa fazer?</strong>
                      <p className="muted">
                        Comece pelas ações mais usadas da operação.
                      </p>
                    </div>
                    <div className="inline">
                      <Button
                        disabled={!configured}
                        onClick={() =>
                          setModal({ type: "campaign", value: emptyCampaign() })
                        }
                      >
                        <Plus size={16} />
                        Nova campanha
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={!configured}
                        onClick={() =>
                          setModal({
                            type: "donation",
                            value: {
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
                        <Heart size={16} />
                        Registrar doação
                      </Button>
                    </div>
                  </section>
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
                  <FilterSummary
                    count={filteredCampaigns.length}
                    active={query || filter}
                    clear={clearFilters}
                  />
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
                  <FilterSummary
                    count={filteredDonations.length}
                    active={query || filter || campaignFilter}
                    clear={clearFilters}
                  />
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
                  <FilterSummary
                    count={filteredNeeds.length}
                    active={query || filter}
                    clear={clearFilters}
                  />
                  <div className="needs-grid">
                    {filteredNeeds.map((n) => {
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
                  {!filteredNeeds.length && (
                    <Empty title="Nenhuma necessidade encontrada">
                      Cadastre itens em uma campanha ou ajuste os filtros da
                      busca.
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
              {["gestao", "marketing"].includes(page) && (
                <React.Suspense fallback={<Loading />}>
                  <Management
                    mode={page}
                    campaigns={campaigns}
                    notify={notify}
                    Link={Link}
                  />
                </React.Suspense>
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
                                      campaign_plans: "Planejamento",
                                      management_tasks: "Tarefas",
                                      campaign_expenses: "Gastos operacionais",
                                      marketing_actions: "Divulgação",
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
          createCampaign={() =>
            setModal({ type: "campaign", value: emptyCampaign() })
          }
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
        <Modal
          title="Arquivar campanha?"
          busy={busy}
          onClose={() => setModal(null)}
        >
          <p>
            A campanha <strong>{modal.value.name}</strong> deixará de aparecer
            no portal. Os registros e as doações serão preservados. Você poderá
            reativá-la pela edição.
          </p>
          <div className="form-actions">
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => setModal(null)}
            >
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
          submit={async (values) => {
            setBusy(true);
            try {
              const result = await invokeTeamInvitation(supabase, values);
              await load();
              notify(
                result.alreadyAdmin
                  ? "Essa pessoa já possui acesso administrativo."
                  : "Acesso administrativo autorizado.",
              );
              return result;
            } finally {
              setBusy(false);
            }
          }}
        />
      )}
      {modal?.type === "remove" && (
        <Modal
          title="Revogar acesso administrativo?"
          busy={busy}
          onClose={() => setModal(null)}
        >
          <p>
            <strong>{modal.value.name}</strong> perderá o acesso aos dados
            internos. Seus registros anteriores permanecerão no histórico.
          </p>
          <div className="form-actions">
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => setModal(null)}
            >
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
export function CampaignForm({ initial, busy, close, submit }) {
  const baseline = useMemo(
    () => ({
      ...initial,
      needs: initial.needs.filter((n) => n.active !== false),
    }),
    [initial],
  );
  const [value, setValue] = useState(baseline);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(value) !== JSON.stringify(baseline);
  const field = (name) => ({
    value: value[name] ?? "",
    onChange: (event) =>
      setValue((v) => ({ ...v, [name]: event.target.value })),
  });
  const editNeed = (index, key, next) =>
    setValue((v) => ({
      ...v,
      needs: v.needs.map((n, i) => (i === index ? { ...n, [key]: next } : n)),
    }));
  const handle = async (event) => {
    event.preventDefault();
    setError("");
    if (value.ends_on < value.starts_on) {
      setError("O encerramento deve ser posterior ou igual ao início.");
      return;
    }
    try {
      await submit(value);
    } catch (error) {
      setError(message(error));
    }
  };
  const completed = [
    value.name.trim().length >= 3,
    value.ends_on >= value.starts_on,
    value.needs.every(
      (n) => n.item.trim().length >= 2 && Number(n.goal) > 0 && n.unit.trim(),
    ),
  ].filter(Boolean).length;
  return (
    <Modal
      title={value.id ? "Editar campanha" : "Nova campanha"}
      onClose={close}
      busy={busy}
      dirty={dirty}
      wide
    >
      <div className="form-completion">
        <span>{completed} de 3 grupos preenchidos</span>
        <Badge tone={dirty ? "red" : ""}>
          {dirty ? "Alterações não salvas" : "Nenhuma alteração"}
        </Badge>
      </div>
      <Form onSubmit={handle}>
        <fieldset disabled={busy}>
          <FormSection
            title="1. Apresente a campanha"
            description="Campos com * são obrigatórios. Você pode salvar como rascunho e revisar antes de publicar."
          >
            <div className="form-grid">
              <Field label="Nome da campanha">
                <input
                  required
                  minLength={3}
                  maxLength={120}
                  placeholder="Ex.: Mesa Cheia"
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
              <Field
                label="Descrição pública"
                className="full"
                hint="Explique a causa, quem será ajudado e o que pode ser doado."
              >
                <textarea rows={3} maxLength={5000} {...field("description")} />
              </Field>
            </div>
            <details className="optional-fields">
              <summary>Beneficiários e ponto de coleta (opcional)</summary>
              <div className="form-grid">
                <Field label="Quem será beneficiado">
                  <input maxLength={200} {...field("beneficiary")} />
                </Field>
                <Field label="Local / ponto de coleta">
                  <input maxLength={300} {...field("location")} />
                </Field>
              </div>
            </details>
          </FormSection>
          <FormSection
            title="2. Defina o prazo"
            description="As datas ajudam a comunidade a saber quando participar."
          >
            <div className="form-grid">
              <Field label="Início">
                <input required type="date" {...field("starts_on")} />
              </Field>
              <Field
                label="Encerramento"
                hint="A data deve ser igual ou posterior ao início."
              >
                <input
                  required
                  type="date"
                  min={value.starts_on}
                  {...field("ends_on")}
                />
              </Field>
              <Field label="Situação" className="full">
                <select {...field("status")}>
                  {Object.entries(statuses).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </FormSection>
          <FormSection
            title="3. Organize os itens e as metas"
            description="Use uma meta e uma unidade para cada item. Quilos e unidades não são somados."
          >
            {value.needs.map((n, index) => (
              <div className="need-form-row" key={n.id || index}>
                <Field label={"Item " + (index + 1)}>
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder="Ex.: Arroz"
                    value={n.item}
                    onChange={(event) =>
                      editNeed(index, "item", event.target.value)
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
                    inputMode="decimal"
                    value={n.goal}
                    onChange={(event) =>
                      editNeed(index, "goal", event.target.value)
                    }
                  />
                </Field>
                <Field label="Unidade">
                  <input
                    required
                    maxLength={30}
                    placeholder="kg, unidades…"
                    list="need-units"
                    value={n.unit}
                    onChange={(event) =>
                      editNeed(index, "unit", event.target.value)
                    }
                  />
                </Field>
                <button
                  type="button"
                  className="icon-button danger-text"
                  disabled={value.needs.length === 1}
                  aria-label={"Retirar item " + (index + 1)}
                  title="Retirar este item"
                  onClick={() =>
                    setValue((v) => ({
                      ...v,
                      needs: v.needs.filter((_, i) => index !== i),
                    }))
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <datalist id="need-units">
              <option value="unidades" />
              <option value="kg" />
              <option value="litros" />
              <option value="pacotes" />
              <option value="caixas" />
            </datalist>
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
              <Plus size={15} />
              Adicionar outro item
            </Button>
            <p className="form-help">
              Retirar um item preserva seu histórico de doações. Itens que já
              receberam doações mantêm o nome e a unidade.
            </p>
          </FormSection>
          <section className="publish-section">
            <h3>Visibilidade no portal</h3>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={value.published && value.status !== "archived"}
                disabled={value.status === "archived"}
                onChange={(event) =>
                  setValue((v) => ({ ...v, published: event.target.checked }))
                }
              />
              <span>
                Publicar no portal público
                <small>
                  {value.status === "archived"
                    ? "Campanhas arquivadas ficam fora do portal."
                    : value.published
                      ? "Ao salvar, as informações ficarão visíveis para a comunidade."
                      : "Sem esta opção, a campanha será salva como rascunho."}
                </small>
              </span>
            </label>
          </section>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <div className="form-actions sticky-actions">
            <Button type="button" variant="secondary" data-close-modal>
              Cancelar
            </Button>
            <Button type="submit" loading={busy}>
              {value.published && value.status !== "archived"
                ? "Salvar e publicar"
                : "Salvar rascunho"}
            </Button>
          </div>
        </fieldset>
      </Form>
    </Modal>
  );
}
export function DonationForm({
  initial,
  campaigns,
  busy,
  close,
  submit,
  createCampaign,
}) {
  const allNeeds = campaigns.flatMap((c) =>
    c.needs
      .filter(
        (n) =>
          (n.active !== false && c.status === "active") ||
          n.id === initial.need_id,
      )
      .map((n) => ({ ...n, campaign: c })),
  );
  const availableCampaigns = campaigns.filter((c) =>
    allNeeds.some((n) => n.campaign.id === c.id),
  );
  const initialCampaign =
    allNeeds.find((n) => n.id === initial.need_id)?.campaign.id ||
    (availableCampaigns.length === 1 ? availableCampaigns[0].id : "");
  const [campaignId, setCampaignId] = useState(initialCampaign);
  const [value, setValue] = useState(initial);
  const [error, setError] = useState("");
  const options = allNeeds.filter((n) => n.campaign.id === campaignId);
  const selectedNeed = allNeeds.find((n) => n.id === value.need_id);
  const dirty = JSON.stringify(value) !== JSON.stringify(initial);
  const field = (name) => ({
    value: value[name] ?? "",
    onChange: (event) =>
      setValue((v) => ({ ...v, [name]: event.target.value })),
  });
  return (
    <Modal
      title={value.id ? "Editar doação" : "Registrar doação"}
      onClose={close}
      busy={busy}
      dirty={dirty}
    >
      {!availableCampaigns.length ? (
        <Empty
          title="Cadastre uma campanha primeiro"
          action={
            <Button onClick={createCampaign}>
              <Plus size={16} />
              Criar campanha
            </Button>
          }
        >
          Para registrar uma doação, é preciso ter uma campanha ativa com pelo
          menos um item.
        </Empty>
      ) : (
        <Form
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            try {
              await submit(value);
            } catch (error) {
              setError(message(error));
            }
          }}
        >
          <fieldset disabled={busy}>
            <FormSection
              title="Destino da doação"
              description="Escolha a campanha e, depois, o item doado."
            >
              <Field label="Campanha">
                <select
                  required
                  value={campaignId}
                  onChange={(event) => {
                    const id = event.target.value;
                    setCampaignId(id);
                    const needs = allNeeds.filter((n) => n.campaign.id === id);
                    setValue((v) => ({
                      ...v,
                      need_id: needs.length === 1 ? needs[0].id : "",
                    }));
                  }}
                >
                  <option value="">Selecione a campanha</option>
                  {availableCampaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Item necessário">
                <select required disabled={!campaignId} {...field("need_id")}>
                  <option value="">
                    {campaignId
                      ? "Selecione o item"
                      : "Escolha uma campanha primeiro"}
                  </option>
                  {options.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.item} ({n.unit})
                    </option>
                  ))}
                </select>
              </Field>
              <div className="form-grid">
                <Field
                  label="Quantidade"
                  hint={
                    selectedNeed
                      ? "Unidade: " + selectedNeed.unit
                      : "A unidade é definida pelo item escolhido."
                  }
                >
                  <input
                    required
                    type="number"
                    min="0.01"
                    max="100000000"
                    step="0.01"
                    inputMode="decimal"
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
              </div>
              <Field
                label="Situação"
                hint={
                  value.status === "received"
                    ? "Doações recebidas entram nas metas e nos resultados públicos."
                    : "Doações pendentes ou canceladas não entram nas metas."
                }
              >
                <select {...field("status")}>
                  {Object.entries(donationStatuses).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
            </FormSection>
            <details
              className="optional-fields"
              open={Boolean(
                initial.donor_name || initial.donor_contact || initial.notes,
              )}
            >
              <summary>
                Identificação do doador e observações (opcional)
              </summary>
              <Field label="Nome do doador">
                <input
                  autoComplete="off"
                  maxLength={150}
                  {...field("donor_name")}
                />
              </Field>
              <Field label="Contato">
                <input
                  autoComplete="off"
                  maxLength={200}
                  {...field("donor_contact")}
                />
              </Field>
              <Field label="Observações internas">
                <textarea rows={3} maxLength={2000} {...field("notes")} />
              </Field>
            </details>
            <p className="form-help">
              <ShieldCheck size={15} />
              Nome, contato e observações ficam restritos à equipe
              administrativa.
            </p>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <div className="form-actions sticky-actions">
              <Button type="button" variant="secondary" data-close-modal>
                Cancelar
              </Button>
              <Button type="submit" loading={busy}>
                Salvar doação
              </Button>
            </div>
          </fieldset>
        </Form>
      )}
    </Modal>
  );
}
export function ContentForm({ settings, busy, disabled, onSave, onImport }) {
  const [value, setValue] = useState(settings);
  const [error, setError] = useState("");
  useEffect(() => setValue(settings), [settings]);
  const dirty = JSON.stringify(value) !== JSON.stringify(settings);
  useUnsavedChanges(dirty);
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
          action={
            <Badge tone={dirty ? "red" : "blue"}>
              {dirty ? "Alterações não salvas" : "Conteúdo salvo"}
            </Badge>
          }
          title="O que a comunidade vê"
          text="Estas informações são públicas. Não inclua informações internas ou dados de doadores."
        />
        <Form
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
              <Button loading={busy} disabled={!dirty} type="submit">
                Salvar conteúdo público
              </Button>
            </div>
          </fieldset>
        </Form>
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
export function InviteForm({ busy, close, submit }) {
  const [error, setError] = useState(""),
    [result, setResult] = useState(null),
    [delivery, setDelivery] = useState("link"),
    [copied, setCopied] = useState(false);
  return (
    <Modal
      title={result ? "Acesso administrativo" : "Convidar administrador"}
      onClose={close}
      busy={busy}
      dirty={result ? false : undefined}
    >
      {result ? (
        <>
          <h3>
            {result.alreadyAdmin
              ? "Essa pessoa já é administradora."
              : "Conta autorizada para administrar o sistema."}
          </h3>
          <p className="muted">
            {result.name} · {result.email}
          </p>
          {result.delivery === "link" ? (
            <>
              {result.emailFailed && (
                <p className="form-error" role="status">
                  O serviço não conseguiu entregar o e-mail. Use o link abaixo
                  para concluir o convite.
                </p>
              )}
              <p>
                Copie o link e envie em particular para essa pessoa confirmar o
                acesso e definir a própria senha.
              </p>
              <Field label="Link pessoal de convite">
                <textarea
                  rows={4}
                  readOnly
                  value={result.invitationUrl}
                  spellCheck={false}
                  onFocus={(e) => e.target.select()}
                />
              </Field>
              <p className="form-help">
                O link permite acesso à conta. Não publique nem compartilhe com
                outras pessoas. Ele é temporário e só pode ser utilizado uma
                vez.
              </p>
              <Button
                variant="secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(result.invitationUrl);
                    setCopied(true);
                  } catch {
                    setError("Selecione o link acima e copie pelo navegador.");
                  }
                }}
              >
                {copied ? "Link copiado" : "Copiar link de convite"}
              </Button>
            </>
          ) : (
            <p>
              {result.delivery === "email"
                ? "O convite foi enviado por e-mail. A pessoa deve abri-lo e definir a própria senha."
                : "A pessoa pode entrar no painel com o e-mail e a senha que já utiliza. Nenhuma senha foi alterada."}
            </p>
          )}
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <div className="form-actions">
            <Button onClick={close}>Concluir</Button>
          </div>
        </>
      ) : (
        <>
          <p className="muted">
            A pessoa terá permissão para gerenciar campanhas, doações,
            planejamento, conteúdo e equipe. Use o e-mail de quem deve receber
            esse acesso.
          </p>
          <Form
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              const values = new FormData(e.currentTarget);
              try {
                setResult(
                  await submit({
                    name: String(values.get("name")).trim(),
                    email: String(values.get("email")).trim().toLowerCase(),
                    delivery,
                  }),
                );
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
              <Field
                label="Como entregar o convite"
                hint={
                  delivery === "link"
                    ? "Não envia e-mail automaticamente. Você copia o link e entrega à pessoa."
                    : "Se o envio de e-mail falhar, o painel mostrará um link de convite."
                }
              >
                <select
                  value={delivery}
                  onChange={(e) => setDelivery(e.target.value)}
                >
                  <option value="link">Gerar link para enviar à pessoa</option>
                  <option value="email">Tentar enviar por e-mail</option>
                </select>
              </Field>
              {error && (
                <p role="alert" className="form-error">
                  {error}
                </p>
              )}
              <div className="form-actions">
                <Button type="button" variant="secondary" data-close-modal>
                  Cancelar
                </Button>
                <Button type="submit" loading={busy}>
                  {delivery === "link"
                    ? "Adicionar e gerar link"
                    : "Enviar convite"}
                </Button>
              </div>
            </fieldset>
          </Form>
        </>
      )}
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
    <Modal title="Importar dados anteriores" onClose={close} busy={busy}>
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
        <Button variant="secondary" data-close-modal onClick={close}>
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

function FilterSummary({ count, active, clear }) {
  return (
    <div className="filter-summary">
      <p className="result-count" role="status">
        {number(count)}{" "}
        {count === 1 ? "resultado encontrado" : "resultados encontrados"}
      </p>
      {active && (
        <Button variant="secondary" onClick={clear}>
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
