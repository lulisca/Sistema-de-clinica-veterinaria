# Contrato de interface consolidado

> **Estado em 2026-11-16:** consolidado contra o backend e o frontend integrados na `development`. `backend/docs/API_CONTRACT.md` e o Swagger da versao executada permanecem como referencias de payload. O teste ponta a ponta no ambiente publicado esta em execucao.

## Convencoes

- Base local: `http://localhost:8000/api`.
- JSON e datas em formato ISO 8601.
- Rotas internas: `Authorization: Bearer <jwt>`.
- Rotas publicas do tutor: token aleatorio na URL; nunca expor contato ou sintomas.
- Erros devem mostrar mensagem compreensivel e preservar o codigo HTTP.

## Fluxos por interface

| Interface/fluxo | Operacoes principais | Uso atual |
|---|---|---|
| Login da equipe | `POST /auth/login` | Frontend da recepcao/veterinario |
| Cadastro assistido | tutores, animais, agendamentos, check-in e `POST /walk-ins` | Frontend da recepcao |
| Fila | consulta, prioridade, chamada, inicio e fim | Frontend da equipe |
| Reordenacao | `PUT /queue/order` com `entry_ids` e `previous_ids` | Veterinario/admin; arrastar ou subir/descer |
| Recursos | criar/remover alocacao exclusiva | Frontend da equipe |
| Status publico | `GET /public/status/{token}` | Retorna estado, posicao e `estimate` |
| Consentimento F2 | consultar politica e enviar aceite/negacao | Frontend do tutor |
| Aviso F2 | decisao, avaliacao, historico, confirmacao, falha e resolucao | Tutor e equipe |
| F1 | estimar, listar revisoes, prontidao e metricas | Equipe e indicadores |
| Autoatendimento autenticado | `POST /auth/tutors/register`, `GET /tutor/me`, `GET|POST /tutor/animals`, `POST /tutor/queue` | Implementado no backend; sem tela dedicada no frontend atual |

## Estados exibidos

- Agenda: `SCHEDULED`, `CHECKED_IN`, `CANCELLED`, `NO_SHOW`, `COMPLETED`.
- Fila: `WAITING`, `CALLED`, `RETURNING`, `READY`, `IN_SERVICE`, `COMPLETED`, `CANCELLED`, `NO_SHOW`.
- Na interface, `RETURNING` aparece como **Retornando** e `COMPLETED` como **Concluído**.
- Notificacao: usar o valor retornado pela API; na demonstracao o canal e `SIMULATOR`.

## Regras obrigatorias de interface

1. `insufficient_data` aparece como estimativa indisponivel, nunca como zero minuto.
2. p50 e a estimativa central; p90 e o limite conservador da faixa.
3. Quando a demonstracao usar dados mockados, exibir ou preservar `data_source=MOCKED`.
4. Pedir consentimento antes da captura pontual; negacao nao bloqueia o tutor.
5. Nao enviar latitude ou longitude ao backend.
6. Emergencia so fica editavel para veterinario/admin e pode ser removida pelo mesmo perfil.
7. Falha de aviso aparece na lista de acoes da recepcao ate ser resolvida.
8. Tratar `401`, `403`, `404`, `409` e `422` sem apagar dados digitados.
9. A ordem da fila so e alterada por veterinario/admin e sempre envia a lista inteira elegivel.
10. Em `409 Queue changed`, recarregar a fila e solicitar nova tentativa de reordenacao.

## Congelamento e mudanca

Qualquer alteracao de rota, payload, enum ou regra exige atualizar:

- `backend/docs/API_CONTRACT.md`;
- este documento;
- frontend afetado;
- testes automatizados ou manuais;
- ADR quando a mudanca for arquitetural.

O contrato esta consolidado para execucao local e externa. A publicacao Vercel + Neon e o smoke CT20 foram verificados em 16/11 no commit `0fd8c67`.
