import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export function NotificationCenter({ data }) {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    checkNotifications();
  }, [data]);

  function checkNotifications() {
    const newNotifications = [];
    const received = data.donations.filter(d => d.status === 'Recebida');

    data.campaigns.forEach(campaign => {
      campaign.needs.forEach(need => {
        const got = received
          .filter(d => d.campaign === campaign.id && d.item === need.item)
          .reduce((s, d) => s + Number(d.quantity), 0);
        
        const percentage = (got / need.goal) * 100;

        if (percentage >= 100) {
          newNotifications.push({
            id: `${campaign.id}-${need.item}-complete`,
            type: 'success',
            title: 'Meta alcançada!',
            message: `${need.item} da campanha "${campaign.name}" atingiu a meta de ${need.goal} ${need.unit}`,
            timestamp: new Date().toISOString()
          });
        } else if (percentage >= 80) {
          newNotifications.push({
            id: `${campaign.id}-${need.item}-near`,
            type: 'info',
            title: 'Próximo da meta',
            message: `${need.item} da campanha "${campaign.name}" está em ${Math.round(percentage)}% da meta`,
            timestamp: new Date().toISOString()
          });
        } else if (percentage < 30 && new Date(campaign.end) - new Date() < 7 * 24 * 60 * 60 * 1000) {
          newNotifications.push({
            id: `${campaign.id}-${need.item}-urgent`,
            type: 'warning',
            title: 'Atenção necessária',
            message: `${need.item} da campanha "${campaign.name}" está em apenas ${Math.round(percentage)}% e encerra em breve`,
            timestamp: new Date().toISOString()
          });
        }
      });
    });

    setNotifications(newNotifications);
    setUnreadCount(newNotifications.length);
  }

  function getIcon(type) {
    switch(type) {
      case 'success': return <CheckCircle size={18} />;
      case 'warning': return <AlertTriangle size={18} />;
      default: return <Info size={18} />;
    }
  }

  return (
    <>
      <button className="notification-btn" onClick={() => setShowPanel(!showPanel)}>
        <Bell size={20} />
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {showPanel && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notificações</h3>
            <button onClick={() => setShowPanel(false)}><X size={18} /></button>
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="muted">Nenhuma notificação no momento</p>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className={`notification-item ${notif.type}`}>
                  <div className="notification-icon">{getIcon(notif.type)}</div>
                  <div className="notification-content">
                    <strong>{notif.title}</strong>
                    <p>{notif.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
