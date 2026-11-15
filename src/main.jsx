import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { HandHeart, LayoutDashboard, Megaphone, PackageCheck, ChartNoAxesCombined, Plus, Menu, Search } from 'lucide-react';
import { NotificationCenter } from './components/Notifications';
import { DonationChart, ProgressChart, StatsCards } from './components/Charts';
import { AdvancedFilters, applyFilters } from './components/AdvancedFilters';
import { ActivityTimeline } from './components/ActivityTimeline';
import { ShareButton } from './components/ShareCampaign';
import { ExportButton } from './components/ExportData';
import { DarkModeToggle } from './components/DarkMode';
import './style.css';
import './bento-theme.css';

const sample = {
  campaigns: [
    {
      id: 'a',
      name: 'Inverno Solidário',
      category: 'Agasalhos',
      status: 'Ativa',
      end: '2026-08-30',
      needs: [
        { item: 'Cobertores', goal: 70, unit: 'unidades' },
        { item: 'Casacos', goal: 50, unit: 'unidades' }
      ]
    },
    {
      id: 'b',
      name: 'Mesa Cheia',
      category: 'Alimentos',
      status: 'Ativa',
      end: '2026-12-20',
      needs: [
        { item: 'Arroz', goal: 120, unit: 'kg' },
        { item: 'Feijão', goal: 80, unit: 'kg' }
      ]
    }
  ],
  donations: []
};

const read = () => {
  try {
    return JSON.parse(localStorage.getItem('bs-demo')) || sample;
  } catch {
    return sample;
  }
};

function App() {
  const [data, S] = useState(read);
  const [page, P] = useState('Visão geral');
  const [modal, M] = useState(false);
  const [mobile, B] = useState(false);
  const [q, Q] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'recent'
  });

  function save(x) {
    S(x);
    localStorage.setItem('bs-demo', JSON.stringify(x));
  }

  const nav = [
    ['Visão geral', LayoutDashboard],
    ['Campanhas', Megaphone],
    ['Doações', HandHeart],
    ['Necessidades', PackageCheck],
    ['Relatórios', ChartNoAxesCombined]
  ];

  const received = data.donations.filter(d => d.status === 'Recebida');
  const total = received.length;

  // Aplicar filtros
  const filteredCampaigns = applyFilters(
    data.campaigns.filter(c => c.name.toLowerCase().includes(q.toLowerCase())),
    filters,
    'campaigns'
  );

  return (
    <div className="app">
      <aside className={mobile ? 'side open' : 'side'}>
        <div className="brand">
          <img src="/logo2.png" alt="Grupo Bahamas" className="brand-logo" />
        </div>
        <small>ESPAÇO DE TRABALHO</small>
        {nav.map(([n, I]) => (
          <button 
            key={n}
            className={page === n ? 'active' : ''} 
            onClick={() => { P(n); B(false); }}
          >
            <I size={18} />{n}
          </button>
        ))}
        <div className="demo">● Ambiente demonstrativo</div>
      </aside>

      {mobile && <div className="shade" onClick={() => B(false)} />}

      <main>
        <header>
          <button className="hamb" onClick={() => B(true)}>
            <Menu />
          </button>
          <small>Gestão　/　<strong>{page}</strong></small>
          <span>Bahamas Solidário</span>
          <div className="header-actions">
            <DarkModeToggle />
            <NotificationCenter data={data} />
          </div>
        </header>

        <section className="wrap">
          <p className="over">BAHAMAS SOLIDÁRIO · GESTÃO</p>
          <div className="title">
            <div>
              <h1>{page}</h1>
              <p>Acompanhe campanhas, necessidades e impacto das doações.</p>
            </div>
            {['Campanhas', 'Doações'].includes(page) && (
              <button 
                className="primary" 
                onClick={() => M(page === 'Campanhas' ? 'campaign' : 'donation')}
              >
                <Plus size={17} />
                {page === 'Campanhas' ? 'Nova campanha' : 'Registrar doação'}
              </button>
            )}
          </div>

          <div className="notice">
            Ambiente demonstrativo
            <span>Os dados são exemplos e ficam salvos apenas neste navegador.</span>
          </div>

          {page === 'Visão geral' && (
            <>
              <div className="metrics">
                <Metric 
                  icon={Megaphone} 
                  label="Campanhas ativas" 
                  value={data.campaigns.filter(c => c.status === 'Ativa').length} 
                />
                <Metric 
                  icon={HandHeart} 
                  label="Doações recebidas" 
                  value={received.length} 
                />
                <Metric 
                  icon={PackageCheck} 
                  label="Registros recebidos" 
                  value={total} 
                />
                <Metric 
                  icon={ChartNoAxesCombined} 
                  label="Campanhas cadastradas" 
                  value={data.campaigns.length} 
                />
              </div>

              <div className="stats-row">
                <StatsCards data={data} />
              </div>

              <div className="columns">
                <section className="panel">
                  <h2>Campanhas em andamento</h2>
                  <p className="muted">Acompanhe as iniciativas ativas</p>
                  {data.campaigns.map(c => (
                    <div key={c.id} className="campaign">
                      <b>{c.name}</b>
                      <span className="tag">{c.status}</span>
                      <ShareButton campaign={c} />
                      <p>{c.category} · até {new Date(c.end).toLocaleDateString('pt-BR')}</p>
                      <div className="bar">
                        <i style={{
                          width: Math.min(100, Math.round(
                            c.needs.reduce((sum, n) => 
                              sum + received.filter(d => d.campaign === c.id && d.item === n.item)
                                .reduce((a, d) => a + Number(d.quantity), 0), 0
                            ) / c.needs.reduce((sum, n) => sum + n.goal, 0) * 100
                          )) + '%'
                        }} />
                      </div>
                    </div>
                  ))}
                </section>

                <section className="panel">
                  <h2>Doações recentes</h2>
                  <p className="muted">Registros da equipe</p>
                  {data.donations.slice(0, 5).map((d, i) => (
                    <div key={i} className="donation">
                      <b>{d.quantity} {d.unit} de {d.item}</b>
                      <p>{data.campaigns.find(c => c.id === d.campaign)?.name} · {d.status}</p>
                    </div>
                  ))}
                  {!data.donations.length && (
                    <p className="muted">Ainda não há doações registradas.</p>
                  )}
                </section>
              </div>

              <div className="charts-grid">
                <DonationChart data={data} />
                <ProgressChart data={data} />
              </div>

              <ActivityTimeline data={data} />
            </>
          )}

          {page === 'Campanhas' && (
            <section className="panel">
              <div className="filter-bar">
                <div className="search">
                  <Search size={17} />
                  <input 
                    placeholder="Buscar campanha" 
                    value={q} 
                    onChange={e => Q(e.target.value)} 
                  />
                </div>
                <AdvancedFilters onFilterChange={setFilters} />
              </div>

              {filteredCampaigns.map(c => (
                <div key={c.id} className="campaign">
                  <b>{c.name}</b>
                  <span className="tag">{c.status}</span>
                  <ShareButton campaign={c} />
                  <p>{c.category} · encerramento {new Date(c.end).toLocaleDateString('pt-BR')}</p>
                  {c.needs.map((n, i) => (
                    <small key={i}>{n.item}: meta {n.goal} {n.unit}　</small>
                  ))}
                  <button 
                    className="plain" 
                    onClick={() => save({
                      ...data,
                      campaigns: data.campaigns.map(x => 
                        x.id === c.id 
                          ? { ...x, status: x.status === 'Ativa' ? 'Concluída' : 'Ativa' }
                          : x
                      )
                    })}
                  >
                    Alterar situação
                  </button>
                </div>
              ))}
            </section>
          )}

          {page === 'Doações' && (
            <section className="panel">
              <div className="search">
                <Search size={17} />
                <input 
                  placeholder="Pesquisar doações" 
                  value={q} 
                  onChange={e => Q(e.target.value)} 
                />
              </div>
              {data.donations
                .filter(d => d.item.toLowerCase().includes(q.toLowerCase()))
                .map((d, i) => (
                  <div key={i} className="donation">
                    <b>{d.quantity} {d.unit} · {d.item}</b>
                    <p>{d.status}</p>
                    {d.notes && <small className="donation-notes">📝 {d.notes}</small>}
                  </div>
                ))}
            </section>
          )}

          {page === 'Necessidades' && (
            <div className="metrics needs">
              {data.campaigns.flatMap(c =>
                c.needs.map((n, i) => {
                  let got = received
                    .filter(d => d.campaign === c.id && d.item === n.item)
                    .reduce((s, d) => s + Number(d.quantity), 0);
                  const percentage = (got / n.goal) * 100;
                  const urgency = percentage < 30 && new Date(c.end) - new Date() < 14 * 24 * 60 * 60 * 1000;

                  return (
                    <section key={`${c.id}-${i}`} className={`panel ${urgency ? 'urgent' : ''}`}>
                      <div className="need-labels">
                        <span className="tag">{c.name}</span>
                        {urgency && <span className="urgent-badge">⚠ Urgente</span>}
                      </div>
                      <h2>{n.item}</h2>
                      <p>{got} de {n.goal} {n.unit}</p>
                      <div className="bar">
                        <i style={{ width: Math.min(100, percentage) + '%' }} />
                      </div>
                      <small>Faltam {Math.max(0, n.goal - got)} {n.unit}</small>
                    </section>
                  );
                })
              )}
            </div>
          )}

          {page === 'Relatórios' && (
            <section className="panel">
              <h2>Relatório de doações</h2>
              <p className="muted">Dados demonstrativos. Exportação em múltiplos formatos.</p>
              
              <div className="report-stats">
                <div className="report-stat">
                  <strong>{data.donations.length}</strong>
                  <span>Total de registros</span>
                </div>
                <div className="report-stat">
                  <strong>{received.length}</strong>
                  <span>Doações recebidas</span>
                </div>
                <div className="report-stat">
                  <strong>{data.campaigns.length}</strong>
                  <span>Campanhas ativas</span>
                </div>
              </div>

              <ExportButton data={data} />

              <div className="charts-grid" style={{ marginTop: '30px' }}>
                <DonationChart data={data} />
                <ProgressChart data={data} />
              </div>
            </section>
          )}
        </section>

        <footer>
          Sistema demonstrativo · dados armazenados neste navegador
        </footer>
      </main>

      {modal === 'campaign' && (
        <Campaign close={() => M(false)} save={c => save({ ...data, campaigns: [c, ...data.campaigns] })} />
      )}
      
      {modal === 'donation' && (
        <Donation 
          campaigns={data.campaigns} 
          close={() => M(false)} 
          save={d => save({ ...data, donations: [d, ...data.donations] })} 
        />
      )}
    </div>
  );
}

function Metric({ icon: I, label, value }) {
  return (
    <div className="metric">
      <div>
        {label}
        <span><I size={17} /></span>
      </div>
      <strong>{value}</strong>
      <small>Dados registrados</small>
    </div>
  );
}

function Donation({ campaigns, close, save }) {
  const [notes, setNotes] = useState('');

  function submit(e) {
    e.preventDefault();
    let f = new FormData(e.target);
    save({
      id: crypto.randomUUID(),
      campaign: f.get('campaign'),
      item: f.get('item'),
      quantity: f.get('quantity'),
      unit: f.get('unit'),
      status: f.get('status'),
      notes: notes
    });
    close();
  }

  return (
    <div className="shade modal">
      <form onSubmit={submit}>
        <button type="button" className="x" onClick={close}>×</button>
        <p className="over">NOVO REGISTRO</p>
        <h2>Registrar doação</h2>
        
        <label>
          Campanha
          <select name="campaign">
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        
        <label>
          Item recebido
          <input name="item" required />
        </label>
        
        <div className="two">
          <label>
            Quantidade
            <input name="quantity" type="number" min=".01" step="any" required />
          </label>
          <label>
            Unidade
            <input name="unit" placeholder="unidades, kg" required />
          </label>
        </div>
        
        <label>
          Situação
          <select name="status">
            <option>Recebida</option>
            <option>Pendente</option>
          </select>
        </label>

        <label>
          Observações (opcional)
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione notas ou comentários sobre esta doação"
            rows="3"
          />
        </label>
        
        <p className="muted">Intenções pendentes não entram nos totais recebidos.</p>
        <button className="primary">Salvar doação</button>
      </form>
    </div>
  );
}

function Campaign({ close, save }) {
  function submit(e) {
    e.preventDefault();
    let f = new FormData(e.target);
    let c = {
      id: crypto.randomUUID(),
      name: f.get('name'),
      category: f.get('category'),
      status: 'Ativa',
      end: f.get('end'),
      needs: [{
        item: f.get('item'),
        goal: Number(f.get('goal')),
        unit: f.get('unit')
      }]
    };
    save(c);
    close();
  }

  return (
    <div className="shade modal">
      <form onSubmit={submit}>
        <button type="button" className="x" onClick={close}>×</button>
        <p className="over">NOVA INICIATIVA</p>
        <h2>Criar campanha</h2>
        
        <label>
          Nome
          <input name="name" required />
        </label>
        
        <label>
          Categoria
          <select name="category" required>
            <option value="">Selecione...</option>
            <option value="Agasalhos">Agasalhos</option>
            <option value="Alimentos">Alimentos</option>
            <option value="Brinquedos">Brinquedos</option>
            <option value="Livros">Livros</option>
            <option value="Higiene">Higiene</option>
          </select>
        </label>
        
        <div className="two">
          <label>
            Item necessário
            <input name="item" required />
          </label>
          <label>
            Meta
            <input name="goal" type="number" min="1" required />
          </label>
        </div>
        
        <div className="two">
          <label>
            Unidade
            <input name="unit" placeholder="kg, unidades" required />
          </label>
          <label>
            Data de encerramento
            <input name="end" type="date" required />
          </label>
        </div>
        
        <button className="primary">Criar campanha</button>
      </form>
    </div>
  );
}

const mount = createRoot(document.getElementById('root'));
mount.render(<App />);
