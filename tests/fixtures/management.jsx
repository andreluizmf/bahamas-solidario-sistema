import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ManagementEditor,
  ManagementWorkspace,
} from "../../src/pages/Management";
import "../../src/styles.css";
const campaign = {
  id: "demo-campaign",
  name: "Mesa Cheia — demonstração",
  category: "Alimentos",
  description:
    "Arrecadação de alimentos para apoiar instituições da comunidade.",
  starts_on: "2026-11-01",
  ends_on: "2026-12-20",
  status: "active",
  published: true,
  needs: [{ id: "rice", item: "Arroz", unit: "kg", goal: 100, received: 30 }],
};
const plan = {
  id: "demo-plan",
  campaign_id: campaign.id,
  objective: "Alcançar 100 kg de arroz até 20 de dezembro de 2026.",
  responsible: "Equipe de arrecadação",
  audience: "Clientes das lojas e moradores do bairro",
  value_proposition:
    "Contribuir com alimentos perto de casa e acompanhar as metas pelo portal.",
  budget: 500,
  analysis: {
    why: "Apoiar a segurança alimentar na comunidade.",
    where: "Ponto de coleta confirmado com a equipe.",
    how: "Organizar coleta, triagem e encaminhamento às instituições.",
    strengths: "Rede de lojas e equipe mobilizada.",
    weaknesses: "Equipe pequena para triagem.",
    opportunities: "Parcerias com grupos comunitários.",
    threats: "Baixo alcance da divulgação.",
    product: "Arrecadação de alimentos para instituições.",
    price: "Doação voluntária de itens e tempo de deslocamento.",
    place: "Lojas participantes e portal público.",
    promotion: "WhatsApp, Instagram e comunicação na loja.",
  },
};
function Fixture() {
  const [mode, setMode] = useState("gestao"),
    [modal, setModal] = useState(null),
    [notice, setNotice] = useState("");
  const [records, setRecords] = useState({
    campaign_plans: [plan],
    management_tasks: [
      {
        id: "demo-task",
        campaign_id: campaign.id,
        title: "Organizar o ponto de coleta",
        responsible: "Equipe de operação",
        deadline: "2026-12-01",
        status: "todo",
        notes: "",
      },
    ],
    campaign_expenses: [],
    marketing_actions: [],
  });
  const Link = ({ to, children, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  );
  return (
    <main className="public-container page-space">
      <h1>Administração e marketing</h1>
      <p>
        Cenário de demonstração local. Os dados abaixo são fictícios e não são
        gravados no Supabase.
      </p>
      <div className="quick-actions">
        <button className="button secondary" onClick={() => setMode("gestao")}>
          Administração
        </button>
        <button
          className="button secondary"
          onClick={() => setMode("marketing")}
        >
          Marketing
        </button>
      </div>
      <p role="status">{notice}</p>
      <ManagementWorkspace
        mode={mode}
        campaigns={[campaign]}
        records={records}
        disabled={false}
        busy={false}
        edit={(type, initial) => setModal({ type, initial })}
        notify={setNotice}
        Link={Link}
      />
      {modal && (
        <ManagementEditor
          type={modal.type}
          initial={modal.initial}
          busy={false}
          close={() => setModal(null)}
          submit={async (value) => {
            setRecords((prev) => ({
              ...prev,
              [modal.type]: value.id
                ? prev[modal.type].map((x) => (x.id === value.id ? value : x))
                : [...prev[modal.type], { ...value, id: crypto.randomUUID() }],
            }));
            setModal(null);
            setNotice("Registro salvo no cenário local.");
          }}
        />
      )}
    </main>
  );
}
createRoot(document.getElementById("root")).render(<Fixture />);
