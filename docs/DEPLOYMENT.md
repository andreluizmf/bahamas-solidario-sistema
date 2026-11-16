# Publicação na Vercel e no Supabase

## 1. Banco e autenticação

Use um projeto Supabase dedicado ao sistema. Em um projeto novo, execute no SQL Editor os arquivos de `supabase/migrations` em ordem de nome, uma única vez:

1. `202611150001_platform.sql`: campanhas, doações, acesso, conteúdo e auditoria.
2. `20261116004916_administration_marketing.sql`: planos, tarefas, gastos e divulgação privados.

Se a plataforma anterior já existe no banco, aplique somente a segunda migração. Ambas são transacionais e não cadastram campanhas ou doadores fictícios. Na produção atual, os arquivos foram aplicados pelo SQL Editor. Antes de adotar aplicação automática por CLI, concilie o histórico de migrações para não reaplicar a estrutura existente.

Em Authentication:

- Configure **Site URL** com a URL definitiva do portal.
- Autorize o redirect `https://SEU-DOMINIO/admin/nova-senha` e o equivalente local
  durante o desenvolvimento. Evite curingas em domínios de produção.
- Desative o cadastro público de usuários. Visitantes não precisam de conta.
- Configure SMTP próprio, remetente institucional e os templates de convite e
  recuperação. O serviço padrão de e-mail do Supabase possui restrições.
- Configure senha mínima de 12 caracteres e a proteção contra senhas vazadas,
  quando disponível no plano escolhido.

Crie ou convide a primeira conta no painel Authentication, copiando seu UUID.
Defina o acesso administrativo no SQL Editor:

```sql
insert into public.administrators(user_id, name, email)
values ('UUID-DA-CONTA', 'Nome do administrador', 'email@empresa.com.br');
```

A conta deve confirmar o e-mail e definir a própria senha. Não existe senha
padrão, acesso por e-mail apenas ou promoção por metadados editáveis.

## 2. Convites pela área administrativa

Publique a função de equipe:

```sh
supabase link --project-ref SEU-PROJETO
supabase secrets set SITE_URL=https://SEU-DOMINIO
supabase functions deploy manage-team
```

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são fornecidas pelo ambiente da Edge
Function. Nunca coloque a chave de serviço na Vercel, no frontend ou no Git.
A configuração `verify_jwt = false` é intencional: a função valida o token com
`auth.getUser` e consulta a lista de administradores antes de usar privilégios.
O CORS permite somente `SITE_URL`. Não use barra no final dessa URL.

A tela Equipe permite convidar administradores e revogar acessos. Para uma conta
que já existe no Supabase Auth, autorize pelo mesmo SQL do primeiro acesso.
A aplicação impede a remoção do próprio acesso. Não exclui o usuário do Auth
nem apaga seus registros ao revogar a autorização.

## 3. Vercel

Importe `andreluizmf/bahamas-solidario-sistema` na Vercel. Selecione Node.js 24 e
a branch que contém esta versão. A configuração de instalação, build, cabeçalhos
e rotas está em `vercel.json`.

Adicione as variáveis abaixo em Production e nos Previews que utilizarão um banco:

```text
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=CHAVE_PUBLICAVEL
```

Use a chave **publishable** ou a antiga **anon**, nunca a **secret/service_role**.
São variáveis públicas de build: a segurança dos dados depende das políticas RLS,
que estão incluídas e são verificadas nos testes. Refaça o deploy ao alterá-las.

O build de produção da Vercel falha se as variáveis estiverem ausentes. Sem elas,
o desenvolvimento local e os Previews exibem somente uma prévia identificada,
sem gravação e sem credenciais administrativas fictícias.

## 4. Antes de divulgar

1. Entre em `/admin` com a conta autorizada.
2. Preencha contato, horários, endereço, orientações e aviso de privacidade em Conteúdo.
3. Cadastre uma campanha como rascunho e revise suas metas.
4. Marque “Publicar no portal público” para disponibilizá-la.
5. Confira `/campanhas`, `/transparencia` e o endereço direto da campanha sem login.
6. Teste um recebimento, sua edição, um cancelamento e o histórico.
7. Teste convite, recuperação de senha e revogação de acesso de outra conta.
8. Configure a política de backup e retenção adequada ao plano e à operação.

Campanhas arquivadas desaparecem do portal e mantêm as doações. Um item que já
recebeu doações não pode mudar de nome ou unidade. Retire-o e cadastre outro se
necessário; o histórico permanece consultável nos relatórios.

## 5. Dados da versão anterior

Em Conteúdo, escolha “Importar registros”. A importação lê um JSON com `campaigns`
e `donations`, ou os registros `bs-demo` do mesmo endereço do navegador. Revise o
resumo antes de confirmar. Limites: 2 MB, 200 campanhas e 5 mil doações por arquivo.
A operação é atômica e impede a repetição do mesmo arquivo. As campanhas entram
como rascunho e devem ser revisadas antes da publicação. A versão antiga não
guardava datas individuais de doação; esses registros recebem a data da importação.
O dado original do navegador não é apagado.

## Verificação e manutenção

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
```

Os testes executam a migração em PostgreSQL via PGlite, verificando RLS, ausência
de informações de doadores nas consultas públicas, transações, concorrência,
arquivamento, importação e revogação. Não substituem o teste final com Supabase
Auth, SMTP e a Edge Function no projeto real.

Fontes oficiais: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security),
[funções seguras](https://supabase.com/docs/guides/database/functions),
[Edge Functions](https://supabase.com/docs/guides/functions/auth),
[configuração da Vercel](https://vercel.com/docs/project-configuration/vercel-json).
