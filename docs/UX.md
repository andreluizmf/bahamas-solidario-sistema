# Revisão de UX e identidade visual

Esta revisão aplica as 18 referências indicadas pelo responsável pelo Bahamas Solidário. São critérios de projeto, não uma certificação de usabilidade nem garantia de desempenho ou resultado. A validação com pessoas da comunidade e administradores continua sendo a forma de avaliar a experiência em uso real.

## Aplicações no sistema

| Referência             | Aplicação concreta                                                                                                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proximidade            | Formulários agrupados por assunto; instruções e erros junto ao campo correspondente; metas junto dos respectivos itens.                                                                                     |
| Hick                   | Dados opcionais ficam em seções expansíveis; registrar uma doação começa pela campanha e depois apresenta apenas seus itens.                                                                                |
| Fitts                  | Botões principais e botões de ícone têm área mínima de 44 × 44 px; ações de salvar e cancelar ficam acessíveis no rodapé do formulário. Links no texto mantêm seu formato natural.                          |
| Jakob                  | Navegação pública convencional, administração em menu lateral, busca e filtros identificados, ícones Lucide acompanhados de texto ou nome acessível.                                                        |
| Miller                 | Cadastro de campanha dividido em três grupos; menu administrativo separado entre operação e configuração; listas extensas paginadas. Não se assume um limite universal de sete itens.                       |
| Doherty                | Estado de carregamento visível, botão ocupado desabilitado, atualização sinalizada e filtros locais com resposta direta. Não há promessa de resposta de rede em 400 ms.                                     |
| Von Restorff           | Vermelho da marca destaca a ação principal; ações secundárias têm menor peso visual; erros também têm texto explicativo.                                                                                    |
| Posição serial         | Ação principal aparece no início do percurso público e orientação para doar ao final; salvar e cancelar encerram os formulários.                                                                            |
| Pico e fim             | Confirmação após operação bem-sucedida, próximo passo explícito e restauração do foco ao fechar diálogos. Falhas permanecem visíveis até serem dispensadas.                                                 |
| Zeigarnik              | Indicador de grupos preenchidos e de alterações não salvas; confirmação antes de descartar ou abandonar uma edição. Não são armazenados rascunhos com dados de doadores no navegador.                       |
| Prägnanz               | Tipografia sem serifa, títulos sólidos, hierarquia previsível, cartões simples; removidos desenhos decorativos, etiquetas de abertura e cartões com efeitos desnecessários.                                 |
| Semelhança             | Campos, estados, botões, métricas e diálogos usam componentes compartilhados no portal e na administração.                                                                                                  |
| Conectividade uniforme | Cada conjunto de campos tem contorno e legenda; item, quantidade e unidade permanecem no mesmo grupo; estados não dependem apenas de cor.                                                                   |
| Tesler                 | A interface mostra a unidade do item, preseleciona a única opção disponível e explica o cálculo das metas. Regras de acesso e validações do banco são preservadas.                                          |
| Postel                 | Busca ignora acentos, espaços externos e diferença entre maiúsculas e minúsculas; e-mails de autenticação são aparados; dados inválidos continuam sendo rejeitados com orientação.                          |
| Parkinson              | Campos mínimos aparecem primeiro, detalhes opcionais podem ser expandidos; preenchimento de campanha única e item único reduz etapas. Não foram criados cronômetros ou urgência artificial.                 |
| Navalha de Occam       | Componentes compartilhados e estilos simples; fotos locais sem widgets externos; não foram adicionadas bibliotecas de interface nem novas tabelas para esta revisão.                                        |
| Pareto                 | Atalhos para criar campanha e registrar doação na visão geral; no portal, acesso direto a campanhas e orientações de doação. A prioridade é uma hipótese de projeto, a confirmar com métricas reais de uso. |

## Direção visual

- Azul institucional `#173b65`, azul de apoio `#345f9c`, vermelho da marca `#e51a26`, branco e neutros.
- Sem roxo, gradiente nos títulos, Playfair Display, palavras decorativas em itálico, etiquetas de abertura ou listras coloridas em cartões.
- Ícones SVG Lucide; sem emojis nos componentes da interface.
- Conteúdo configurado pelo administrador e registros existentes preservados. Nenhuma migração de banco nesta revisão.

## Fotografias

Imagens de banco identificadas no site como ilustrativas: não representam uma ação documentada do Bahamas nem endosso das pessoas fotografadas. Originais obtidos do Pexels; arquivos locais dimensionados pelo próprio serviço de imagens, sem dependência de carregamento de terceiros em produção.

| Arquivo                                   | Autor e origem                                                                                                                                  |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/images/voluntarios-alimentos.jpg` | [cottonbro studio — Volunteers Boxing Foods to Be Distributed](https://www.pexels.com/photo/volunteers-boxing-foods-to-be-distributed-6591165/) |
| `public/images/organizacao-doacoes.jpg`   | [Gustavo Fring — Volunteers packing up Goods](https://www.pexels.com/photo/volunteers-packing-up-goods-7156179/)                                |

Uso conforme a [licença Pexels](https://www.pexels.com/license/), consultada em 15/11/2026. A foto principal carrega com prioridade; a foto institucional usa carregamento tardio. Ambas têm dimensões declaradas, texto alternativo e recorte responsivo.

## Verificação

- `node --test tests/*.test.js`: 19 testes, incluindo regras de acesso e integridade no PostgreSQL, cálculos, retorno da autenticação, busca e proteção de navegação.
- Build de produção Vite e formatação Prettier.
- Navegador: formulário vazio apresenta erros associados e leva o foco ao primeiro campo inválido; cancelar uma edição apresenta confirmação; continuar mantém os valores; salvar campanha e doação conclui o fluxo com dados locais de teste.
- Seleção dependente de campanha e item, com unidade correta e preseleção quando há apenas um item.
- Verificação visual em computador e em largura de 390 px; navegação móvel e fotos locais carregadas.
- Os testes de escrita no navegador usam `tests/fixtures/ux.html`, somente no servidor de desenvolvimento. O build não publica esse arquivo. Não foram criadas campanhas nem doações de teste em produção.

Referência conceitual: [Laws of UX](https://lawsofux.com/). Os nomes acima seguem a lista fornecida pelo responsável pelo projeto, que combina leis, efeitos e princípios de projeto.
