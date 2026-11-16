# Administração e Marketing no Bahamas Solidário

## Objetivo da ampliação

O sistema passa a apoiar tanto a execução das campanhas quanto as decisões sobre equipe, recursos e comunicação. As novas áreas ficam em **Administração → Administração** e **Administração → Marketing**, sempre vinculadas a uma campanha existente e acessíveis somente à equipe autorizada.

O problema tratado é concreto: sem planejamento integrado, uma campanha pode ter metas públicas, mas não ter responsáveis pelas tarefas, orçamento acompanhado ou uma estratégia de divulgação organizada. Os novos módulos conectam essas informações e permitem avaliar o que foi realizado.

## Relação entre as disciplinas e as entregas

| Disciplina              | Aplicação no projeto                                                                            | Evidência para apresentar                                                                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Administração           | Planejamento, organização de responsabilidades, coordenação da execução e controle de recursos  | Objetivo SMART, 5W2H, SWOT, quadro de tarefas, orçamento previsto versus realizado e alerta de desvio                                                       |
| Marketing               | Público-alvo, proposta de valor, adaptação dos 4 Ps ao contexto social, comunicação e avaliação | Estratégia da campanha, calendário por canal, mensagens revisáveis, links com UTM e indicadores manuais de divulgação                                       |
| Sistemas de Informação  | Integração entre dados operacionais e informações para decisão                                  | Campanha, necessidades, plano, tarefas, gastos e divulgação relacionados no Supabase; consultas e exportações por campanha                                  |
| Engenharia de Software  | Modelagem, componentes reutilizáveis, validações, controle de acesso e testes                   | Migração versionada, regras no banco, tratamento de concorrência, testes de cálculos e segurança, publicação controlada                                     |
| Inteligência Artificial | Uso de IA como apoio ao desenvolvimento do projeto                                              | Registro do processo de criação, revisão e teste do código, distinguindo assistência de IA de decisões humanas e de funcionalidades executadas pelo sistema |

**Precisão sobre IA:** a produção de código com auxílio de IA não equivale a um modelo de IA operando na aplicação. O modelo de mensagem incluído nesta entrega é uma composição determinística de campos da campanha. Não há classificação automática de doadores, previsão de arrecadação ou recomendação por aprendizado de máquina. A equipe deve descrever somente o uso de IA que efetivamente ocorreu e apresentar evidências do processo.

## Administração: conceitos aplicados

### Planejar, organizar, dirigir e controlar

- **Planejar:** definir objetivo, prazos, justificativa, cenário e orçamento.
- **Organizar:** decompor o trabalho em tarefas e atribuir responsáveis.
- **Dirigir/coordenar:** consultar o quadro, orientar a execução e atualizar observações. A ferramenta apoia a coordenação; não substitui a liderança da equipe.
- **Controlar:** comparar metas, conclusão de tarefas, atrasos e gastos; revisar o plano quando houver desvio.

Essa relação entre funções gerenciais é discutida no [resumo de Administração da OpenStax](https://openstax.org/books/introduction-business-2e/pages/6-summary-of-learning-outcomes).

### Objetivo SMART e 5W2H

O campo de objetivo incentiva uma redação específica e verificável. As metas por item e as datas vêm da própria campanha. O sistema não certifica automaticamente se um objetivo é viável ou relevante: essa avaliação cabe à equipe.

| Pergunta           | Onde aparece                              |
| ------------------ | ----------------------------------------- |
| What — o quê?      | Objetivo da campanha                      |
| Why — por quê?     | Justificativa                             |
| Where — onde?      | Locais e recursos necessários             |
| When — quando?     | Início, encerramento e prazos das tarefas |
| Who — quem?        | Coordenação e responsáveis pelas tarefas  |
| How — como?        | Etapas, parcerias e forma de execução     |
| How much — quanto? | Orçamento previsto e gastos realizados    |

### SWOT

O plano distingue **forças e fraquezas internas** de **oportunidades e ameaças externas**. A equipe pode usar o diagnóstico para escolher ações: uma equipe pequena para triagem, por exemplo, pode exigir uma tarefa de organização de voluntários antes da divulgação.

### Controle de recursos

O orçamento é o limite planejado de gastos, não uma meta de doação em dinheiro. O realizado soma gastos operacionais válidos e custos efetivamente informados nas ações de marketing. Custos de divulgação não devem ser lançados novamente como gasto operacional.

- Saldo previsto = orçamento − gasto realizado.
- Tarefas concluídas = concluídas ÷ tarefas não canceladas.
- Atraso = tarefa não concluída e não cancelada com prazo anterior ao dia atual.

Desconsiderar um gasto corrige seu efeito nos totais, preservando o registro. Cancelar uma divulgação não elimina automaticamente um custo que já ocorreu. Produtos recebidos não são convertidos em receita monetária.

### PDCA

O fluxo permite **planejar** objetivo e recursos, **executar** tarefas, **verificar** metas e desvios e **agir** revisando o plano e as orientações. É um apoio ao ciclo de melhoria; não há aprovação automática ou garantia de impacto social. Referência: [ciclo PDCA — ASQ](https://asq.org/quality-resources/pdca-cycle).

## Marketing: conceitos aplicados

### Público-alvo e posicionamento

O plano permite descrever segmentos da comunidade e a proposta de valor da campanha. Não é necessário armazenar nomes de doadores para definir um público. Exemplo de proposta: facilitar a doação perto de casa e permitir o acompanhamento público das metas. A relação entre segmentação, escolha de público e posicionamento é apresentada pela [OpenStax](https://openstax.org/books/principles-marketing/pages/5-6-product-positioning).

### Adaptação dos 4 Ps ao marketing social

O sistema usa o composto de marketing como referência de organização, adaptado ao contexto de mobilização social:

| Referência | Adaptação no sistema                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| Produto    | Causa, benefício coletivo e necessidade atendida                                                      |
| Preço      | Esforço de participação, deslocamento, tempo e outras barreiras; não cobrança de um preço pelo portal |
| Praça      | Acesso à campanha, canais de participação e entrega                                                   |
| Promoção   | Mensagens, linguagem, canais e chamadas para ação                                                     |

A adaptação é uma escolha de projeto; não se pretende substituir modelos completos de marketing social. Base conceitual: [composto de marketing e 4 Ps — OpenStax](https://openstax.org/books/principles-marketing/pages/1-2-the-marketing-mix-and-the-4ps-of-marketing).

### Calendário e comunicação

Cada ação tem data, canal, responsável, mensagem, situação e custo realizado. O status **Agendada** organiza o trabalho humano e não publica automaticamente. O modelo de mensagem aproveita a proposta de valor e os itens ativos que ainda precisam de doação. A equipe deve conferir prazo, local, clareza e adequação antes de divulgar.

Os links de campanha publicada podem incluir UTM por canal. O portal não rastreia visitas nem coleta métricas externas automaticamente; os parâmetros apenas permitem identificar a origem em ferramentas compatíveis.

### Indicadores e limites de interpretação

Somente ações com status **Publicada** entram nos indicadores de divulgação. Os dados são preenchidos manualmente, a partir das evidências disponíveis para a equipe.

| Indicador                        | Cálculo                                                           |
| -------------------------------- | ----------------------------------------------------------------- |
| Interações por alcance           | interações ÷ alcance × 100                                        |
| Cliques por alcance              | cliques ÷ alcance × 100                                           |
| Custo por participação informada | custo das ações publicadas ÷ participações atribuídas pela equipe |

Quando não existe denominador, aparece **Sem base**. A soma do alcance de diferentes ações pode repetir pessoas. Participações atribuídas não equivalem às doações confirmadas no sistema e não demonstram causalidade. Não é possível afirmar retorno financeiro, aumento de arrecadação ou sucesso de uma ação sem dados reais e avaliação adequada.

## Roteiro de demonstração em sala

Use uma campanha de demonstração identificada como fictícia, em ambiente de teste ou com autorização para esse cadastro. Não misture os valores abaixo com os resultados reais do Bahamas.

1. Defina uma campanha de 100 kg de arroz com prazo determinado e explique como a meta e o prazo tornam o objetivo verificável.
2. Preencha o 5W2H: justificativa, locais, método, responsável e orçamento.
3. Registre uma força, uma fraqueza, uma oportunidade e uma ameaça; mostre uma tarefa criada em resposta ao diagnóstico.
4. Atribua um responsável, altere a tarefa de A fazer para Em andamento e depois Concluída.
5. Defina orçamento fictício de R$ 100, registre gasto operacional de R$ 80 e custo de divulgação de R$ 40. O realizado será R$ 120 e o alerta mostrará excesso de R$ 20.
6. No marketing, explique o público, a proposta de valor e os 4 Ps adaptados. Crie um rascunho a partir do modelo e selecione o canal.
7. Após uma divulgação fictícia, informe alcance 100, interações 10, cliques 20 e participações atribuídas 2. Os cálculos serão 10%, 20% e R$ 20 por participação informada, considerando custo de R$ 40.
8. Exporte o plano em TXT e o calendário em CSV. Explique como relatórios apoiam decisões e como as informações internas ficam separadas do portal público.
9. Mostre uma revisão do plano após o desvio para ilustrar o fechamento do PDCA.

Esses valores são exemplos de demonstração, não resultados obtidos em operação.

## Texto-base para explicar a integração

> O Bahamas Solidário integra a operação das campanhas ao planejamento administrativo e à comunicação. A administração aparece na definição de objetivos, responsabilidades, prazos e recursos e no acompanhamento de desvios. O marketing aparece no público-alvo, na proposta de valor, na organização dos canais e na avaliação da divulgação. Sistemas de Informação conecta esses dados e os transforma em relatórios; Engenharia de Software sustenta a organização, a segurança e a verificação da solução. A inteligência artificial foi utilizada como apoio ao desenvolvimento, com revisão e testes, sem atribuir à aplicação capacidades de IA que ela não executa.

Adapte esse texto ao que o grupo efetivamente realizou e às orientações da instituição.

## Segurança e validação técnica

Quatro tabelas privadas armazenam planos, tarefas, gastos e divulgação. O público não tem leitura, e contas autenticadas dependem de autorização administrativa. Há validações de valores, datas e situações no banco, histórico das operações e verificação de versão para evitar sobrescrever uma edição mais recente.

A migração é `20261116004916_administration_marketing.sql`, criada pela CLI oficial e aplicada no editor SQL do projeto. As gravações autorizadas e a auditoria foram verificadas no banco real dentro de uma transação revertida. Os testes locais cobrem isolamento de acesso, valores inválidos, conclusão de tarefas, concorrência e cálculos. Os cenários de interface usam dados fictícios locais; o build não publica as páginas de teste.
