# 👨‍💻 Notas para Desenvolvedores

## 📋 Visão Geral Técnica

Este documento contém informações técnicas, decisões de arquitetura e dicas para desenvolvedores que trabalharão com o código do Bahamas Solidário v2.0.

---

## 🏗️ Arquitetura

### Estrutura de Componentes

```
App (main.jsx)
├── Sidebar (navegação)
├── Header
│   ├── DarkModeToggle
│   └── NotificationCenter
└── Main Content (pages)
    ├── Visão Geral
    │   ├── Metric (x4)
    │   ├── StatsCards (x3)
    │   ├── Campaigns Panel
    │   ├── Donations Panel
    │   ├── DonationChart
    │   ├── ProgressChart
    │   └── ActivityTimeline
    ├── Campanhas
    │   ├── AdvancedFilters
    │   ├── Search
    │   └── Campaign Items (with ShareButton)
    ├── Doações
    │   ├── Search
    │   └── Donation Items
    ├── Necessidades
    │   └── Need Cards (with urgency badges)
    └── Relatórios
        ├── Stats Summary
        ├── ExportButton
        └── Charts
```

---

## 🔧 Tecnologias e Decisões

### Por que React sem Context API ou Redux?

**Decisão:** Gerenciamento de estado local com `useState`

**Motivo:**
- Sistema demonstrativo de porte pequeno-médio
- Estado é simples e não profundamente aninhado
- Props drilling é mínimo
- Adicionar Context/Redux seria over-engineering

**Quando reconsiderar:**
- Se o app crescer para >20 componentes
- Se houver estado compartilhado complexo
- Se adicionar autenticação multi-usuário

### Por que localStorage?

**Decisão:** Persistência via localStorage, não sessionStorage ou IndexedDB

**Motivo:**
- Persistência entre sessões
- API simples
- Suficiente para dados pequenos (<5MB)
- Não requer configuração

**Limitações:**
- Limite de ~5-10MB (varia por navegador)
- Síncrono (pode bloquear UI em datasets grandes)
- Não criptografado
- Não compartilhado entre dispositivos

**Quando reconsiderar:**
- IndexedDB para datasets maiores (>1MB)
- Backend para sincronização multi-dispositivo
- Encryption para dados sensíveis

### Por que CSS puro?

**Decisão:** CSS customizado sem frameworks (Tailwind, Bootstrap, etc.)

**Motivo:**
- Bundle size menor
- Controle total sobre estilos
- Sem curva de aprendizado adicional
- Não há conflitos de especificidade

**Prós:**
- Performance ótima
- Customização completa
- Manutenção direta

**Contras:**
- Mais código CSS
- Sem utilitários prontos

**Quando reconsiderar:**
- Tailwind se houver muitos desenvolvedores diferentes
- Styled-components se precisar de estilos dinâmicos complexos
- Material-UI se precisar de componentes prontos

---

## 📦 Gestão de Dependências

### Dependências de Produção

```json
{
  "bootstrap": "^5.3.3",        // ⚠️ Não usado atualmente
  "leaflet": "1.9.4",            // ⚠️ Não usado atualmente
  "lucide-react": "^0.441.0",    // ✅ Ícones
  "react": "^18.3.1",            // ✅ Core
  "react-dom": "^18.3.1",        // ✅ Core
  "react-leaflet": "4.2.1"       // ⚠️ Não usado atualmente
}
```

### ⚠️ Limpeza Sugerida

Remover dependências não usadas:

```bash
npm uninstall bootstrap leaflet react-leaflet
```

**Economia estimada:** ~500KB no bundle

### Versões Fixas vs Semver

- `lucide-react: ^0.441.0` - Permite minor/patch updates
- `leaflet: 1.9.4` - Versão exata
- `react: ^18.3.1` - Permite patch updates

**Recomendação:** Manter versões fixas em produção para evitar surpresas.

---

## 🎨 Sistema de Estilos

### Convenções CSS

#### BEM Modificado
```css
/* Block */
.notification-panel { }

/* Element */
.notification-header { }
.notification-list { }
.notification-item { }

/* Modifier */
.notification-item.success { }
.notification-item.warning { }
```

#### Variáveis CSS (poderia ser implementado)

Atualmente cores são hard-coded. Melhor prática seria:

```css
:root {
  /* Brand Colors */
  --color-primary: #271d67;
  --color-secondary: #526db7;
  --color-accent: #e51a26;
  
  /* Neutral Colors */
  --color-bg: #f7f8f6;
  --color-text: #202d29;
  --color-muted: #78847e;
  
  /* Dark Mode */
  --color-bg-dark: #1a1a2e;
  --color-surface-dark: #16213e;
}

/* Uso */
.primary {
  background: var(--color-primary);
}

body.dark-mode {
  --color-bg: var(--color-bg-dark);
}
```

**Vantagem:** Tema dinâmico com uma mudança

### Responsividade

#### Breakpoints Definidos

```css
/* Desktop-first approach */
@media(max-width: 1100px) { /* Tablet large */ }
@media(max-width: 900px)  { /* Tablet */ }
@media(max-width: 650px)  { /* Mobile */ }
@media(max-width: 390px)  { /* Mobile small */ }
```

**Sugestão:** Criar constantes JavaScript

```javascript
export const BREAKPOINTS = {
  mobile: 650,
  tablet: 900,
  desktop: 1100
};

// Uso com window.matchMedia
const isMobile = window.matchMedia(`(max-width: ${BREAKPOINTS.mobile}px)`).matches;
```

---

## 🔄 Estado e Props

### Padrão de Props

Componentes recebem props tipados implicitamente:

```jsx
// ❌ Evitar props genéricos
function Component(props) { }

// ✅ Preferir destructuring
function Component({ data, onSave, isOpen }) { }
```

### Estado Local vs Props

**Estado Local** (`useState`):
- Dados controlados pelo componente
- Não compartilhados
- Ex: modal aberto/fechado, input value

**Props**:
- Dados passados pelo pai
- Leitura única (imutável)
- Ex: lista de campanhas, callbacks

### Lifting State Up

Quando dois componentes precisam do mesmo estado:

```jsx
// ❌ Estado duplicado
function ComponentA() {
  const [data, setData] = useState([]);
}
function ComponentB() {
  const [data, setData] = useState([]); // Duplicado!
}

// ✅ Estado elevado
function Parent() {
  const [data, setData] = useState([]);
  return (
    <>
      <ComponentA data={data} />
      <ComponentB data={data} />
    </>
  );
}
```

---

## 🎯 Performance

### Re-renders

Componentes re-renderizam quando:
1. Estado interno muda (`setState`)
2. Props mudam
3. Componente pai re-renderiza

### Otimizações Possíveis

#### 1. React.memo
```jsx
// Evita re-render se props não mudarem
export const ExpensiveComponent = React.memo(({ data }) => {
  // Lógica pesada
});
```

#### 2. useMemo
```jsx
// Cache de cálculos pesados
const expensiveResult = useMemo(() => {
  return data.reduce(/* ... */);
}, [data]); // Só recalcula se data mudar
```

#### 3. useCallback
```jsx
// Cache de funções
const handleSave = useCallback((item) => {
  save(item);
}, [save]); // Função estável
```

### Quando NÃO otimizar

- Componentes pequenos e rápidos
- Props que sempre mudam
- Antes de medir performance real

**Regra:** Otimize quando houver lag visível, não preventivamente.

---

## 📊 Dados e Transformações

### Estrutura de Dados

```typescript
// TypeScript interfaces (para referência)

interface Campaign {
  id: string;
  name: string;
  category: string;
  status: 'Ativa' | 'Concluída';
  end: string; // ISO date
  needs: Need[];
}

interface Need {
  item: string;
  goal: number;
  unit: string;
}

interface Donation {
  id: string;
  campaign: string; // Campaign ID
  item: string;
  quantity: number;
  unit: string;
  status: 'Recebida' | 'Pendente';
  notes?: string;
}

interface AppData {
  campaigns: Campaign[];
  donations: Donation[];
}
```

### Transformações Comuns

```javascript
// Filtrar doações recebidas
const received = donations.filter(d => d.status === 'Recebida');

// Agrupar por campanha
const byCampaign = campaigns.map(c => ({
  campaign: c,
  donations: donations.filter(d => d.campaign === c.id)
}));

// Calcular progresso
const progress = need.goal > 0 
  ? (received / need.goal) * 100 
  : 0;

// Ordenar por data
campaigns.sort((a, b) => new Date(b.end) - new Date(a.end));
```

---

## 🧪 Testes (Sugestões)

### Estrutura de Testes

```
src/
├── components/
│   ├── Notifications.jsx
│   └── __tests__/
│       └── Notifications.test.jsx
```

### Ferramentas Recomendadas

- **Vitest** - Test runner (compatível com Vite)
- **React Testing Library** - Testes de componentes
- **MSW** - Mock Service Worker (para APIs futuras)

### Exemplo de Teste

```jsx
import { render, screen } from '@testing-library/react';
import { NotificationCenter } from '../Notifications';

describe('NotificationCenter', () => {
  it('shows badge when has notifications', () => {
    const data = {
      campaigns: [{ /* ... */ }],
      donations: []
    };
    
    render(<NotificationCenter data={data} />);
    
    const badge = screen.getByText(/\d+/);
    expect(badge).toBeInTheDocument();
  });
});
```

---

## 🔐 Segurança

### Preocupações Atuais

#### localStorage
- ❌ Não criptografado
- ❌ Acessível por JavaScript
- ❌ Vulnerável a XSS

**Mitigação:**
- Evitar armazenar tokens/senhas
- Sanitizar inputs antes de salvar
- Validar dados ao ler

#### XSS (Cross-Site Scripting)

React já protege contra XSS por padrão ao usar `{}`:

```jsx
// ✅ Seguro (React escapa automaticamente)
<div>{userInput}</div>

// ⚠️ Perigoso (bypass da proteção)
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

**Regra:** Nunca usar `dangerouslySetInnerHTML` com input de usuário.

### Para Produção

Se adicionar backend:

1. **Validação de Input**
   ```javascript
   // Exemplo com Zod
   const CampaignSchema = z.object({
     name: z.string().min(1).max(100),
     category: z.string(),
     end: z.string().datetime()
   });
   ```

2. **Rate Limiting**
   - Limitar criação de campanhas/doações
   - Prevenir spam

3. **HTTPS**
   - Obrigatório em produção
   - Certificado SSL válido

4. **Headers de Segurança**
   ```javascript
   // Helmet.js ou equivalente
   helmet({
     contentSecurityPolicy: { /* ... */ },
     xssFilter: true,
     noSniff: true
   })
   ```

---

## 🔄 Git Workflow (Sugestões)

### Branch Strategy

```
main (produção)
├── develop (desenvolvimento)
    ├── feature/notifications
    ├── feature/dark-mode
    └── hotfix/bug-xyz
```

### Commits Semânticos

```
feat: adiciona sistema de notificações
fix: corrige bug no cálculo de progresso
docs: atualiza README com novas funcionalidades
style: ajusta espaçamento do header
refactor: extrai lógica de filtros para hook
test: adiciona testes para componente Charts
chore: atualiza dependências
```

---

## 🚀 Build e Deploy

### Build para Produção

```bash
npm run build
```

Gera em `dist/`:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── logo2.png
```

### Otimizações de Build

Vite já faz:
- ✅ Minificação JS/CSS
- ✅ Tree-shaking
- ✅ Code splitting (dinâmico)
- ✅ Asset optimization

### Opções de Deploy

#### Vercel (Recomendado)
```bash
npm i -g vercel
vercel
```

#### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

#### GitHub Pages
```json
// package.json
{
  "homepage": "https://username.github.io/repo",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

---

## 📈 Métricas e Monitoramento

### Ferramentas Sugeridas

1. **Google Analytics 4**
   ```html
   <!-- Em index.html -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
   ```

2. **Sentry** (Error tracking)
   ```javascript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: "...",
     environment: import.meta.env.MODE
   });
   ```

3. **Web Vitals**
   ```javascript
   import { getCLS, getFID, getFCP } from 'web-vitals';
   
   getCLS(console.log);
   getFID(console.log);
   getFCP(console.log);
   ```

---

## 🐛 Debug

### React DevTools

Extensão essencial para Chrome/Firefox:
- Inspecionar árvore de componentes
- Ver props e estado
- Profiler para performance

### Console Helpers

```javascript
// Condicional (apenas dev)
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}

// Grupos
console.group('Filtros Aplicados');
console.log('Status:', filters.status);
console.log('Categoria:', filters.category);
console.groupEnd();

// Tabelas
console.table(campaigns);

// Tempo
console.time('Cálculo');
// código pesado
console.timeEnd('Cálculo');
```

---

## 📝 TODOs Técnicos

### Curto Prazo
- [ ] Adicionar PropTypes ou TypeScript
- [ ] Implementar lazy loading de componentes
- [ ] Adicionar testes unitários
- [ ] Remover dependências não usadas
- [ ] Configurar ESLint + Prettier

### Médio Prazo
- [ ] Migrar para TypeScript
- [ ] Adicionar Storybook
- [ ] Implementar CI/CD
- [ ] Adicionar E2E tests (Playwright/Cypress)
- [ ] PWA com Service Worker

### Longo Prazo
- [ ] Backend com Node.js/Express
- [ ] Banco de dados (PostgreSQL)
- [ ] Autenticação JWT
- [ ] Upload de imagens (S3/Cloudinary)
- [ ] API GraphQL

---

## 🎓 Recursos de Aprendizado

### React
- [React Docs (Beta)](https://react.dev/)
- [Patterns.dev](https://patterns.dev/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### Vite
- [Vite Guide](https://vitejs.dev/guide/)
- [Vite Plugins](https://vitejs.dev/plugins/)

### Performance
- [Web.dev Performance](https://web.dev/performance/)
- [React Performance](https://react.dev/learn/render-and-commit)

---

## 🤝 Convenções do Projeto

### Nomenclatura

```javascript
// Componentes: PascalCase
function NotificationCenter() { }

// Funções: camelCase
function calculateProgress() { }

// Constantes: UPPER_SNAKE_CASE
const MAX_NOTIFICATIONS = 10;

// Arquivos: PascalCase para componentes, kebab-case para utils
// ✅ NotificationCenter.jsx
// ✅ use-filters.js
```

### Organização de Imports

```javascript
// 1. External
import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';

// 2. Internal
import { formatDate } from '../utils';

// 3. Styles
import './Notifications.css';
```

---

## 💡 Dicas Finais

1. **Leia o código antes de modificar** - Entenda o padrão existente
2. **Teste manualmente** - Sempre teste no navegador após mudanças
3. **Commit frequentemente** - Pequenos commits são melhores
4. **Documente decisões** - Atualize este arquivo ao fazer escolhas arquiteturais
5. **Peça review** - Duas cabeças pensam melhor que uma

---

**Boa codificação! 🚀**
