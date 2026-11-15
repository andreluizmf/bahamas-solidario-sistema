import React, { useState } from 'react';
import { Share2, Link2, Facebook, Twitter, Mail, X, Copy, Check } from 'lucide-react';

export function ShareButton({ campaign }) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}?campaign=${campaign.id}`;
  const shareText = `Apoie a campanha "${campaign.name}"! ${campaign.category} · Meta: ${campaign.needs.map(n => `${n.goal} ${n.unit} de ${n.item}`).join(', ')}`;

  function copyToClipboard() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareOn(platform) {
    let url;
    switch(platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(campaign.name)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        break;
    }
    window.open(url, '_blank', 'width=600,height=400');
  }

  return (
    <>
      <button className="share-btn" onClick={() => setShowModal(true)} title="Compartilhar campanha">
        <Share2 size={16} />
      </button>

      {showModal && (
        <div className="shade modal" onClick={() => setShowModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <button className="x" onClick={() => setShowModal(false)}>×</button>
            
            <h2>Compartilhar Campanha</h2>
            <p className="muted">{campaign.name}</p>

            <div className="share-options">
              <button className="share-option" onClick={() => shareOn('facebook')}>
                <Facebook size={20} />
                <span>Facebook</span>
              </button>
              <button className="share-option" onClick={() => shareOn('twitter')}>
                <Twitter size={20} />
                <span>Twitter</span>
              </button>
              <button className="share-option" onClick={() => shareOn('email')}>
                <Mail size={20} />
                <span>E-mail</span>
              </button>
            </div>

            <div className="share-link">
              <input 
                type="text" 
                value={shareUrl} 
                readOnly 
                onClick={(e) => e.target.select()}
              />
              <button onClick={copyToClipboard} className="copy-btn">
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
