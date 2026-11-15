import React, { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Heart,
  HandHeart,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Users,
  Mail,
  Phone,
  Share2,
} from "lucide-react";
import {
  Badge,
  Empty,
  Field,
  Metric,
  Progress,
  SectionHead,
  TextLink,
} from "../components/ui";
import {
  categories,
  date,
  effectiveStatus,
  number,
  progress,
  statuses,
} from "../lib/domain";

export function CampaignCard({ campaign: c, Link }) {
  const state = effectiveStatus(c);
  const percentage = progress(c);
  return (
    <article className={`campaign-card category-${c.category}`}>
      <div className="campaign-cover">
        <span className="category-label">
          <Package size={15} />
          {c.category}
        </span>
        <div className="cover-art" aria-hidden="true">
          <HandHeart size={68} strokeWidth={1} />
        </div>
        <Badge tone={state === "active" ? "blue" : ""}>
          {state === "closed" ? "Prazo encerrado" : statuses[state]}
        </Badge>
      </div>
      <div className="campaign-card-body">
        <p className="eyebrow">BAHAMAS SOLIDÁRIO</p>
        <h3>
          <Link to={`/campanhas/${c.id}`}>{c.name}</Link>
        </h3>
        <p className="card-description">
          {c.description ||
            "Conheça os itens necessários e participe desta campanha solidária."}
        </p>
        <div className="progress-label">
          <span>Andamento das metas</span>
          <strong>{percentage}%</strong>
        </div>
        <Progress value={percentage} label={`Metas de ${c.name}`} />
        <div className="card-meta">
          <span>
            <CalendarDays size={14} />
            Até {date(c.ends_on)}
          </span>
          <Link to={`/campanhas/${c.id}`} aria-label={`Ver campanha ${c.name}`}>
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </article>
  );
}
function CampaignFilters({ campaigns, Link }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const filtered = campaigns.filter(
    (c) =>
      `${c.name} ${c.description} ${c.beneficiary}`
        .toLocaleLowerCase("pt-BR")
        .includes(query.toLocaleLowerCase("pt-BR")) &&
      (!category || c.category === category) &&
      (!status || effectiveStatus(c) === status),
  );
  return (
    <>
      <div className="filters">
        <Field label="Buscar campanha">
          <input
            type="search"
            placeholder="Nome, causa ou comunidade…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Field>
        <Field label="Categoria">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Situação">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todas as situações</option>
            <option value="active">Em andamento</option>
            <option value="planned">Em breve</option>
            <option value="closed">Prazo encerrado</option>
            <option value="completed">Concluídas</option>
          </select>
        </Field>
      </div>
      <p className="result-count">
        {number(filtered.length)} campanha{filtered.length !== 1 ? "s" : ""}{" "}
        encontrada{filtered.length !== 1 ? "s" : ""}
      </p>
      {filtered.length ? (
        <div className="campaign-grid">
          {filtered.map((c) => (
            <CampaignCard key={c.id} campaign={c} Link={Link} />
          ))}
        </div>
      ) : (
        <Empty title="Nenhuma campanha encontrada">
          Tente outra busca ou volte em breve para acompanhar novas iniciativas.
        </Empty>
      )}
    </>
  );
}
function Impact({ campaigns }) {
  return (
    <div className="impact-grid">
      <Metric
        icon={Heart}
        featured
        label="Campanhas em andamento"
        value={campaigns.filter((c) => effectiveStatus(c) === "active").length}
        hint="Causas que precisam de você"
      />
      <Metric
        icon={CheckCircle2}
        label="Campanhas concluídas"
        value={campaigns.filter((c) => c.status === "completed").length}
        hint="Iniciativas encerradas pela equipe"
      />
      <Metric
        icon={HandHeart}
        label="Doações recebidas"
        value={campaigns.reduce(
          (sum, c) => sum + Number(c.donation_count || 0),
          0,
        )}
        hint="Registros confirmados pela equipe"
      />
    </div>
  );
}
export default function Public({ path, data, Link, notify }) {
  const { campaigns, settings } = data;
  const isHome = path === "/";
  const campaignId = path.startsWith("/campanhas/")
    ? decodeURIComponent(path.split("/")[2])
    : null;
  if (campaignId) {
    const c = campaigns.find((c) => c.id === campaignId);
    if (!c)
      return (
        <div className="public-container page-space">
          <Empty title="Campanha não encontrada">
            Esta campanha não está disponível no portal público.
          </Empty>
          <Link to="/campanhas" className="button primary">
            Ver campanhas
          </Link>
        </div>
      );
    const share = async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        notify("Link da campanha copiado.");
      } catch {
        notify("Copie o endereço da barra do navegador para compartilhar.");
      }
    };
    return (
      <div className="public-container page-space">
        <Link to="/campanhas" className="breadcrumb">
          Campanhas <ChevronRight size={14} />
          {c.name}
        </Link>
        <div className="detail-grid">
          <section className="panel detail-main">
            <div className="inline">
              <Badge tone="blue">{c.category}</Badge>
              <Badge>
                {effectiveStatus(c) === "closed"
                  ? "Prazo encerrado"
                  : statuses[effectiveStatus(c)]}
              </Badge>
            </div>
            <h1>{c.name}</h1>
            <p className="lead preserve">
              {c.description ||
                "Confira os itens necessários para participar desta campanha."}
            </p>
            <div className="detail-facts">
              <span>
                <Users size={18} />
                {c.beneficiary || "Comunidade local"}
              </span>
              <span>
                <CalendarDays size={18} />
                {date(c.starts_on)} a {date(c.ends_on)}
              </span>
              {c.location && (
                <span>
                  <MapPin size={18} />
                  {c.location}
                </span>
              )}
            </div>
            <div className="divider" />
            <SectionHead
              title="Cada item faz a diferença"
              text="As metas são atualizadas com as doações recebidas e confirmadas pela equipe."
            />
            <div className="need-list">
              {c.needs.map((n) => (
                <div className="public-need" key={n.id}>
                  <div className="progress-label">
                    <strong>{n.item}</strong>
                    <span>
                      {number(n.received)} de {number(n.goal)} {n.unit}
                    </span>
                  </div>
                  <Progress
                    value={Math.round(
                      Math.min(100, (n.received / n.goal) * 100),
                    )}
                    label={`Meta de ${n.item}`}
                  />
                  <small className="muted">
                    {n.received >= n.goal
                      ? "Meta alcançada. Obrigado por fazer parte!"
                      : `Faltam ${number(Math.max(0, n.goal - n.received))} ${n.unit}`}
                  </small>
                </div>
              ))}
            </div>
            <button className="button secondary" onClick={share}>
              <Share2 size={16} />
              Compartilhar campanha
            </button>
          </section>
          <aside className="detail-aside">
            <div className="panel navy-panel">
              <HandHeart size={34} />
              <h2>Seu próximo gesto pode transformar um dia.</h2>
              <p>
                {effectiveStatus(c) === "active"
                  ? "Veja as orientações e combine a entrega com nossa equipe."
                  : "Confira o prazo desta campanha com a equipe ou conheça outras iniciativas em andamento."}
              </p>
              <Link className="button white" to="/como-doar">
                Como participar
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="panel">
              <h3>Transparência em cada etapa</h3>
              <p className="muted">
                Progresso geral: {progress(c)}%. Calculado pela média de
                cumprimento das metas de cada item, sem somar unidades
                diferentes.
              </p>
              <p className="muted">
                Os dados pessoais de doadores não são divulgados.
              </p>
            </div>
          </aside>
        </div>
      </div>
    );
  }
  if (path === "/campanhas")
    return (
      <div className="public-container page-space">
        <p className="eyebrow">ENCONTRE SUA CAUSA</p>
        <h1>
          Pequenos gestos.
          <br />
          Grandes possibilidades.
        </h1>
        <p className="lead">
          Conheça nossas iniciativas e veja onde sua ajuda faz a diferença.
        </p>
        <CampaignFilters campaigns={campaigns} Link={Link} />
      </div>
    );
  if (path === "/transparencia")
    return (
      <div className="public-container page-space">
        <p className="eyebrow">IMPACTO COMPARTILHADO</p>
        <h1>Solidariedade com transparência.</h1>
        <p className="lead">
          Acompanhe os resultados públicos das campanhas, com respeito à
          privacidade de quem participa.
        </p>
        <Impact campaigns={campaigns} />
        <section className="panel">
          <SectionHead
            title="Campanha por campanha"
            text="Somente doações com recebimento confirmado entram nos resultados."
          />
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Campanha</th>
                  <th>Categoria</th>
                  <th>Metas</th>
                  <th>Doações recebidas</th>
                  <th>Prazo</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/campanhas/${c.id}`}>{c.name}</Link>
                    </td>
                    <td>{c.category}</td>
                    <td>
                      <span className="mono">{progress(c)}%</span>
                    </td>
                    <td>{number(c.donation_count)}</td>
                    <td>{date(c.ends_on)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!campaigns.length && (
            <Empty title="Os resultados aparecerão aqui">
              Assim que uma campanha for publicada, você poderá acompanhar seu
              andamento.
            </Empty>
          )}
        </section>
        <div className="explanation">
          <ShieldCheck size={24} />
          <div>
            <h3>Como calculamos o progresso?</h3>
            <p>
              A média do percentual recebido de cada item compõe o progresso da
              campanha. Cada meta contribui com até 100%, sem somar quantidades
              de unidades diferentes.
            </p>
          </div>
        </div>
      </div>
    );
  if (path === "/sobre")
    return (
      <div className="public-container page-space">
        <p className="eyebrow">NOSSO PROPÓSITO</p>
        <h1>Gente que cuida de gente.</h1>
        <div className="about-grid">
          <section className="panel">
            <HandHeart size={34} />
            <h2>Bahamas Solidário</h2>
            <p className="lead preserve">{settings.about}</p>
          </section>
          <section className="panel navy-panel">
            <p className="eyebrow">O QUE NOS MOVE</p>
            <h2>Uma comunidade mais próxima, um gesto de cada vez.</h2>
            <p>
              Organização para ajudar melhor. Transparência para acompanhar cada
              campanha. Cuidado com todas as pessoas que fazem parte dessa
              corrente.
            </p>
            <Link to="/campanhas" className="button white">
              Conhecer campanhas
              <ArrowRight size={16} />
            </Link>
          </section>
        </div>
        <HowItWorks Link={Link} />
      </div>
    );
  if (path === "/como-doar")
    return (
      <div className="public-container page-space">
        <p className="eyebrow">FAÇA PARTE</p>
        <h1>A sua ajuda tem um caminho.</h1>
        <p className="lead">Tudo começa com a escolha de uma causa.</p>
        <HowItWorks Link={Link} />
        <div className="about-grid">
          <section className="panel">
            <h2>Orientações para doar</h2>
            <p className="preserve">{settings.donation_instructions}</p>
            <div className="contact-list">
              {settings.collection_address && (
                <p>
                  <MapPin size={18} />
                  <span>{settings.collection_address}</span>
                </p>
              )}
              {settings.opening_hours && (
                <p>
                  <CalendarDays size={18} />
                  <span>{settings.opening_hours}</span>
                </p>
              )}
              {settings.contact_email && (
                <p>
                  <Mail size={18} />
                  <a href={`mailto:${settings.contact_email}`}>
                    {settings.contact_email}
                  </a>
                </p>
              )}
              {settings.contact_phone && (
                <p>
                  <Phone size={18} />
                  <a
                    href={`tel:${settings.contact_phone.replace(/[^+\d]/g, "")}`}
                  >
                    {settings.contact_phone}
                  </a>
                </p>
              )}
            </div>
            {!settings.contact_email &&
              !settings.contact_phone &&
              !settings.collection_address && (
                <p className="muted">
                  Os canais e pontos de coleta serão informados aqui pela equipe
                  responsável.
                </p>
              )}
          </section>
          <section className="panel">
            <h2>Antes de separar sua doação</h2>
            <ul className="check-list">
              <li>
                <Check size={18} />
                Confira os itens e prazos da campanha.
              </li>
              <li>
                <Check size={18} />
                Doe itens em bom estado e adequados ao uso.
              </li>
              <li>
                <Check size={18} />
                Verifique a validade dos alimentos.
              </li>
              <li>
                <Check size={18} />
                Combine a entrega com a equipe responsável.
              </li>
            </ul>
            <p className="muted">
              Este portal não processa pagamentos nem solicita dados bancários.
            </p>
          </section>
        </div>
      </div>
    );
  if (path === "/privacidade")
    return (
      <div className="public-container page-space narrow">
        <p className="eyebrow">RESPEITO ÀS PESSOAS</p>
        <h1>Privacidade e uso dos dados.</h1>
        <section className="panel">
          <p className="preserve">{settings.privacy_notice}</p>
          <h2>O que aparece neste portal</h2>
          <p>
            Campanhas publicadas, itens necessários, metas, prazos e resultados
            agregados. Nomes, contatos e observações de doadores ficam restritos
            à administração.
          </p>
          <h2>Área administrativa</h2>
          <p>
            O acesso depende de autenticação e autorização da equipe. A sessão
            administrativa utiliza armazenamento no navegador para manter o
            login.
          </p>
          <h2>Contato</h2>
          <p>
            {settings.contact_email ? (
              <a href={`mailto:${settings.contact_email}`}>
                {settings.contact_email}
              </a>
            ) : (
              "Procure a equipe responsável pelo Bahamas Solidário para dúvidas sobre seus dados."
            )}
          </p>
        </section>
      </div>
    );
  if (!isHome)
    return (
      <div className="public-container page-space">
        <Empty title="Página não encontrada">
          Use o menu para continuar navegando.
        </Empty>
        <Link to="/" className="button primary">
          Voltar ao início
        </Link>
      </div>
    );
  const featured = [...campaigns]
    .sort(
      (a, b) =>
        Number(effectiveStatus(b) === "active") -
        Number(effectiveStatus(a) === "active"),
    )
    .slice(0, 3);
  return (
    <>
      <section className="hero public-container">
        <div className="hero-copy">
          <span className="hero-kicker">
            <span />
            CUIDAR TAMBÉM É FAZER PARTE
          </span>
          <h1>{settings.hero_title}</h1>
          <p>{settings.hero_description}</p>
          <div className="hero-actions">
            <Link to="/campanhas" className="button primary">
              Quero fazer parte
              <ArrowRight size={17} />
            </Link>
            <Link to="/transparencia" className="button ghost">
              Acompanhar o impacto
              <ArrowRight size={17} />
            </Link>
          </div>
          <p className="hero-assurance">
            <ShieldCheck size={16} />
            Campanhas reais. Cuidado de perto. Resultados compartilhados.
          </p>
        </div>
        <div className="hero-bento">
          <div className="hero-art">
            <div className="art-ring ring-one" />
            <div className="art-ring ring-two" />
            <HandHeart size={110} strokeWidth={1} aria-hidden="true" />
            <div className="floating-note">
              <span className="heart-dot">
                <Heart size={18} />
              </span>
              <div>
                <strong>Um gesto. Muitas histórias.</strong>
                <small>A solidariedade aproxima.</small>
              </div>
            </div>
            <span className="art-star">
              <Sparkles size={28} />
            </span>
          </div>
          <Link to="/como-doar" className="hero-mini">
            <span>
              Uma ajuda que
              <br />
              <strong>chega mais longe.</strong>
            </span>
            <ArrowRight size={26} />
          </Link>
          <div className="hero-mini light">
            <ShieldCheck size={24} />
            <span>
              Transparência
              <br />
              <strong>em cada etapa.</strong>
            </span>
          </div>
        </div>
      </section>
      <section className="public-container impact-home">
        <Impact campaigns={campaigns} />
      </section>
      <section className="public-container home-campaigns">
        <SectionHead
          eyebrow="CAUSAS QUE CONECTAM"
          title="Toda campanha começa com cuidado."
          text="Escolha como você quer contribuir para a nossa comunidade."
          action={
            <Link to="/campanhas" className="text-link">
              Todas as campanhas
              <ArrowRight size={16} />
            </Link>
          }
        />
        {featured.length ? (
          <div className="campaign-grid">
            {featured.map((c) => (
              <CampaignCard key={c.id} campaign={c} Link={Link} />
            ))}
          </div>
        ) : (
          <Empty title="Novas campanhas estão a caminho">
            Volte em breve e acompanhe as próximas iniciativas.
          </Empty>
        )}
      </section>
      <section className="public-container">
        <HowItWorks Link={Link} />
      </section>
      <section className="public-container">
        <div className="public-cta">
          <div>
            <p className="eyebrow">JUNTOS, FAZEMOS MAIS</p>
            <h2>
              O próximo capítulo
              <br />
              pode começar com você.
            </h2>
            <p>Descubra como transformar vontade de ajudar em ação.</p>
          </div>
          <Link to="/como-doar" className="button white">
            Saiba como doar
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
function HowItWorks({ Link }) {
  return (
    <section className="how-section">
      <SectionHead
        eyebrow="SIMPLES DE PARTICIPAR"
        title="Da sua intenção ao próximo gesto."
      />
      <div className="steps-grid">
        {[
          [
            "01",
            "Encontre uma causa",
            "Conheça as campanhas, os objetivos e os itens necessários.",
          ],
          [
            "02",
            "Prepare sua contribuição",
            "Separe os itens de acordo com as orientações da campanha.",
          ],
          [
            "03",
            "Faça parte da transformação",
            "Combine a entrega e acompanhe os resultados no portal.",
          ],
        ].map(([n, title, text]) => (
          <article key={n}>
            <span>{n}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <TextLink href="/como-doar">Entenda como participar</TextLink>
    </section>
  );
}
