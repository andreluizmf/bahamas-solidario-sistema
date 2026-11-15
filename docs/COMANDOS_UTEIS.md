# 🔧 Comandos Úteis - Bahamas Solidário v2.0

## 🚀 Comandos Principais

### Instalação e Execução

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview
```

### Status do Servidor

```bash
# Verificar se o servidor está rodando
# Acesse: http://localhost:5173

# Parar servidor (no terminal)
Ctrl + C
```

---

## 📦 Gerenciamento de Dependências

### Ver Dependências

```bash
# Listar todas as dependências
npm list

# Listar dependências de produção
npm list --prod

# Ver dependências desatualizadas
npm outdated

# Ver informações de um pacote
npm info <package-name>
```

### Atualizar Dependências

```bash
# Atualizar todas (respeitando semver)
npm update

# Atualizar pacote específico
npm update <package-name>

# Instalar versão específica
npm install <package-name>@<version>

# Exemplo
npm install react@18.3.1
```

### Limpar e Reinstalar

```bash
# Remover node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install

# Windows PowerShell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

---

## 🔍 Análise e Debug

### Analisar Projeto

```bash
# Analisar bundle size
npm run build
# Verifique dist/ para arquivos gerados

# Audit de segurança
npm audit

# Corrigir vulnerabilidades
npm audit fix

# Forçar correções (pode quebrar)
npm audit fix --force
```

### Verificar Configuração

```bash
# Ver variáveis de ambiente Vite
npm run dev -- --debug

# Verificar versão do Node
node -v

# Verificar versão do npm
npm -v

# Ver configuração do npm
npm config list
```

---

## 📂 Gerenciamento de Arquivos

### Listar Estrutura

```bash
# Windows PowerShell
tree /F

# Ou
Get-ChildItem -Recurse | Select-Object FullName

# Listar apenas arquivos .jsx
Get-ChildItem -Recurse -Filter "*.jsx"

# Listar por tamanho
Get-ChildItem | Sort-Object Length -Descending
```

### Buscar no Código

```bash
# PowerShell - Buscar texto em arquivos
Get-ChildItem -Recurse | Select-String -Pattern "useState"

# Buscar em arquivos específicos
Get-ChildItem -Recurse -Filter "*.jsx" | Select-String "NotificationCenter"

# Contar linhas de código
(Get-Content .\src\main.jsx).Count
```

---

## 🧹 Limpeza

### Limpar Build

```bash
# Remover pasta dist
Remove-Item -Recurse -Force dist

# Ou
rm -rf dist
```

### Limpar Cache

```bash
# Limpar cache do npm
npm cache clean --force

# Limpar cache do Vite
Remove-Item -Recurse -Force node_modules\.vite
```

---

## 🔄 Git (Controle de Versão)

### Comandos Básicos

```bash
# Inicializar repositório (se ainda não foi feito)
git init

# Ver status
git status

# Adicionar arquivos
git add .
git add src/components/Notifications.jsx

# Commit
git commit -m "feat: adiciona sistema de notificações"

# Ver histórico
git log
git log --oneline

# Ver diferenças
git diff
git diff src/main.jsx
```

### Branches

```bash
# Listar branches
git branch

# Criar nova branch
git checkout -b feature/new-feature

# Mudar de branch
git checkout main

# Deletar branch
git branch -d feature/old-feature
```

### Remote

```bash
# Adicionar remote
git remote add origin <url>

# Ver remotes
git remote -v

# Push
git push origin main
git push -u origin feature/new-feature

# Pull
git pull origin main
```

---

## 📊 Estatísticas do Projeto

### Contar Arquivos e Linhas

```bash
# PowerShell

# Contar arquivos .jsx
(Get-ChildItem -Recurse -Filter "*.jsx").Count

# Contar linhas em todos os .jsx
$total = 0
Get-ChildItem -Recurse -Filter "*.jsx" | ForEach-Object {
    $total += (Get-Content $_.FullName).Count
}
Write-Host "Total de linhas .jsx: $total"

# Contar linhas em todos os .css
(Get-Content .\src\style.css).Count

# Tamanho total da pasta src
(Get-ChildItem -Recurse .\src | Measure-Object -Property Length -Sum).Sum / 1KB
```

### Ver Tamanho do Build

```bash
# Após npm run build
Get-ChildItem -Recurse .\dist | Measure-Object -Property Length -Sum

# Tamanho dos principais arquivos
Get-ChildItem .\dist\assets | Sort-Object Length -Descending | Format-Table Name, @{L="Size(KB)";E={$_.Length/1KB}}
```

---

## 🧪 Testes (Futuro)

### Configurar Vitest

```bash
# Instalar Vitest
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Adicionar ao package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}

# Executar testes
npm test

# Com UI
npm run test:ui

# Com coverage
npm run test:coverage
```

---

## 📦 Build e Deploy

### Build Local

```bash
# Build completo
npm run build

# Build com análise
npm run build -- --mode production

# Verificar build
npm run preview
```

### Deploy Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### Deploy Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy para produção
netlify deploy --prod
```

### Deploy GitHub Pages

```bash
# Instalar gh-pages
npm install -D gh-pages

# Adicionar ao package.json
{
  "homepage": "https://<username>.github.io/<repo>",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}

# Deploy
npm run deploy
```

---

## 🔧 Configuração

### Criar .env (variáveis de ambiente)

```bash
# Criar arquivo .env na raiz
# Windows
New-Item .env

# Adicionar variáveis
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Bahamas Solidário
```

### Vite Config

```bash
# vite.config.js já existe
# Para modificar, edite diretamente
```

---

## 🚨 Resolução de Problemas

### Erro de Porta em Uso

```bash
# Verificar processos na porta 5173
netstat -ano | findstr :5173

# Matar processo (Windows)
taskkill /PID <PID> /F
```

### Erro de Cache

```bash
# Limpar tudo e reinstalar
Remove-Item -Recurse -Force node_modules, package-lock.json, dist, .vite
npm install
npm run dev
```

### Erro de Permissões

```bash
# Executar PowerShell como Administrador
# Ou verificar permissões da pasta
```

---

## 📊 Performance

### Analisar Performance

```bash
# Build com relatório
npm run build

# Vite automaticamente mostra:
# - Tamanho dos chunks
# - Tamanho gzip
# - Tempo de build
```

### Bundle Analyzer (Futuro)

```bash
# Instalar
npm i -D rollup-plugin-visualizer

# Adicionar ao vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({ open: true })
  ]
}

# Build
npm run build
# Abre stats.html automaticamente
```

---

## 📱 Teste em Dispositivos

### Expor na Rede Local

```bash
# Iniciar com --host
npm run dev -- --host

# Ou adicionar ao package.json
{
  "scripts": {
    "dev:host": "vite --host"
  }
}

# Acessar de outro dispositivo
# Use o IP mostrado no terminal
# Ex: http://192.168.1.100:5173
```

### Ver IP Local

```bash
# Windows PowerShell
ipconfig | findstr IPv4

# Ou
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Wi-Fi*"}).IPAddress
```

---

## 🔐 Segurança

### Verificar Vulnerabilidades

```bash
# Audit completo
npm audit

# Ver apenas high/critical
npm audit --audit-level=high

# Gerar relatório JSON
npm audit --json > audit-report.json
```

---

## 📝 Logs e Debug

### Ver Logs Detalhados

```bash
# Vite com logs detalhados
npm run dev -- --debug

# npm com logs detalhados
npm install --loglevel verbose
```

---

## 🎨 Formatação de Código (Futuro)

### Prettier

```bash
# Instalar
npm i -D prettier

# Criar .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2
}

# Formatar todos os arquivos
npx prettier --write .

# Verificar sem modificar
npx prettier --check .
```

### ESLint

```bash
# Instalar
npm i -D eslint

# Inicializar
npx eslint --init

# Lint
npx eslint src/

# Fix automático
npx eslint src/ --fix
```

---

## 📦 Scripts Customizados

### Adicionar ao package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "clean": "rm -rf dist node_modules",
    "reinstall": "npm run clean && npm install",
    "analyze": "npm run build && open dist/stats.html",
    "type-check": "tsc --noEmit",
    "lint": "eslint src/",
    "format": "prettier --write src/"
  }
}
```

---

## 🔄 Backup e Restauração

### Backup Manual

```bash
# Exportar dados do localStorage
# (Usar a funcionalidade de exportação do sistema)
# Salvar arquivo JSON

# Backup do código
git push origin main

# Ou criar zip
Compress-Archive -Path .\* -DestinationPath ..\bahamas-backup.zip
```

### Restauração

```bash
# Restaurar código
git clone <repo-url>
cd bahamas-solidario
npm install

# Restaurar dados
# Usar funcionalidade de importação (futura)
# Ou copiar JSON para localStorage manualmente
```

---

## 🎯 Comandos Por Cenário

### Começar a Trabalhar

```bash
git pull origin main
npm install  # se houve mudanças no package.json
npm run dev
```

### Adicionar Nova Funcionalidade

```bash
git checkout -b feature/nome-da-feature
# Desenvolver...
npm run build  # testar build
git add .
git commit -m "feat: descrição"
git push origin feature/nome-da-feature
```

### Corrigir Bug

```bash
git checkout -b fix/nome-do-bug
# Corrigir...
npm run build
git add .
git commit -m "fix: descrição"
git push origin fix/nome-do-bug
```

### Preparar Release

```bash
npm run build
npm run preview  # testar
git tag v2.0.0
git push origin v2.0.0
# Deploy
```

---

## 🆘 Comandos de Emergência

### Sistema Não Inicia

```bash
# 1. Limpar tudo
Remove-Item -Recurse -Force node_modules, package-lock.json, dist

# 2. Reinstalar
npm install

# 3. Tentar novamente
npm run dev
```

### Build Falha

```bash
# Verificar espaço em disco
Get-PSDrive

# Limpar cache
npm cache clean --force

# Build com debug
npm run build -- --debug
```

### Git com Problemas

```bash
# Reset suave (manter mudanças)
git reset --soft HEAD~1

# Reset completo (CUIDADO: perde mudanças)
git reset --hard HEAD

# Limpar arquivos não rastreados
git clean -fd
```

---

## 📚 Recursos Adicionais

### Documentação

```bash
# Abrir documentação no navegador (se houver)
# Windows
start README.md

# Ou usar editor Markdown
code GUIA_RAPIDO.md
```

### Atalhos

```bash
# Criar aliases no PowerShell Profile
# $PROFILE = caminho do perfil

# Adicionar ao perfil:
function dev { npm run dev }
function build { npm run build }
function clean { Remove-Item -Recurse -Force node_modules, dist }

# Usar:
dev
build
clean
```

---

**💡 Dica:** Adicione os comandos mais usados como aliases ou scripts no package.json para agilizar o desenvolvimento!

---

**Bahamas Solidário v2.0** | Comandos Úteis | 2024
