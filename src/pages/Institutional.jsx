import React from "react";
import {
  ArrowRight,
  ExternalLink,
  Coins,
  Package,
  Users,
  Trophy,
  Leaf,
  GraduationCap,
  HeartPulse,
  Mail,
  MapPin,
  Instagram,
  Linkedin,
  ShieldCheck,
} from "lucide-react";
import { SectionHead } from "../components/ui";
import { date } from "../lib/domain";
import {
  institutional,
  historyFigures,
  programs,
  pillars,
  regions,
  news,
  questions,
} from "../lib/institutional";
const icons = {
  coins: Coins,
  package: Package,
  people: Users,
  sport: Trophy,
  leaf: Leaf,
  education: GraduationCap,
  health: HeartPulse,
};
export function History({ compact = false }) {
  return (
    <section
      className="institution-section history-section"
      aria-label="Histórico do projeto"
    >
      <SectionHead
        title="Uma história construída em conjunto"
        text="Resultados institucionais divulgados pelo Grupo Bahamas, com seus períodos de referência."
      />
      <div className="history-grid">
        {historyFigures.map((f) => (
          <article key={f.label}>
            <strong>{f.value}</strong>
            <h3>{f.label}</h3>
            <p>{f.note}</p>
          </article>
        ))}
      </div>
      <div className="source-note">
        <p>
          Estes números históricos não são somados às doações registradas neste
          portal.
        </p>
      </div>
      {!compact && <p className="institution-intro">{institutional.intro}</p>}
    </section>
  );
}
export function Programs({ Link, compact = false }) {
  return (
    <section className="institution-section">
      <SectionHead
        title="Nossas ações"
        text="Diferentes formas de participar da vida da comunidade."
        action={
          compact && (
            <Link to="/acoes" className="text-link">
              Conhecer todas
              <ArrowRight size={16} />
            </Link>
          )
        }
      />
      <div className="program-grid">
        {(compact
          ? programs.filter((p) =>
              ["troco", "aniversario", "instituicoes"].includes(p.id),
            )
          : programs
        ).map((p) => {
          const Icon = icons[p.icon];
          return (
            <article className="panel program" key={p.id}>
              <Icon size={26} />
              <h3>{p.title}</h3>
              <p>{p.text}</p>
              {!compact && <p className="muted">{p.detail}</p>}
              <Link
                to={
                  compact
                    ? "/acoes"
                    : ["troco", "aniversario", "mesa-brasil"].includes(p.id)
                      ? "/como-doar"
                      : "/contato"
                }
                className="text-link"
              >
                {compact
                  ? "Conhecer as ações"
                  : ["troco", "aniversario", "mesa-brasil"].includes(p.id)
                    ? "Como contribuir"
                    : "Falar com a equipe"}
                <ArrowRight size={16} />
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
export function Pillars() {
  return (
    <section className="institution-section">
      <SectionHead
        title="O que orienta nosso trabalho"
        text="Frentes de cuidado que conectam pessoas, instituições e comunidade."
      />
      <div className="pillar-grid">
        {pillars.map((p) => {
          const Icon = icons[p.icon];
          return (
            <article key={p.title}>
              <Icon size={24} />
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
export function Regions() {
  return (
    <section className="institution-section">
      <SectionHead
        title="Presença em Minas Gerais"
        text="As iniciativas acompanham a atuação regional do Grupo Bahamas. Conheça algumas das cidades presentes nessa trajetória."
      />
      <div className="region-grid">
        {regions.map((r) => (
          <article className="panel" key={r.name}>
            <MapPin size={24} />
            <h3>{r.name}</h3>
            <ul>
              {r.cities.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className="source-note">
        <p>
          A disponibilidade de campanhas e pontos de coleta varia por local.
        </p>
      </div>
    </section>
  );
}
export function News({ Link, compact = false }) {
  return (
    <section className="institution-section">
      <SectionHead
        title={compact ? "Notícias e resultados" : "Publicações e resultados"}
        text="Informações publicadas nos canais oficiais. Cada matéria conserva sua data original."
        action={
          compact && (
            <Link to="/noticias" className="text-link">
              Todas as notícias
              <ArrowRight size={16} />
            </Link>
          )
        }
      />
      <div className="news-grid">
        {(compact ? news.slice(0, 2) : news).map((n) => (
          <article className="panel news-item" key={n.id}>
            <div className="news-meta">
              <span>{n.category}</span>
              <time dateTime={n.date}>{n.dateLabel || date(n.date)}</time>
            </div>
            <h3>{compact ? <Link to="/noticias">{n.title}</Link> : n.title}</h3>
            <p>{n.text}</p>
            <p className="news-source">
              Fonte: {n.publisher || "Grupo Bahamas"}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
export function FAQ() {
  return (
    <section className="institution-section faq-section">
      <SectionHead
        title="Dúvidas frequentes"
        text="Orientações para participar e acompanhar as iniciativas."
      />
      {questions.map(([q, a]) => (
        <details key={q}>
          <summary>{q}</summary>
          <p>{a}</p>
        </details>
      ))}
    </section>
  );
}
export function ContactSummary({ Link }) {
  return (
    <section className="institution-section contact-invitation">
      <div>
        <Mail size={26} />
        <h2>Vamos conversar?</h2>
        <p>
          Dúvidas sobre campanhas, propostas de parceria ou indicação de
          instituições: fale com a equipe responsável.
        </p>
      </div>
      <Link to="/contato" className="button secondary">
        Entre em contato
        <ArrowRight size={16} />
      </Link>
    </section>
  );
}
export default function Institutional({ path, settings, Link }) {
  if (path === "/acoes")
    return (
      <div className="public-container page-space">
        <h1>Solidariedade no dia a dia.</h1>
        <p className="lead">
          Conheça as ações do Bahamas Solidário e outras iniciativas de
          responsabilidade social do Grupo Bahamas.
        </p>
        <Programs Link={Link} />
        <section className="panel participation-panel">
          <Coins size={30} />
          <h2>Como funciona o Troco Solidário?</h2>
          <ol>
            <li>Ao concluir suas compras, consulte a equipe do caixa.</li>
            <li>Informe que deseja contribuir com o troco.</li>
            <li>
              A contribuição apoia instituições nas cidades de atuação do Grupo.
            </li>
          </ol>
          <p className="muted">
            Para saber mais sobre as instituições e a participação nas lojas,
            fale com a nossa equipe.
          </p>
        </section>
        <FAQ />
        <ContactSummary Link={Link} />
      </div>
    );
  if (path === "/noticias")
    return (
      <div className="public-container page-space">
        <h1>Notícias e resultados.</h1>
        <p className="lead">
          Acompanhe publicações sobre solidariedade, participação e iniciativas
          do Grupo Bahamas.
        </p>
        <News Link={Link} />
        <section className="explanation">
          <ShieldCheck size={24} />
          <div>
            <h3>Informação com origem identificada</h3>
            <p>
              As notícias são uma seleção de publicações institucionais. Para
              acompanhar as campanhas administradas neste sistema, consulte a
              página de transparência.
            </p>
            <Link to="/transparencia" className="text-link">
              Acompanhar campanhas
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
        <ContactSummary Link={Link} />
      </div>
    );
  const email = settings.contact_email || institutional.email;
  return (
    <div className="public-container page-space">
      <h1>Fale com o Bahamas Solidário.</h1>
      <p className="lead">
        Quer participar, indicar uma instituição ou conversar sobre uma
        parceria? Entre em contato com a equipe.
      </p>
      <div className="contact-page-grid">
        <section className="panel contact-details">
          <Mail size={28} />
          <h2>Contato por e-mail</h2>
          <p>
            Conte o motivo do contato e a cidade relacionada à sua proposta ou
            dúvida.
          </p>
          <a className="contact-email" href={`mailto:${email}`}>
            {email}
          </a>
          <a
            className="button primary"
            href={`mailto:${email}?subject=${encodeURIComponent("Contato — Bahamas Solidário")}`}
          >
            Abrir meu aplicativo de e-mail
            <ExternalLink size={16} />
          </a>
          <p className="muted">
            A mensagem será enviada pelo seu aplicativo de e-mail. Não há envio
            automático por este portal.
          </p>
          {settings.contact_phone && (
            <a
              className="text-link"
              href={`tel:${settings.contact_phone.replace(/[^+\d]/g, "")}`}
            >
              {settings.contact_phone}
            </a>
          )}
        </section>
        <section className="panel contact-details">
          <MapPin size={28} />
          <h2>Escritório central do Grupo</h2>
          <p>{institutional.address}</p>
          <p className="muted">
            Antes de visitar ou entregar uma doação, confirme o atendimento e o
            ponto de coleta com a equipe.
          </p>
          {settings.opening_hours && <p>{settings.opening_hours}</p>}
          <h3>Acompanhe o Grupo</h3>
          <div className="social-links">
            <a
              href="https://www.instagram.com/supermercadosbahamas/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={20} />
              Instagram
            </a>
            <a
              href="https://br.linkedin.com/company/grupo-bahamas"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin size={20} />
              LinkedIn
            </a>
          </div>
        </section>
      </div>
      <FAQ />
    </div>
  );
}
