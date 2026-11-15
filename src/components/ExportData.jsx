import React, { useState } from 'react';
import { Download, FileText, Table, X } from 'lucide-react';

export function ExportButton({ data }) {
  const [showModal, setShowModal] = useState(false);

  function exportCSV() {
    const rows = [
      ['Campanha', 'Item', 'Quantidade', 'Unidade', 'Situação', 'Categoria'],
      ...data.donations.map(d => {
        const campaign = data.campaigns.find(c => c.id === d.campaign);
        return [
          campaign?.name || '',
          d.item,
          d.quantity,
          d.unit,
          d.status,
          campaign?.category || ''
        ];
      })
    ];

    const csv = '\ufeff' + rows.map(r => 
      r.map(x => '"' + String(x || '').replaceAll('"', '""') + '"').join(';')
    ).join('\r\n');

    downloadFile(csv, 'doacoes.csv', 'text/csv');
  }

  function exportJSON() {
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, 'dados.json', 'application/json');
  }

  function exportHTML() {
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Bahamas Solidário</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    h1 { color: #271d67; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f1f0f7; color: #271d67; font-weight: 600; }
    tr:hover { background: #f9f9f9; }
    .summary { background: #f1f0f7; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .summary h2 { margin-top: 0; color: #271d67; }
  </style>
</head>
<body>
  <h1>Relatório Bahamas Solidário</h1>
  <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
  
  <div class="summary">
    <h2>Resumo</h2>
    <p><strong>Total de campanhas:</strong> ${data.campaigns.length}</p>
    <p><strong>Campanhas ativas:</strong> ${data.campaigns.filter(c => c.status === 'Ativa').length}</p>
    <p><strong>Total de doações:</strong> ${data.donations.length}</p>
    <p><strong>Doações recebidas:</strong> ${data.donations.filter(d => d.status === 'Recebida').length}</p>
  </div>

  <h2>Campanhas</h2>
  <table>
    <thead>
      <tr>
        <th>Nome</th>
        <th>Categoria</th>
        <th>Status</th>
        <th>Encerramento</th>
        <th>Necessidades</th>
      </tr>
    </thead>
    <tbody>
      ${data.campaigns.map(c => `
        <tr>
          <td>${c.name}</td>
          <td>${c.category}</td>
          <td>${c.status}</td>
          <td>${new Date(c.end).toLocaleDateString('pt-BR')}</td>
          <td>${c.needs.map(n => `${n.item}: ${n.goal} ${n.unit}`).join('; ')}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Doações</h2>
  <table>
    <thead>
      <tr>
        <th>Campanha</th>
        <th>Item</th>
        <th>Quantidade</th>
        <th>Unidade</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${data.donations.map(d => {
        const campaign = data.campaigns.find(c => c.id === d.campaign);
        return `
          <tr>
            <td>${campaign?.name || '-'}</td>
            <td>${d.item}</td>
            <td>${d.quantity}</td>
            <td>${d.unit}</td>
            <td>${d.status}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>
</body>
</html>`;

    downloadFile(html, 'relatorio.html', 'text/html');
  }

  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setShowModal(false);
  }

  return (
    <>
      <button className="primary" onClick={() => setShowModal(true)}>
        <Download size={17} />
        Exportar dados
      </button>

      {showModal && (
        <div className="shade modal" onClick={() => setShowModal(false)}>
          <div className="export-modal" onClick={(e) => e.stopPropagation()}>
            <button className="x" onClick={() => setShowModal(false)}>×</button>
            
            <h2>Exportar Dados</h2>
            <p className="muted">Escolha o formato de exportação</p>

            <div className="export-options">
              <button className="export-option" onClick={exportCSV}>
                <Table size={32} />
                <strong>CSV (Excel)</strong>
                <p>Planilha compatível com Excel e Google Sheets</p>
              </button>

              <button className="export-option" onClick={exportHTML}>
                <FileText size={32} />
                <strong>HTML (Relatório)</strong>
                <p>Relatório formatado para impressão</p>
              </button>

              <button className="export-option" onClick={exportJSON}>
                <FileText size={32} />
                <strong>JSON</strong>
                <p>Formato estruturado para backup completo</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
