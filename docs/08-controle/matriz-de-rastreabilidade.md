# Matriz de rastreabilidade

| Feature/criterio | Requisito | Codigo/evidencia | Teste | Documento | Estado |
|---|---|---|---|---|---|
| F1 | RF06/RF07 | `backend/app/services/estimation.py` | CT01-CT05 + testes API | F1 implementacao e contrato | Backend pronto; integracao/C1 pendentes |
| F2 | RF08-RF10 | rotas F2 em `backend/app/api/router.py` | CT06-CT11 + `test_f2.py` | F2 implementacao e ADR proposta | Backend pronto; parametros/front pendentes |
| F3 | RF11-RF13 | modelos, fila e alocacoes | CT12-CT16 | requisitos e ADR-001 proposta | Backend pronto; aprovacao/front pendentes |
| C1 | Dados de campo | CSV mockado separado | validacao estrutural | relatorio C1 mock | A validar; mock nao substitui campo |
| C2 | Gestao | `docs/01-*` e `docs/02-*` | revisao documental | escopo, EAP, cronograma, riscos | Preparado; aprovacao/atas pendentes |
| C3 | Arquitetura | `backend/docs` e `docs/04-*` | revisao de contrato | arquitetura, modelo e ADRs | Propostas aguardam aprovacao |
| C4 | Sistema | backend e futuro frontend | CT01-CT20 | manual e demo | Backend parcial; front/deploy pendentes |
| C5 | Hardware | esquema proposto | revisao de calculo | hardware e ADR-002 | Cotacao/datasheet pendentes |
| C6 | Qualidade | 30 testes automatizados | `30 passed in 30.65s` + plano | `docs/06-testes` | Backend aprovado; integracao/bancada pendentes |
| C7 | Apresentacao | roteiro e slides | ensaio | `docs/07-encerramento` | Estrutura pronta; execucao pendente |
| C8 | Processo | Git e registro de IA | auditoria do historico | `docs/registro-de-ia.md` | Em andamento |

## Regra de atualizacao

Nenhuma linha muda para concluida sem commit/versao e evidencia correspondente. Ao corrigir requisito ou defeito, atualizar codigo, teste e documento na mesma entrega.
