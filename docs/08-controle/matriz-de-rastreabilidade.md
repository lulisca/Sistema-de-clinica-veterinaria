# Matriz de rastreabilidade

> **Atualização:** 2026-11-16. Matriz conferida contra requisitos RF01-RF18, suite CT01-CT32, frontend integrado, backend atual e linha documental revisada.

## Requisitos e features

| Entrega | Requisitos | Código/evidência | Testes relacionados | Estado |
|---|---|---|---|---|
| Base interna e fila | RF01-RF05 | autenticação, cadastros, agendamento, check-in, encaixe e fila | CT17-CT19, CT25-CT26 | Implementada e integrada; CT19 em execução |
| F1 | RF06-RF07 | `backend/app/services/estimation.py`, indicadores e tela do tutor | CT01-CT05, CT21 | Implementada; C1-MOCKED aprovado para a entrega |
| F2 | RF08-RF10 | consentimento, `travel_minutes`, fallback, avisos e falhas | CT06-CT11, CT22-CT23 | Implementada com parâmetros 20/60/10 `MOCKED` |
| F3 | RF11-RF13, RF16 e RF18 | filtros, prioridade, emergência, reordenação, sintomas e recursos | CT12-CT16, CT24, CT29-CT32 | Implementada e integrada |
| Frontend | RF14 | telas de recepção, tutor, recursos, avisos e indicadores | CT19, CT21-CT26, CT29-CT32 | Integrado à API atual |
| Publicação | RF15 | ADR-003 e `docs/05-publicacao/` | CT20 | Vercel, Neon e smoke HTTPS em execução |
| Autoatendimento | RF17 | registro, animais e entrada remota autenticada | CT27-CT28 | Backend implementado; tela dedicada fora do escopo congelado |

## Critérios do projeto

| Critério | Evidência principal | Verificação | Estado da entrega |
|---|---|---|---|
| C1 · Dados | 40 registros, quatro tipos, quatro janelas e origem identificada | estrutura, importação e F1 com `data_source=MOCKED` | Concluído como C1-MOCKED aprovado pelo GP; não representa coleta real |
| C2 · Gestão | `docs/01-iniciacao/` e `docs/02-planejamento/` | escopo, EAP, cronograma, custos, comunicação e riscos | Concluído na linha de base de 2026-11-16 |
| C3 · Arquitetura | `docs/04-arquitetura/`, `backend/docs/` e ADRs | contrato, modelo, F1/F2/F3, hardware e hospedagem | Consolidado para a versão atual |
| C4 · Sistema | backend, frontend e manual com 12 capturas | CT01-CT32 | Versão local integrada; CT19 e publicação externa em execução |
| C5 · Hardware | esquema, protocolo, alimentação e ADR-002 | revisão documental e cálculo elétrico | Concluído como protótipo documental; construção física fora do escopo |
| C6 · Qualidade | `docs/06-testes/` | 43 testes, CT01-CT32 e BC01-BC16 | Suite automatizada aprovada; CT19 e CT20 em execução |
| C7 · Apresentação | manual, roteiro, slides, capturas e lições | conferência documental e demonstração local | Material concluído; evidência externa acompanha CT20 |
| C8 · Processo | Git, commits, PRs, ADRs e `docs/registro-de-ia.md` | auditoria do histórico | Revisão final registrada; PR e merge para `development` em execução |

## Cobertura dos testes

- **CT01-CT05:** F1 e origem da estimativa.
- **CT06-CT11:** F2, privacidade, fallback e notificações.
- **CT12-CT16:** F3, emergência, filtros e recursos.
- **CT17-CT18:** segurança de token e JWT.
- **CT19:** jornada ponta a ponta local em execução.
- **CT20:** publicação externa por HTTPS em execução.
- **CT21-CT26:** comportamento e validações das telas.
- **CT27-CT28:** autoatendimento autenticado do tutor.
- **CT29-CT31:** reordenação, concorrência e remoção de emergência.
- **CT32:** privacidade do status público.

## Regra de atualização

Mudanças em requisito, contrato ou comportamento devem atualizar código, teste e documento na mesma entrega. Uma atividade externa somente muda para concluída depois de registrar data, versão, ambiente e evidência correspondente; até lá, permanece identificada como em execução.
