# 🌟 Bahamas Solidário v2.0

> Sistema completo de gestão de campanhas solidárias com funcionalidades avançadas

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)]()
[![React](https://img.shields.io/badge/react-18.3.1-61dafb.svg)]()
[![Vite](https://img.shields.io/badge/vite-5.4.21-646cff.svg)]()

## 📋 Índice

- [Sobre](#-sobre)
- [Novidades v2.0](#-novidades-v20)
- [Instalação](#-instalação)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Documentação](#-documentação)
- [Ambiente Demonstrativo](#-ambiente-demonstrativo)

## 🎯 Sobre

**Bahamas Solidário** é uma aplicação web moderna para gestão completa de campanhas solidárias. O sistema permite organizar campanhas, registrar doações, acompanhar necessidades, visualizar estatísticas e exportar relatórios em múltiplos formatos.

Desenvolvido com React e Vite, o projeto oferece uma interface intuitiva e responsiva, com recursos avançados como notificações inteligentes, gráficos interativos, modo escuro e compartilhamento social.

## ✨ Novidades v2.0

### 10 Novas Funcionalidades Principais

1. **🔔 Sistema de Notificações Inteligentes**
   - Alertas automáticos de metas alcançadas
   - Avisos de urgência
   - Centro de notificações com badge

2. **📊 Dashboard com Gráficos**
   - Distribuição de doações
   - Progresso das campanhas
   - Estatísticas avançadas

3. **🔍 Filtros Avançados**
   - Por status, categoria e data
   - Múltiplas opções de ordenação
   - Interface intuitiva

4. **⏰ Linha do Tempo**
   - Histórico de atividades
   - Timestamps relativos
   - Ícones visuais

5. **🚀 Compartilhamento Social**
   - Facebook, Twitter, E-mail
   - Links diretos copiáveis
   - Textos pré-formatados

6. **📤 Exportação Multi-formato**
   - CSV (Excel/Google Sheets)
   - HTML (Relatórios)
   - JSON (Backup)

7. **🌙 Modo Escuro**
   - Toggle no cabeçalho
   - Tema completo
   - Persistência automática

8. **📝 Sistema de Observações**
   - Comentários em doações
   - Rastreamento detalhado
   - Visualização na listagem

9. **⚠️ Alertas de Urgência**
   - Identificação visual
   - Cálculo automático
   - Priorização de ações

10. **📈 Estatísticas Avançadas**
    - Taxa de conclusão
    - Tendências
    - Métricas detalhadas

## 🚀 Instalação

### Pré-requisitos

- Node.js (versão LTS recomendada)
- npm ou yarn

### Passos

```bash
# Clone o repositório (se aplicável)
git clone <repository-url>

# Entre na pasta do projeto
cd Bahamas-Solidario-Atualizado

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev

# Acesse no navegador
http://localhost:5173
```

### Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🎨 Funcionalidades

### Gestão de Campanhas
- ✅ Criação de campanhas solidárias
- ✅ Definição de metas e necessidades
- ✅ Controle de status (Ativa/Concluída)
- ✅ Datas de encerramento
- ✅ Categorias personalizadas
- ✅ Compartilhamento social
- ✅ Filtros e busca avançada

### Controle de Doações
- ✅ Registro de doações recebidas
- ✅ Controle de status (Recebida/Pendente)
- ✅ Quantidades e unidades flexíveis
- ✅ Observações e comentários
- ✅ Vinculação com campanhas
- ✅ Histórico completo

### Visualização de Necessidades
- ✅ Lista de itens por campanha
- ✅ Barras de progresso visuais
- ✅ Cálculo de faltantes
- ✅ Indicadores de urgência
- ✅ Priorização automática

### Relatórios e Analytics
- ✅ Dashboard com métricas principais
- ✅ Gráficos de distribuição
- ✅ Gráficos de progresso
- ✅ Estatísticas avançadas
- ✅ Linha do tempo de atividades
- ✅ Exportação em 3 formatos

### Interface e UX
- ✅ Design moderno e limpo
- ✅ Responsivo (mobile, tablet, desktop)
- ✅ Modo claro e escuro
- ✅ Notificações inteligentes
- ✅ Animações suaves
- ✅ Feedback visual

## 🛠 Tecnologias

### Core
- **React 18.3.1** - Biblioteca UI
- **Vite 5.4.21** - Build tool e dev server
- **Lucide React** - Ícones modernos

### Styling
- **CSS3** - Estilização customizada
- **Google Fonts** - DM Sans e Manrope
- **Responsive Design** - Mobile-first

### Recursos
- **LocalStorage** - Persistência de dados
- **Clipboard API** - Cópia de links
- **File Download** - Exportação de arquivos
- **CSS Grid/Flexbox** - Layout moderno
- **CSS Transitions** - Animações

## 📚 Documentação

### Arquivos de Documentação

- **[FUNCIONALIDADES.md](./FUNCIONALIDADES.md)** - Lista completa de funcionalidades
- **[GUIA_RAPIDO.md](./GUIA_RAPIDO.md)** - Tutorial visual e guia de uso
- **[CHANGELOG.md](./CHANGELOG.md)** - Histórico de mudanças técnicas

### Estrutura do Projeto

```
bahamas-solidario/
├── src/
│   ├── components/           # Componentes React
│   │   ├── ActivityTimeline.jsx
│   │   ├── AdvancedFilters.jsx
│   │   ├── Charts.jsx
│   │   ├── DarkMode.jsx
│   │   ├── ExportData.jsx
│   │   ├── Notifications.jsx
│   │   └── ShareCampaign.jsx
│   ├── main.jsx             # Componente principal
│   └── style.css            # Estilos globais
├── public/
│   └── logo2.png            # Logo do Bahamas
├── index.html
├── package.json
└── vite.config.js
```

## 🎭 Ambiente Demonstrativo

### ⚠️ Importante

Este é um **ambiente demonstrativo** com as seguintes características:

- **Dados locais**: Armazenados apenas no navegador (localStorage)
- **Sem backend**: Não há servidor ou banco de dados central
- **Sem autenticação**: Sistema aberto, sem login
- **Dados de exemplo**: Campanhas e doações são ilustrativas
- **Não sincroniza**: Cada navegador tem seus próprios dados

### 🔒 Privacidade

- Não coleta dados pessoais
- Não envia informações para servidores externos
- Dados permanecem no dispositivo do usuário
- Limpar cache/dados do navegador remove todos os registros

### 💾 Backup e Migração

Para fazer backup ou migrar dados:

1. Acesse "Relatórios"
2. Clique em "Exportar dados"
3. Escolha formato JSON
4. Salve o arquivo

**Nota:** Atualmente não há importação automática. O JSON serve como backup manual.

## 🎨 Identidade Visual

O projeto utiliza a paleta institucional do Grupo Bahamas:

- **Roxo Escuro**: `#271d67` - Cor principal
- **Vermelho**: `#e51a26` - Ações e destaques
- **Azul**: `#526db7` - Elementos secundários
- **Cinzas**: `#68766e`, `#78847e` - Textos
- **Verdes**: `#46a47c`, `#2e7d32` - Sucessos

### Modo Escuro

- **Background**: `#1a1a2e`, `#16213e`
- **Textos**: `#e4e4e7`, `#a0a0a8`
- **Bordas**: `#2a3a5e`, `#3a4a6e`

## 🌐 Compatibilidade

### Navegadores Suportados

| Navegador | Versão Mínima |
|-----------|---------------|
| Chrome    | 90+          |
| Edge      | 90+          |
| Firefox   | 88+          |
| Safari    | 14+          |
| Opera     | 76+          |

### Dispositivos

- ✅ Desktop (1920x1080+)
- ✅ Laptop (1366x768+)
- ✅ Tablet (768x1024+)
- ✅ Mobile (375x667+)

## 📱 Responsividade

O sistema se adapta automaticamente:

- **Desktop (>900px)**: Layout completo com múltiplas colunas
- **Tablet (650-900px)**: Layout intermediário
- **Mobile (<650px)**: Layout empilhado, menu hamburguer

## 🚧 Limitações

### Versão Demonstrativa

- Sem backend ou API
- Sem sincronização entre dispositivos
- Sem autenticação de usuários
- Sem sistema de permissões
- Sem notificações push
- Sem integração real com redes sociais (apenas links)

### Para Uso em Produção

Para uso real em produção, seria necessário:

1. Backend com API REST
2. Banco de dados (PostgreSQL, MongoDB, etc.)
3. Sistema de autenticação
4. Upload de imagens
5. Integração com APIs de pagamento
6. Sistema de e-mails
7. Hospedagem e domínio
8. Certificado SSL
9. Backups automatizados
10. Monitoramento e logs

## 🔮 Roadmap Futuro

### Curto Prazo
- [ ] Testes automatizados
- [ ] Validação de formulários
- [ ] Internacionalização (i18n)
- [ ] Acessibilidade (ARIA)

### Médio Prazo
- [ ] Backend Node.js
- [ ] Autenticação JWT
- [ ] Upload de imagens
- [ ] Sistema de permissões
- [ ] API REST completa

### Longo Prazo
- [ ] PWA (instalável)
- [ ] Push notifications
- [ ] Dashboard real-time
- [ ] Mobile App
- [ ] Integrações externas

## 👨‍💻 Desenvolvimento

### Estrutura de Componentes

Todos os componentes seguem o padrão funcional do React:

```jsx
// Exemplo básico
export function ComponentName({ props }) {
  const [state, setState] = useState(initial);
  
  // Lógica
  
  return (
    <div className="component-class">
      {/* JSX */}
    </div>
  );
}
```

### Convenções de Código

- Componentes em PascalCase
- Funções e variáveis em camelCase
- Classes CSS em kebab-case
- Indentação de 2 espaços
- Single quotes para strings
- Comentários descritivos

## 🤝 Contribuições

Este é um projeto demonstrativo. Para contribuições:

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este é um projeto demonstrativo desenvolvido para o Grupo Bahamas.

## 📞 Suporte

Para questões sobre o sistema:

1. Consulte o [GUIA_RAPIDO.md](./GUIA_RAPIDO.md)
2. Revise o [FUNCIONALIDADES.md](./FUNCIONALIDADES.md)
3. Verifique o [CHANGELOG.md](./CHANGELOG.md)

## 🙏 Agradecimentos

- Grupo Bahamas pela oportunidade
- Comunidade React
- Lucide Icons
- Google Fonts

---

**Desenvolvido para Grupo Bahamas** | v2.0.0 | 2024

**🎉 Aproveite o Bahamas Solidário!**
