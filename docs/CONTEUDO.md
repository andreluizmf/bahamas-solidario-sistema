# Conteúdo institucional

A ampliação mantém o visual aprovado e recupera as áreas informativas do [site de referência](https://bahamassolidario.netlify.app/), com textos próprios, fontes identificadas e navegação funcional.

## Áreas incluídas

- Início: histórico institucional, apresentação, ações e publicações, além das campanhas já existentes.
- Ações: Troco Solidário, Aniversário Solidário, apoio a instituições, Mesa Brasil, esporte, meio ambiente, formação e doação de sangue.
- Sobre: trajetória, quatro frentes de atuação e presença regional, com exemplos de cidades.
- Notícias: quatro publicações de 2025 e 2026, com data ou período, autoria institucional e ligação à fonte.
- Contato: e-mail, escritório central, redes sociais e dúvidas frequentes.
- Transparência: resultados históricos identificados separadamente dos indicadores calculados pelo sistema.
- Favicon: símbolo vetorial com a inicial B, azul institucional e detalhe vermelho; servido localmente.

## Fontes consultadas em 15/11/2026

| Informação                                                                                     | Fonte                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Troco Solidário desde 2016, instituições e arrecadação até dezembro de 2025; programas sociais | [Responsabilidade social — Grupo Bahamas](https://grupobahamas.com.br/esg-responsabilidade-social/)                                                                             |
| Resultado de 439,2 toneladas e 116 instituições na edição de 2026                              | [Publicação de 05/05/2026 — Grupo Bahamas](https://grupobahamas.com.br/2026/05/05/grupo-bahamas-supera-marca-historica-e-alcanca-4392-toneladas-no-aniversario-solidario-2026/) |
| Resultado de 345.762 kg em 2025 e parceria de distribuição com o Mesa Brasil                   | [Empório Bahamas](https://www.emporiobahamas.com.br/aniversario-solidario-do-grupo-bahamas-distribui-mais-de-345-toneladas-de-produtos/)                                        |
| Homenagem aos doadores em outubro de 2026                                                      | [Sesc em Minas — 28/10/2026](https://sescmg.com.br/noticias/programa-sesc-mesa-brasil-homenageia-maiores-doadores-do-setor-supermercadista/)                                    |
| Publicação sobre a primeira meia maratona                                                      | [Grupo Bahamas — 09/04/2026](https://grupobahamas.com.br/2026/04/09/circuito-bahamas-de-esportes-promove-a-1-meia-maratona-de-juiz-de-fora/)                                    |
| Regiões, exemplos de cidades e escritório central                                              | [Quem somos — Grupo Bahamas](https://grupobahamas.com.br/quem-somos/)                                                                                                           |
| Sustentabilidade                                                                               | [Grupo Bahamas](https://grupobahamas.com.br/esg-sustentabilidade/)                                                                                                              |
| E-mail do projeto e redes sociais                                                              | [Site de referência fornecido pelo responsável](https://bahamassolidario.netlify.app/)                                                                                          |

## Critérios editoriais

Os números institucionais não alimentam o banco de campanhas nem são somados às métricas do portal. A data da notícia de 2025 é identificada como o mês da edição, pois a página de origem não informa a data de publicação. O evento esportivo de maio de 2026 não é apresentado como inscrição aberta.

A referência menciona 87 lojas; a página institucional de cidades informa outra quantidade. Por isso, não foi incluída uma contagem atual de lojas. Foram usados exemplos de cidades confirmados na página do Grupo, sem apresentar uma lista exaustiva de pontos de coleta.

O e-mail configurado pelo administrador tem prioridade sobre o endereço institucional padrão. O escritório central é identificado separadamente de pontos de arrecadação. O contato abre o aplicativo de e-mail do visitante: não foi criado um formulário que simule envio, uma lista de newsletter sem serviço de envio ou um prazo de resposta não confirmado.

Os conteúdos informativos ficam em `src/lib/institutional.js`, e a apresentação compartilhada em `src/pages/Institutional.jsx`. As informações já editáveis no painel continuam em `site_settings`. Nenhuma migração de banco ou alteração em campanhas, doações ou permissões foi necessária.

## Verificação

Build de produção e formatação verificados; 19 testes de regras, cálculos, autenticação e UX passaram. Navegação, perguntas expansíveis, ligações de contato, datas e apresentação foram conferidas no navegador, incluindo telas de 390 px e 980 px.
