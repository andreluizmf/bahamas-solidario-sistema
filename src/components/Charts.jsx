import React from 'react';
import { TrendingUp, Target, Calendar } from 'lucide-react';

export function DonationChart({ data }) {
  const received = data.donations.filter(d => d.status === 'Recebida');
  
  // Agrupar doações por campanha
  const byCampaign = data.campaigns.map(c => {
    const total = received.filter(d => d.campaign === c.id).length;
    return { name: c.name, total };
  });

  const maxDonations = Math.max(...byCampaign.map(c => c.total), 1);

  return (
    <section className="panel chart-panel">
      <h2>Distribuição de Doações</h2>
      <p className="muted">Quantidade de doações por campanha</p>
      <div className="chart">
        {byCampaign.map((item, i) => (
          <div key={i} className="chart-bar-wrapper">
            <div className="chart-label">{item.name}</div>
            <div className="chart-bar-container">
              <div 
                className="chart-bar" 
                style={{ width: `${(item.total / maxDonations) * 100}%` }}
              >
                <span className="chart-value">{item.total}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProgressChart({ data }) {
  const received = data.donations.filter(d => d.status === 'Recebida');
  
  const stats = data.campaigns.map(campaign => {
    const totalGoal = campaign.needs.reduce((sum, n) => sum + n.goal, 0);
    const totalGot = campaign.needs.reduce((sum, n) => {
      const got = received
        .filter(d => d.campaign === campaign.id && d.item === n.item)
        .reduce((a, d) => a + Number(d.quantity), 0);
      return sum + got;
    }, 0);
    
    return {
      name: campaign.name,
      percentage: totalGoal > 0 ? Math.min(100, (totalGot / totalGoal) * 100) : 0
    };
  });

  return (
    <section className="panel chart-panel">
      <h2>Progresso das Campanhas</h2>
      <p className="muted">Percentual de conclusão das metas</p>
      <div className="progress-list">
        {stats.map((item, i) => (
          <div key={i} className="progress-item">
            <div className="progress-header">
              <span>{item.name}</span>
              <strong>{Math.round(item.percentage)}%</strong>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function StatsCards({ data }) {
  const received = data.donations.filter(d => d.status === 'Recebida');
  const pending = data.donations.filter(d => d.status === 'Pendente');
  
  const activeCampaigns = data.campaigns.filter(c => c.status === 'Ativa');
  const completedCampaigns = data.campaigns.filter(c => c.status === 'Concluída');
  
  // Calcular tendência (simulado - comparação últimos 7 dias vs anteriores)
  const recentDonations = received.slice(0, Math.floor(received.length / 2)).length;
  const olderDonations = received.slice(Math.floor(received.length / 2)).length;
  const trend = olderDonations > 0 ? ((recentDonations - olderDonations) / olderDonations * 100) : 0;

  return (
    <>
      <div className="stat-card">
        <div className="stat-icon" style={{ background: '#e8f5e9' }}>
          <Target size={22} style={{ color: '#2e7d32' }} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Taxa de Conclusão</span>
          <strong className="stat-value">
            {data.campaigns.length > 0 
              ? Math.round((completedCampaigns.length / data.campaigns.length) * 100)
              : 0}%
          </strong>
          <small className="stat-desc">{completedCampaigns.length} de {data.campaigns.length} campanhas</small>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: '#fff3e0' }}>
          <Calendar size={22} style={{ color: '#ef6c00' }} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Doações Pendentes</span>
          <strong className="stat-value">{pending.length}</strong>
          <small className="stat-desc">Aguardando confirmação</small>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: '#e3f2fd' }}>
          <TrendingUp size={22} style={{ color: '#1565c0' }} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Tendência</span>
          <strong className="stat-value">{trend > 0 ? '+' : ''}{Math.round(trend)}%</strong>
          <small className="stat-desc">Variação recente</small>
        </div>
      </div>
    </>
  );
}
