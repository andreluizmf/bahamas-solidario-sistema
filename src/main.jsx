import "./lib/auth-return";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

class ErrorBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="loading">
          <h1>Não foi possível abrir esta página.</h1>
          <p>Atualize a página para tentar novamente.</p>
          <button
            className="button primary"
            onClick={() => window.location.reload()}
          >
            Atualizar página
          </button>
        </main>
      );
    return this.props.children;
  }
}
createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
