# Bahamas Solidário — documentação técnica

## Problema e objetivo

O projeto acadêmico propõe apoiar a organização de campanhas, doações e necessidades do Bahamas Solidário, além de comunicar iniciativas à comunidade. Esta implementação é uma demonstração local e não uma operação institucional.

## Escopo nesta versão

Implementado: interface administrativa responsiva, painel com contagens derivadas, lista/pesquisa de campanhas, alteração de situação, formulário de registro de doação, visão de necessidades e exportação CSV.

Planejado para evolução: edição e validação avançada de campanhas, associação estruturada de itens, edição/cancelamento de doações, filtros por período, área pública completa, autenticação segura e banco compartilhado.

## Requisitos

Funcionais: consultar campanhas, registrar doações, distinguir recebidas de pendentes, acompanhar necessidades e exportar registros.

Não funcionais: interface adaptável a telas menores, navegação por controles HTML, persistência local para demonstração e proteção contra uso de credenciais reais.

## Arquitetura e dados

A interface React está em src/main.jsx; estilos e responsividade em src/style.css. O estado é persistido em localStorage no navegador. As entidades de campanha, necessidades e doações são objetos JavaScript; o vínculo de campanha é feito pelo identificador local.

    erDiagram
      CAMPANHA ||--o{ NECESSIDADE : possui
      CAMPANHA ||--o{ DOACAO : recebe
      CAMPANHA { string id string nome string situacao }
      NECESSIDADE { string item number meta string unidade }
      DOACAO { string item number quantidade string unidade string situacao }

## Tecnologias

React e Vite para interface e execução; JavaScript; CSS; Lucide React para ícones. O armazenamento local é demonstrativo, não um banco de dados compartilhado ou seguro para produção.

## Identidade visual

A interface administrativa reaproveita a identidade visual do site anterior: roxo escuro (#271d67), vermelho (#e51a26), azul de apoio (#526db7) e o logotipo original. O projeto anterior é https://github.com/andreluizmf/bahamas-solidario.

## Testes e limitações

Não foi possível instalar, compilar ou executar testes neste ambiente: npm não está disponível no terminal. A interface não possui backend, autenticação nem sincronização. Os dados iniciais são exemplos e não devem ser apresentados como resultados reais. Revisar os fluxos e concluir funcionalidades planejadas antes de considerar critérios acadêmicos de aceite atendidos.

## Execução

Com Node.js/npm instalados: npm install, npm run dev; para compilar: npm run build.
