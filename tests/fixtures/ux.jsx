import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { CampaignForm, DonationForm } from "../../src/pages/Admin";
import { emptyCampaign, today } from "../../src/lib/domain";
import "../../src/styles.css";
const campaigns = [
  {
    id: "test-food",
    name: "Alimentos",
    status: "active",
    needs: [{ id: "rice", item: "Arroz", unit: "kg", active: true }],
  },
  {
    id: "test-coats",
    name: "Agasalhos",
    status: "active",
    needs: [{ id: "coat", item: "Casacos", unit: "unidades", active: true }],
  },
];
function Fixture() {
  const [modal, setModal] = useState(null),
    [result, setResult] = useState("");
  return (
    <main className="public-container page-space">
      <h1>Verificação local</h1>
      <p>Dados de teste; não há gravação no banco.</p>
      <div className="quick-actions">
        <button className="button primary" onClick={() => setModal("campaign")}>
          Nova campanha
        </button>
        <button
          className="button secondary"
          onClick={() => setModal("donation")}
        >
          Registrar doação
        </button>
      </div>
      <p role="status">{result}</p>
      {modal === "campaign" && (
        <CampaignForm
          initial={emptyCampaign()}
          busy={false}
          close={() => setModal(null)}
          submit={async (v) => {
            setResult(`Campanha recebida: ${v.name}`);
            setModal(null);
          }}
        />
      )}
      {modal === "donation" && (
        <DonationForm
          initial={{
            need_id: "",
            quantity: "",
            donated_on: today(),
            status: "received",
            donor_name: "",
            donor_contact: "",
            notes: "",
          }}
          campaigns={campaigns}
          busy={false}
          close={() => setModal(null)}
          submit={async (v) => {
            setResult(`Doação recebida: ${v.quantity}`);
            setModal(null);
          }}
          createCampaign={() => setModal("campaign")}
        />
      )}
    </main>
  );
}
createRoot(document.getElementById("root")).render(<Fixture />);
