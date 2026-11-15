# Estrutura do Projeto

## 📁 Árvore de Diretórios

```
bahamas-solidario/
├── .gitignore              # Arquivos ignorados pelo Git
├── index.html              # HTML principal
├── package.json            # Dependências e scripts
├── README.md               # Documentação principal
├── vite.config.js          # Configuração do Vite
│
├── docs/                   # Documentação completa
│   ├── CHANGELOG.md
│   ├── COMANDOS_UTEIS.md
│   ├── DEVELOPER_NOTES.md
│   ├── DOCUMENTACAO_INDEX.md
│   ├── FUNCIONALIDADES.md
│   ├── GUIA_RAPIDO.md
│   ├── PROJETO_COMPLETO.txt
│   ├── README.md
│   ├── RESUMO_EXECUTIVO.md
│   └── WIREFRAMES.md
│
├── public/                 # Arquivos estáticos
│   └── logo2.png
│
└── src/                    # Código fonte
    ├── main.jsx            # Aplicação principal
    ├── style.css           # Estilos globais
    └── components/         # Componentes React
        ├── ActivityTimeline.jsx
        ├── AdvancedFilters.jsx
        ├── Charts.jsx
        ├── DarkMode.jsx
        ├── ExportData.jsx
        ├── Notifications.jsx
        └── ShareCampaign.jsx
```

## 📦 Dependências

### Produção
- `react` - Biblioteca UI
- `react-dom` - Renderização React
- `lucide-react` - Ícones

### Desenvolvimento
- `vite` - Build tool e dev server
- `@vitejs/plugin-react` - Plugin React para Vite

## 🗂️ Organização

### Código Limpo
- ✅ Sem comentários desnecessários
- ✅ Código minimalista e funcional
- ✅ Apenas dependências essenciais

### Documentação Separada
- 📚 Toda documentação em `/docs`
- 📖 README principal conciso
- 🔍 Fácil navegação

### Estrutura Modular
- 🧩 Componentes separados
- 🎨 Estilos centralizados
- ⚡ Build otimizado

## 🚀 Comandos

```bash
npm install    # Instalar
npm run dev    # Desenvolvimento
npm run build  # Build produção
```

## 📊 Tamanho

- **Dependências**: ~65 pacotes
- **Código fonte**: ~1.5k linhas
- **Build final**: ~150KB (minificado)

---

**Grupo Bahamas** | Sistema Organizado e Otimizado
