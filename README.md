# Bahamas Solidário

Portal público e plataforma administrativa de campanhas solidárias, com a identidade
visual do Grupo Bahamas. React, Vite, Supabase Auth e PostgreSQL. Publicação na Vercel.

## Começar

Requer Node.js 24 e pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Preencha `.env.local` com a URL e a chave publicável do Supabase. Sem configuração,
o site mostra uma prévia identificada, com dados de exemplo e sem gravação.
Abra `/admin/previa` para conhecer o painel somente leitura.

## O que o sistema oferece

- Portal público: início, campanhas, detalhes e metas, transparência, sobre,
  orientações para doação e privacidade.
- Administração: login, recuperação de senha, painel, campanhas com rascunho e
  publicação, necessidades, doações, filtros, relatórios CSV, conteúdo, equipe e auditoria.
- Banco com regras RLS: informações de doadores não ficam disponíveis ao público;
  contas sem autorização não administram o sistema.
- Gravação atômica de campanhas e itens; controle de versão para evitar sobrescritas;
  arquivamento e cancelamento preservando histórico.
- Importação confirmada e transacional dos registros da versão anterior.
- Layout responsivo, navegação por teclado, foco em janelas e redução de movimentos.

## Arquivos

```text
src/
  App.jsx               Navegação, sessão e acesso
  pages/Public.jsx      Portal da comunidade
  pages/Admin.jsx       Gestão, relatórios e formulários
  components/ui.jsx     Componentes compartilhados
  lib/data.js           Integração oficial com Supabase
  lib/domain.js         Cálculos, datas e exportação
  main.jsx              Entrada e tratamento de erros
  styles.css            Identidade visual e responsividade
supabase/
  migrations/           Banco, políticas e operações
  functions/manage-team Convites administrativos
  config.toml           Configuração da função
public/logo2.png         Logo institucional
vercel.json              Build, rotas e cabeçalhos
.env.example             Variáveis públicas necessárias
```

## Verificar

```sh
pnpm test
pnpm build
pnpm preview
```

Os testes executam as regras e operações em um PostgreSQL isolado; nenhum banco
remoto é alterado. O portal não processa pagamentos e não possui cadastro de clientes:
as informações públicas são consultadas sem login.

## Publicação

Siga [o guia de Vercel e Supabase](docs/DEPLOYMENT.md) para aplicar a migração, criar
o primeiro administrador, configurar e-mail e publicar a função de convites.
Não existe senha padrão. Nunca use uma chave secreta em variável com prefixo `VITE_`.
O build de produção da Vercel exige a configuração do Supabase.
