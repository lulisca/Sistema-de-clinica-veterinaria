# Cronograma do projeto - 05/10 a 16/11/2026

> O planejamento comeca em outubro e acompanha o projeto ate o fechamento interno em 16/11/2026. A coluna de situacao registra o estado consolidado em 15/11, sem criar atas, ADRs ou evidencias retroativas.

## Cronograma completo

| Periodo | Marco/frente | Entrega prevista | Situacao em 15/11 | Acao de fechamento |
|---|---|---|---|---|
| 05/10 | S1 - Kickoff | Grupos, repositorio e termo de abertura | Composicao confirmada; ADR historico ausente | Formalizar agora sem retrodata-lo |
| 06-11/10 | Iniciacao e campo | Stakeholders, premissas, restricoes e primeira janela | Documentos consolidados; campo real ausente | Usar massa `MOCKED` sem alegar coleta real |
| 12/10 | S2 - Campo | Cenario, cronograma e riscos iniciais | Cenario ficticio definido | Manter C1 a validar |
| 13-18/10 | Escopo | Requisitos, casos de uso, entrevista e segunda janela | Requisitos recuperados; entrevista mockada preparada | Aprovar regras com a equipe |
| 19/10 | S3 - Escopo | Escopo, EAP e requisitos aprovados | Artefatos consolidados | Equipe valida linha de base |
| 20-25/10 | Arquitetura | Contrato, modelo de dados, F1/F2/F3, hardware e custos | Backend possui contrato/modelo; documentos tecnicos preparados | G1 e G2 revisam e validam propostas |
| 26/10 | S4 - Arquitetura | Contrato congelado, ADRs, riscos e hardware | Contrato backend existente; ADRs atuais como proposta | Aprovar sem fingir data antiga |
| 27-31/10 | Preparacao da implementacao | Divisao tecnica, massa mockada e inicio da fatia vertical | Massa `MOCKED` pronta e backend em desenvolvimento | Conferir integracao planejada |
| 01-02/11 | S5 - Fatia vertical | Uma feature do banco a interface e quatro janelas acumuladas | Backend F1 disponivel; frontend nao integrado | G2 usa handoff do contrato |
| 03-08/11 | Implementacao | Completar F1, F2 e F3 e integrar frentes | Backend F1/F2 e estruturas F3 implementados | Testar compatibilidade com frontend |
| 09/11 | S6 - Tres features | Features operacionais e plano de testes | Plano pronto; execucao recuperada em 15/11 | 30 testes aprovados em 30,65 s |
| 10-14/11 | Qualidade e documentacao | Testes, manual, deploy, hardware e preparacao da entrega | Documentacao consolidada; deploy/front pendentes | Fechar somente bloqueadores |
| 15/11 | Recuperacao documental | Consolidar tudo que pode ser produzido | Planejamento, arquitetura, campo mockado, QA, publicacao e manual preparados | G3 consolida; G1 e G2 validam o conteudo tecnico |
| 15/11 | Frontend | Telas do tutor e da recepcao | Frontend React integrado a `development` (PR #2) | Build e lint aprovados em 16/11 |
| 16/11 | Fechamento interno | Aprovar decisoes, integrar front, validar backend e entregar pacote | Prazo final interno | Commit, push e disponibilizacao do trabalho |

## Responsabilidades ate o fechamento

| Frente | Entrega ate 16/11 |
|---|---|
| G1 Backend | executar testes, corrigir incompatibilidades comprovadas e revisar F1/F2/F3, contrato e parametros |
| G2 Frontend | implementar o fluxo minimo definido no handoff e revisar o impacto de mudancas no contrato |
| G3 | atualizar documentos, testes, evidencias, manual e encerramento; organizar prioridades e a entrega |

## Prioridade final

1. aprovacoes tecnicas;
2. frontend integrado ao contrato;
3. 30 testes backend executados;
4. jornada ponta a ponta;
5. entrega publicada ou local documentada;
6. commit, push e abertura do PR do pacote do projeto.

Nao existe atividade interna planejada depois de 16/11/2026. Dependencias externas nao realizadas ficam registradas honestamente, com o artefato preparatorio entregue.
