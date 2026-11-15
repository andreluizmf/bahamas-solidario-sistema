import React from 'react';
import { Clock, Package, Megaphone, CheckCircle } from 'lucide-react';

export function ActivityTimeline({ data }) {
  // Criar timeline combinando campanhas e doações
  const activities = [];

  // Adicionar campanhas
  data.campaigns.forEach(campaign => {
    activities.push({
      type: 'campaign',
      icon: Megaphone,
      title: `Campanha "${campaign.name}" criada`,
      description: `${campaign.category} · Meta até ${new Date(campaign.end).toLocaleDateString('pt-BR')}`,
      status: campaign.status,
      timestamp: new Date(campaign.end).getTime() - 30 * 24 * 60 * 60 * 1000 // Simular 30 dias antes
    });
  });

  // Adicionar doações
  data.donations.forEach((donation, index) => {
    const campaign = data.campaigns.find(c => c.id === donation.campaign);
    activities.push({
      type: 'donation',
      icon: donation.status === 'Recebida' ? CheckCircle : Package,
      title: `Doação ${donation.status.toLowerCase()}`,
      description: `${donation.quantity} ${donation.unit} de ${donation.item} · ${campaign?.name || 'Campanha'}`,
      status: donation.status,
      timestamp: Date.now() - (index * 2 * 60 * 60 * 1000) // Simular intervalos
    });
  });

  // Ordenar por data (mais recente primeiro)
  activities.sort((a, b) => b.timestamp - a.timestamp);

  function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Agora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m atrás`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`;
    return `${Math.floor(seconds / 86400)}d atrás`;
  }

  return (
    <section className="panel timeline-panel">
      <h2>Linha do Tempo</h2>
      <p className="muted">Histórico de atividades recentes</p>
      
      <div className="timeline">
        {activities.slice(0, 10).map((activity, index) => (
          <div key={index} className="timeline-item">
            <div className={`timeline-icon ${activity.type}`}>
              <activity.icon size={16} />
            </div>
            <div className="timeline-content">
              <strong>{activity.title}</strong>
              <p>{activity.description}</p>
              <span className="timeline-time">
                <Clock size={12} />
                {getTimeAgo(activity.timestamp)}
              </span>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="muted">Nenhuma atividade registrada ainda.</p>
        )}
      </div>
    </section>
  );
}
