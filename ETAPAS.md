
## Requisitos obrigatórios (definidos pelo professor)

Esses pontos **não são negociáveis** — todo entregável técnico precisa contemplá-los:

- **Tempo médio de espera** — o sistema calcula e mostra uma estimativa de quanto o tutor vai esperar.
- **Taxa de erro para mais e para menos** — a estimativa vem com margem (ex.: "25 ± 5 min"), e o sistema acompanha o erro real ao longo do uso.
- **Hierarquia de prioridade** — a fila respeita níveis de prioridade (quais níveis existem continua sendo decisão nossa).
- **Geolocalização** — o sistema usa a localização do tutor para saber se ele consegue chegar a tempo quando for chamado.

---

## Papéis individuais

- **Gerente de Projeto (GP)** — conduz as reuniões de segunda, cuida de cronograma, destrava bloqueios.
- **Arquiteto** — decide stack, escreve ADRs, revisa integração entre grupos.

## Sugestão de divisão dos 3 grupos

- **Grupo 1 — Backend:** API, regras da fila, prioridade, notificações, banco.
- **Grupo 2 — Frontend:** telas do tutor, da recepção e (se v1 incluir) do veterinário/gestor.
- **Grupo 3 — Qualidade & Projeto:** documentação, testes, atas, riscos, deploy.

> A divisão não é rígida: quem terminar sua parte ajuda o grupo mais atolado.

---

## As 3 features obrigatórias (piso funcional)

Quem entregar só estas três, em operação e bem sustentadas, já tem o projeto aprovado. O que passar disso é escopo nosso.

- **F1 — Estimativa com faixa de erro:** segmentada por tipo de atendimento (nunca média global), com faixa em vez de valor único (p50 e p90 são preferíveis a média ± desvio, e a escolha precisa de justificativa). É calibrada com o nosso dado de campo e registra previsto × realizado para medir o erro.
- **F2 — Distância decide o aviso:** a posição é pedida só em momentos-chave (entrar na fila, acionamento, confirmar deslocamento), sem rastreamento contínuo. Guardamos só a faixa de distância ou o tempo de deslocamento, com consentimento explícito e retenção curta. **Quem recusa a permissão usa o sistema com acionamento por tempo fixo.** Isso é requisito, não concessão.
- **F3 — Segregação de filas:** pelo menos 2 eixos (espécie, motivo, risco ou recurso), regra de desempate declarada e recurso compartilhado tratado (ex.: sala de isolamento única). A emergência passa na frente, mas quem a classifica é o veterinário, nunca o sistema.

---

## Ordem recomendada de execução

Os marcos são às segundas-feiras, com a coordenação. Entre um marco e outro, seguimos o nosso cronograma interno.

### Levantamento e arquitetura

**S1 · 05/10 — Kickoff**
- Critério de divisão declarado e **ADR-000** (divisão e frentes).
- GP e Arquiteto designados.
- Repositório criado e termo de abertura.

**S2 · 12/10 — Campo**
- Clínica parceira confirmada e cronograma da empresa.
- Mapa de stakeholders e premissas e restrições.
- 1ª janela de observação feita.

**S3 · 19/10 — Escopo**
- Escopo e EAP, requisitos e casos de uso.
- 2 janelas de observação acumuladas e entrevista com o responsável registrada.
- O professor publica o roteiro de demonstração até esta data.

**S4 · 26/10 — Arquitetura (marco crítico)**
- **Contrato de interface congelado** entre as três frentes.
- Modelo de dados e ADRs das decisões estruturais (F2 tem ADR obrigatório).
- Esquema de hardware, plano de riscos e estimativa de custos.

### Implementação

**S5 · 02/11 — Fatia vertical**
- Uma feature em operação do banco à interface.
- 4 janelas de observação concluídas, com o dado de campo digitado e versionado.

**S6 · 09/11 — As três features em operação**
- F1, F2 e F3 funcionando, plano de testes elaborado e riscos revisados.

### Qualidade, entrega e defesa

**S7 · 16/11 — Congelamento**
- Código congelado e sistema publicado com dados de teste (checklist abaixo).
- Manual do usuário pronto.
- Ato extensionista na semana (data ajustada com o parceiro). 18/11 é a Prova Interdisciplinar.
- Na terça-feira, a outra empresa já começa a testar o nosso sistema.

**S8 · 23/11 — Bancada cruzada**
- Entregamos o **Relatório de Bancada Cruzada** (23/11): mínimo de 15 casos sobre o sistema da outra empresa, cobrindo as 3 features e pelo menos 3 casos de borda (entrada inválida, permissão negada, estado impossível).
- Respondemos a cada defeito recebido: acatar, contestar com fundamento ou marcar como fora de escopo.
- **24/11:** entrega do pacote do Projeto Integrador.

**S9 · 30/11 — Apresentação final**
- 20 min por empresa: 12 de apresentação e 8 de arguição. Máximo de 8 slides, e ao menos 2 com indicadores medidos por nós.
- Estrutura dos 12 min: clínica e medição (1:30) → decisões de arquitetura (2:30) → demo ao vivo (4:00) → defeitos da bancada e respostas (2:00) → erro da estimativa e revisão crítica (2:00).
- Sorteio na hora: 1 integrante conduz e 2 respondem à arguição, entre todos os presentes.
- Relatório de extensão.

**03/12 — Entrega final**
- Versão com os defeitos acatados corrigidos, documentação e lições aprendidas.

> Se um marco atrasar, a resposta é **reduzir escopo**, nunca prorrogar prazo. Sem congelamento em 16/11 não há bancada cruzada, e sem ela o projeto perde um quarto da avaliação.

---

## Rotina que corre o projeto inteiro

- **Ata da segunda-feira** (5 linhas), commitada no mesmo dia. O status é exposto por um integrante **sorteado na hora**, nunca pelo GP.
- **Plano de comunicação** (canais e cadência) e plano de riscos revisado a cada marco.
- **Registro de IA** no repositório, com uma linha por uso relevante (o que pediu, o que voltou, o que mudamos e por quê). No fim, registramos **um erro da ferramenta** que a equipe identificou.
- **ADR commitado na data da decisão.** Um arquivo por decisão, em `docs/adr/NNN-titulo-curto.md`.
- **Commits de todos os integrantes**, com autoria configurada. Quem não tiver commits comprova a contribuição em ata.

---

## Dado de campo (clínica real)

- **Mínimo:** 40 atendimentos cronometrados, cobrindo pelo menos 4 tipos, em 4 janelas de 1 hora em **dias e horários distintos**.
- Também medimos o fluxo de chegada, a composição por espécie e motivo, a taxa de ausência e atraso e as regras operacionais, estas por entrevista de 30 min com o responsável.
- Só começamos depois da carta de autorização, que a coordenação providencia.
- Ninguém é identificado (usamos código sequencial) e a observação é não participante. O objeto de estudo é a fila, nunca o desempenho dos funcionários.
- Se a clínica não gerar volume, completamos com registro retrospectivo da agenda e declaramos no relatório o que foi observado e o que foi retrospectivo.
- Dado que não dá para verificar **zera o C1**.

## Hardware (só o esquema nesta versão)

O esquema precisa conter: diagrama de blocos, componentes com justificativa (do inventário do campus ou com orçamento de fornecedor), protocolo de comunicação (HTTP, MQTT ou similar), cálculo de alimentação e consumo, e um ADR. Ideias do PDF: totem com leitor RFID, painel de chamada na recepção ou sensor de presença. O protótipo funcionando até 30/11 dá +0,5.

---

## Checklist de congelamento — 16/11

- [ ] Repositório único, histórico completo, commits de todos
- [ ] Sistema publicado e acessível, com dados de teste
- [ ] F1: estimativa por tipo, com faixa, calibrada no dado de campo
- [ ] F2: distância decide o acionamento, com consentimento e alternativa sem GPS
- [ ] F3: dois eixos, regra de desempate, recurso compartilhado tratado
- [ ] Esquema de hardware com componentes reais e cálculo de alimentação
- [ ] 4 janelas de observação e entrevista, digitadas e versionadas
- [ ] ADRs commitados nas datas das decisões
- [ ] Plano de riscos revisado pela última vez
- [ ] Manual do usuário
- [ ] Registro de IA em dia
- [ ] O sistema opera para usuário externo à equipe (a outra empresa acessa no dia seguinte)

---

## Como a nota é composta

| Critério | Pontos |
|---|---|
| C1 Dado de campo | 1,0 |
| C2 Gestão (escopo, cronograma, riscos, custos, atas) | 1,5 |
| C3 Arquitetura e ADRs | 1,5 |
| C4 Sistema (3 features, integração, publicação) | 2,0 |
| C5 Hardware | 1,0 |
| C6 Qualidade (testes, bancada cruzada, respostas) | 1,0 |
| C7 Apresentação e arguição | 1,5 |
| C8 Processo (repositório, ADRs datados, Registro de IA) | 0,5 |
| **Total** | **10,0** |
| Bônus: protótipo de hardware em operação | +0,5 |

- Somos avaliados contra o **nosso próprio planejamento**, não contra a outra empresa.
- **Ajuste individual de até −2,0** para quem for sorteado (na segunda-feira ou na arguição) e não souber sustentar o trabalho. Não existe ajuste positivo.
- **Zeram critérios:** dado de campo não verificável (C1) e uso de IA não declarado (C8). ADR sem commit na data não conta. Código que a equipe não sabe explicar não é considerado da equipe.

---

## Decisões nossas (cada uma vira ADR)

- [ ] Critério de divisão, as 3 frentes, nomes e papéis (**ADR-000**, já na S1)
- [ ] Perfis atendidos na v1 (tutor + recepção? inclui veterinário?)
- [ ] Canal de notificação da demo (painel, WhatsApp, SMS, e-mail ou push)
- [ ] Eixos de segregação, pesos e regra de desempate (levantados com o veterinário da clínica)
- [ ] Faixa da estimativa (p50/p90 ou média ± desvio) e como calcular o tempo
- [ ] Como obter a posição do tutor (**ADR obrigatório da F2**)
- [ ] Stack técnico, padrão de arquitetura, forma de integração e hospedagem
- [ ] Hardware escolhido (**ADR obrigatório**)
