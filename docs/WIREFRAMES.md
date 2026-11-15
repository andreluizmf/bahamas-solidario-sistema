# 🎨 Wireframes e Layouts - Bahamas Solidário v2.0

## 📱 Visão Geral das Telas

Este documento mostra a estrutura visual de cada página em formato texto ASCII.

---

## 🖥️ Desktop Layout (>900px)

### Header (Todas as páginas)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ☰  Gestão / Visão geral          Bahamas Solidário          🌙  🔔(2)   │
└──────────────────────────────────────────────────────────────────────────┘
   │                                                             │   │
   └─ Hamburguer (mobile)                                       │   └─ Notificações
                                                                └─ Dark Mode
```

### Sidebar (Desktop)

```
┌────────────────────┐
│                    │
│  [LOGO BAHAMAS]    │
│                    │
├────────────────────┤
│ ESPAÇO DE TRABALHO │
├────────────────────┤
│                    │
│ 📊 Visão geral     │ ← Active
│ 📢 Campanhas       │
│ 🎁 Doações         │
│ 🎯 Necessidades    │
│ 📈 Relatórios      │
│                    │
│                    │
│                    │
├────────────────────┤
│ ● Ambiente demo    │
└────────────────────┘
```

---

## 📄 Página: Visão Geral

```
┌──────────────────────────────────────────────────────────────────────────┐
│ BAHAMAS SOLIDÁRIO · GESTÃO                                               │
│                                                                          │
│ Visão geral                                                              │
│ Acompanhe campanhas, necessidades e impacto das doações.                 │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────┐    │
│ │ Ambiente demonstrativo   Os dados são exemplos...               │    │
│ └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│ ┌─────────────┬─────────────┬─────────────┬─────────────┐              │
│ │ 📢          │ 🎁          │ 📦          │ 📊          │              │
│ │ Campanhas   │ Doações     │ Registros   │ Campanhas   │              │
│ │ ativas      │ recebidas   │ recebidos   │ cadastradas │              │
│ │     2       │     15      │     15      │     2       │              │
│ │ Dados...    │ Dados...    │ Dados...    │ Dados...    │              │
│ └─────────────┴─────────────┴─────────────┴─────────────┘              │
│                                                                          │
│ ┌────────────────┬────────────────┬────────────────┐                    │
│ │ 🎯             │ 📅             │ 📈             │                    │
│ │ Taxa de        │ Doações        │ Tendência      │                    │
│ │ Conclusão      │ Pendentes      │                │                    │
│ │    50%         │     0          │    +12%        │                    │
│ │ 1 de 2...      │ Aguardando...  │ Variação...    │                    │
│ └────────────────┴────────────────┴────────────────┘                    │
│                                                                          │
│ ┌────────────────────────────────┬────────────────────────────┐         │
│ │ Campanhas em andamento         │ Doações recentes           │         │
│ │ Acompanhe as iniciativas...    │ Registros da equipe        │         │
│ │                                │                            │         │
│ │ Inverno Solidário     [Ativa]  │ 10 kg de Arroz            │         │
│ │ ↗                              │ Mesa Cheia · Recebida      │         │
│ │ Agasalhos · até 30/08/26       │                            │         │
│ │ ████████░░░░░░░░░ 45%          │ 5 unidades de Cobertor     │         │
│ │                                │ Inverno Solid. · Recebida  │         │
│ │ Mesa Cheia           [Ativa]   │                            │         │
│ │ ↗                              │ ...                        │         │
│ │ Alimentos · até 20/12/26       │                            │         │
│ │ ████░░░░░░░░░░░░░░ 25%         │                            │         │
│ └────────────────────────────────┴────────────────────────────┘         │
│                                                                          │
│ ┌──────────────────────────────┬──────────────────────────────┐         │
│ │ Distribuição de Doações      │ Progresso das Campanhas      │         │
│ │ Quantidade de doações...     │ Percentual de conclusão...   │         │
│ │                              │                              │         │
│ │ Inverno Solidário            │ Inverno Solidário      45%   │         │
│ │ ████████████░░░░░░░░░░  8    │ ████████████░░░░░░░░░        │         │
│ │                              │                              │         │
│ │ Mesa Cheia                   │ Mesa Cheia             25%   │         │
│ │ ███████░░░░░░░░░░░░░░░  7    │ ███████░░░░░░░░░░░░░         │         │
│ └──────────────────────────────┴──────────────────────────────┘         │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────┐        │
│ │ Linha do Tempo                                               │        │
│ │ Histórico de atividades recentes                             │        │
│ │                                                              │        │
│ │ 📢  Campanha "Inverno Solidário" criada                      │        │
│ │     Agasalhos · Meta até 30/08/2026                          │        │
│ │     🕐 há 2 dias                                             │        │
│ │                                                              │        │
│ │ ✅  Doação recebida                                          │        │
│ │     10 kg de Arroz · Mesa Cheia                             │        │
│ │     🕐 há 5 horas                                            │        │
│ │                                                              │        │
│ │ ...                                                          │        │
│ └──────────────────────────────────────────────────────────────┘        │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 📄 Página: Campanhas

```
┌──────────────────────────────────────────────────────────────────────────┐
│ BAHAMAS SOLIDÁRIO · GESTÃO                                               │
│                                                                          │
│ Campanhas                                        [+ Nova campanha]       │
│ Acompanhe campanhas, necessidades...                                     │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────┐    │
│ │ Ambiente demonstrativo   Os dados são exemplos...               │    │
│ └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────┐    │
│ │ ┌────────────────────────┬────────────────────────┐             │    │
│ │ │ 🔍 Buscar campanha     │ 🔧 Filtros avançados(2)│             │    │
│ │ └────────────────────────┴────────────────────────┘             │    │
│ │                                                                  │    │
│ │ Inverno Solidário                                      [Ativa] ↗ │    │
│ │ Agasalhos · encerramento 30/08/2026                              │    │
│ │ Cobertores: meta 70 unidades   Casacos: meta 50 unidades        │    │
│ │ [Alterar situação]                                               │    │
│ │ ────────────────────────────────────────────────────────────────│    │
│ │                                                                  │    │
│ │ Mesa Cheia                                             [Ativa] ↗ │    │
│ │ Alimentos · encerramento 20/12/2026                              │    │
│ │ Arroz: meta 120 kg   Feijão: meta 80 kg                         │    │
│ │ [Alterar situação]                                               │    │
│ │                                                                  │    │
│ └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Painel de Filtros (Expandido)

```
┌──────────────────────────┐
│ Filtros            [×]   │
├──────────────────────────┤
│                          │
│ 🏷️ Status               │
│ [Ativa          ▼]       │
│                          │
│ 🏷️ Categoria            │
│ [Alimentos      ▼]       │
│                          │
│ 📅 Data inicial          │
│ [01/01/2024    📅]       │
│                          │
│ 📅 Data final            │
│ [31/12/2024    📅]       │
│                          │
│ Ordenar por              │
│ [Mais recentes  ▼]       │
│                          │
│ ┌──────────────────────┐ │
│ │  Limpar filtros      │ │
│ └──────────────────────┘ │
│                          │
└──────────────────────────┘
```

---

## 📄 Página: Necessidades

```
┌──────────────────────────────────────────────────────────────────────────┐
│ BAHAMAS SOLIDÁRIO · GESTÃO                                               │
│                                                                          │
│ Necessidades                                                             │
│ Acompanhe campanhas, necessidades...                                     │
│                                                                          │
│ ┌─────────────────┬─────────────────┬─────────────────┐                 │
│ │ ⚠️ Urgente      │ [Inverno Sol.]  │ [Mesa Cheia]    │                 │
│ │ [Inverno Sol.]  │                 │                 │                 │
│ │                 │ Casacos         │ Feijão          │                 │
│ │ Cobertores      │                 │                 │                 │
│ │                 │ 12 de 50 un.    │ 20 de 80 kg     │                 │
│ │ 15 de 70 un.    │ ███░░░░░░  24%  │ ███░░░░░░  25%  │                 │
│ │ ███░░░░░░  21%  │ Faltam 38 un.   │ Faltam 60 kg    │                 │
│ │ Faltam 55 un.   │                 │                 │                 │
│ └─────────────────┴─────────────────┴─────────────────┘                 │
│                                                                          │
│ ┌─────────────────┬─────────────────┬─────────────────┐                 │
│ │ [Mesa Cheia]    │                 │                 │                 │
│ │                 │                 │                 │                 │
│ │ Arroz           │                 │                 │                 │
│ │                 │                 │                 │                 │
│ │ 30 de 120 kg    │                 │                 │                 │
│ │ ███░░░░░░  25%  │                 │                 │                 │
│ │ Faltam 90 kg    │                 │                 │                 │
│ └─────────────────┴─────────────────┴─────────────────┘                 │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 📄 Página: Relatórios

```
┌──────────────────────────────────────────────────────────────────────────┐
│ BAHAMAS SOLIDÁRIO · GESTÃO                                               │
│                                                                          │
│ Relatórios                                                               │
│ Acompanhe campanhas, necessidades...                                     │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────┐    │
│ │ Relatório de doações                                             │    │
│ │ Dados demonstrativos. Exportação em múltiplos formatos.          │    │
│ │                                                                  │    │
│ │ ┌─────────────┬─────────────┬─────────────┐                     │    │
│ │ │     15      │     15      │     2       │                     │    │
│ │ │ Total de    │ Doações     │ Campanhas   │                     │    │
│ │ │ registros   │ recebidas   │ ativas      │                     │    │
│ │ └─────────────┴─────────────┴─────────────┘                     │    │
│ │                                                                  │    │
│ │ [📥 Exportar dados]                                              │    │
│ │                                                                  │    │
│ │ ┌──────────────────────────┬──────────────────────────┐         │    │
│ │ │ Distribuição de Doações  │ Progresso das Campanhas  │         │    │
│ │ │ [Gráfico de barras]      │ [Gráfico de progresso]   │         │    │
│ │ └──────────────────────────┴──────────────────────────┘         │    │
│ │                                                                  │    │
│ └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Modais

### Modal: Criar Campanha

```
        ┌────────────────────────────────────────┐
        │                                  [×]   │
        │ NOVA INICIATIVA                        │
        │ Criar campanha                         │
        │                                        │
        │ Nome                                   │
        │ ┌────────────────────────────────────┐ │
        │ │ Digite o nome da campanha          │ │
        │ └────────────────────────────────────┘ │
        │                                        │
        │ Categoria                              │
        │ ┌────────────────────────────────────┐ │
        │ │ Selecione...                    ▼  │ │
        │ └────────────────────────────────────┘ │
        │                                        │
        │ Item necessário      Meta              │
        │ ┌────────────────┬─────────────────┐   │
        │ │ Ex: Cobertores │ Ex: 70          │   │
        │ └────────────────┴─────────────────┘   │
        │                                        │
        │ Unidade              Data encerramento │
        │ ┌────────────────┬─────────────────┐   │
        │ │ Ex: unidades   │ 31/12/2024   📅 │   │
        │ └────────────────┴─────────────────┘   │
        │                                        │
        │         [Criar campanha]               │
        │                                        │
        └────────────────────────────────────────┘
```

### Modal: Registrar Doação

```
        ┌────────────────────────────────────────┐
        │                                  [×]   │
        │ NOVO REGISTRO                          │
        │ Registrar doação                       │
        │                                        │
        │ Campanha                               │
        │ ┌────────────────────────────────────┐ │
        │ │ Inverno Solidário               ▼  │ │
        │ └────────────────────────────────────┘ │
        │                                        │
        │ Item recebido                          │
        │ ┌────────────────────────────────────┐ │
        │ │ Ex: Cobertores                     │ │
        │ └────────────────────────────────────┘ │
        │                                        │
        │ Quantidade           Unidade           │
        │ ┌────────────────┬─────────────────┐   │
        │ │ 10             │ unidades        │   │
        │ └────────────────┴─────────────────┘   │
        │                                        │
        │ Situação                               │
        │ ┌────────────────────────────────────┐ │
        │ │ Recebida                        ▼  │ │
        │ └────────────────────────────────────┘ │
        │                                        │
        │ Observações (opcional)                 │
        │ ┌────────────────────────────────────┐ │
        │ │ Adicione notas...                  │ │
        │ │                                    │ │
        │ └────────────────────────────────────┘ │
        │                                        │
        │ Intenções pendentes não entram...      │
        │                                        │
        │         [Salvar doação]                │
        │                                        │
        └────────────────────────────────────────┘
```

### Modal: Exportar Dados

```
        ┌────────────────────────────────────────┐
        │                                  [×]   │
        │ Exportar Dados                         │
        │ Escolha o formato de exportação        │
        │                                        │
        │ ┌────────────────────────────────────┐ │
        │ │ 📊  CSV (Excel)                    │ │
        │ │     Planilha compatível com Excel  │ │
        │ │     e Google Sheets                │ │
        │ └────────────────────────────────────┘ │
        │                                        │
        │ ┌────────────────────────────────────┐ │
        │ │ 📄  HTML (Relatório)               │ │
        │ │     Relatório formatado para       │ │
        │ │     impressão                      │ │
        │ └────────────────────────────────────┘ │
        │                                        │
        │ ┌────────────────────────────────────┐ │
        │ │ 📋  JSON                           │ │
        │ │     Formato estruturado para       │ │
        │ │     backup completo                │ │
        │ └────────────────────────────────────┘ │
        │                                        │
        └────────────────────────────────────────┘
```

### Modal: Compartilhar Campanha

```
        ┌────────────────────────────────────────┐
        │                                  [×]   │
        │ Compartilhar Campanha                  │
        │ Inverno Solidário                      │
        │                                        │
        │ ┌──────────┬──────────┬──────────┐     │
        │ │    f     │    🐦    │    ✉️    │     │
        │ │ Facebook │ Twitter  │  E-mail  │     │
        │ └──────────┴──────────┴──────────┘     │
        │                                        │
        │ ┌────────────────────────────────────┐ │
        │ │ https://localhost:5173?camp...   │ │
        │ └────────────────────────────────────┘ │
        │             [📋 Copiar]                │
        │                                        │
        └────────────────────────────────────────┘
```

### Painel: Notificações

```
        ┌────────────────────────────────────────┐
        │ Notificações                     [×]   │
        ├────────────────────────────────────────┤
        │                                        │
        │ ┌───┐                                  │
        │ │ ✅ │ Meta alcançada!                 │
        │ └───┘ Cobertores da campanha           │
        │       "Inverno Solidário" atingiu...   │
        │                                        │
        │ ┌───┐                                  │
        │ │ ℹ️ │ Próximo da meta                 │
        │ └───┘ Casacos da campanha "Inverno    │
        │       Solidário" está em 85%...        │
        │                                        │
        │ ┌───┐                                  │
        │ │ ⚠️ │ Atenção necessária              │
        │ └───┘ Feijão da campanha "Mesa        │
        │       Cheia" está em apenas 20%...     │
        │                                        │
        └────────────────────────────────────────┘
```

---

## 📱 Mobile Layout (<650px)

### Header Mobile

```
┌──────────────────────────────────────┐
│ ☰  Gestão / Visão geral   🌙  🔔(2)  │
└──────────────────────────────────────┘
   │                          │   │
   └─ Menu                    │   └─ Notificações
                              └─ Dark Mode
```

### Menu Lateral Aberto

```
┌──────────────────┬──────────────────────┐
│                  │ [SOMBRA]             │
│  [LOGO BAHAMAS]  │                      │
│                  │                      │
│ ESPAÇO DE TRAB.  │                      │
│                  │                      │
│ 📊 Visão geral   │                      │
│ 📢 Campanhas     │                      │
│ 🎁 Doações       │                      │
│ 🎯 Necessidades  │                      │
│ 📈 Relatórios    │                      │
│                  │                      │
│ ● Ambiente demo  │                      │
└──────────────────┴──────────────────────┘
```

### Cards Empilhados (Mobile)

```
┌────────────────────┐
│ 📢                 │
│ Campanhas ativas   │
│        2           │
│ Dados registrados  │
└────────────────────┘

┌────────────────────┐
│ 🎁                 │
│ Doações recebidas  │
│       15           │
│ Dados registrados  │
└────────────────────┘

┌────────────────────┐
│ 📦                 │
│ Registros receb.   │
│       15           │
│ Dados registrados  │
└────────────────────┘
```

---

## 🎨 Tema Escuro

### Exemplo: Header + Cards (Dark Mode)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [BG: #16213e]                                                            │
│ ☰  Gestão / Visão geral          Bahamas Solidário          ☀️  🔔(2)   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

[BG: #1a1a2e]

┌─────────────┬─────────────┬─────────────┬─────────────┐
│ [BG:#16213e]│ [BG:#16213e]│ [BG:#16213e]│ [BG:#16213e]│
│ 📢          │ 🎁          │ 📦          │ 📊          │
│ Campanhas   │ Doações     │ Registros   │ Campanhas   │
│ ativas      │ recebidas   │ recebidos   │ cadastradas │
│     2       │     15      │     15      │     2       │
│ [Text:#e4e4e7]                                        │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

---

## 🎯 Elementos Interativos

### Botões

```
┌────────────────────┐
│ + Nova campanha    │  ← Primary Button (Roxo)
└────────────────────┘

┌────────────────────┐
│ Alterar situação   │  ← Plain Button (Texto)
└────────────────────┘

┌──┐
│ ↗ │  ← Share Button (Compacto)
└──┘

┌──┐
│🌙 │  ← Icon Button (Dark Mode)
└──┘

┌───┐
│🔔 │(2)  ← Notification Button + Badge
└───┘
```

### Inputs

```
┌────────────────────────────────┐
│ 🔍  Buscar campanha            │  ← Search Input
└────────────────────────────────┘

┌────────────────────────────────┐
│ Digite o nome da campanha      │  ← Text Input
└────────────────────────────────┘

┌────────────────────────────────┐
│ Selecione...                ▼  │  ← Select/Dropdown
└────────────────────────────────┘

┌────────────────────────────────┐
│                             📅 │  ← Date Input
└────────────────────────────────┘
```

### Progress Bars

```
████████████░░░░░░░░░░░░░░░░  45%  ← Normal (Azul)
████████████████████████████ 100%  ← Completo (Verde)
███░░░░░░░░░░░░░░░░░░░░░░░░  12%  ← Urgente (Laranja)
```

### Tags/Badges

```
┌──────────┐
│  Ativa   │  ← Status Badge (Roxo claro)
└──────────┘

┌───────────┐
│ ⚠️ Urgente │  ← Urgent Badge (Laranja)
└───────────┘

┌─────┐
│ (2) │  ← Notification Counter (Vermelho)
└─────┘
```

---

## 📐 Grid Layouts

### Desktop (3 colunas)

```
┌────────────┬────────────┬────────────┐
│   Card 1   │   Card 2   │   Card 3   │
└────────────┴────────────┴────────────┘
```

### Tablet (2 colunas)

```
┌────────────┬────────────┐
│   Card 1   │   Card 2   │
└────────────┴────────────┘
┌────────────┬────────────┐
│   Card 3   │   Card 4   │
└────────────┴────────────┘
```

### Mobile (1 coluna)

```
┌────────────┐
│   Card 1   │
└────────────┘
┌────────────┐
│   Card 2   │
└────────────┘
┌────────────┐
│   Card 3   │
└────────────┘
```

---

## 🎨 Paleta de Cores (ASCII)

```
MODO CLARO:
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ #271d67  │ │ #526db7  │ │ #e51a26  │ │ #f7f8f6  │
│  Roxo    │ │  Azul    │ │ Vermelho │ │  Fundo   │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

MODO ESCURO:
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ #1a1a2e  │ │ #16213e  │ │ #2a3a5e  │ │ #e4e4e7  │
│  Fundo   │ │ Surface  │ │  Border  │ │  Texto   │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

---

**✨ Wireframes do Bahamas Solidário v2.0**
