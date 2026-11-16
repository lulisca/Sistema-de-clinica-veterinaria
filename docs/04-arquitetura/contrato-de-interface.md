# Contrato de interface consolidado

> **Fonte tecnica:** `backend/docs/API_CONTRACT.md`. Este resumo orienta frontend e QA; o Swagger da versao executada e a referencia de payload final.

## Convencoes

- Base local: `http://localhost:8000/api`.
- JSON; datas em formato ISO 8601.
- Rotas internas: `Authorization: Bearer <jwt>`.
- Rotas do tutor: token publico na URL; nunca expor contato ou dado clinico.
- Erros devem mostrar mensagem compreensivel e preservar o codigo HTTP.

## Fluxos por tela

| Tela/fluxo | Operacoes principais |
|---|---|
| Login | `POST /auth/login` |
| Agenda/recepcao | `GET/POST /appointments`, `PATCH /appointments/{id}` |
| Chegada | `POST /appointments/{id}/check-in`, `POST /walk-ins` |
| Fila | `GET /queue`, `GET /queue/{id}`, prioridade, chamada, inicio e fim |
| Recursos | criar/remover alocacao na entrada da fila |
| Tutor | `GET /public/status/{token}` |
| Consentimento F2 | consultar politica e enviar aceite/negacao |
| Aviso F2 | decisao, avaliacao, historico, confirmacao e falha |
| F1 | estimar, listar revisoes, prontidao e metricas |

## Estados exibidos

- Agenda: `SCHEDULED`, `CHECKED_IN`, `CANCELLED`, `NO_SHOW`, `COMPLETED`.
- Fila: `WAITING`, `CALLED`, `RETURNING`, `READY`, `IN_SERVICE`, `COMPLETED`, `CANCELLED`, `NO_SHOW`.
- Notificacao: usar o valor retornado pela API; na demo o canal e `SIMULATOR`.

## Regras de interface obrigatorias

1. `insufficient_data` deve aparecer como estimativa indisponivel, nunca como zero minuto.
2. Mostrar p50 como estimativa central e p90 como limite conservador/faixa.
3. Pedir consentimento antes da captura pontual; negacao nao bloqueia o tutor.
4. Nao enviar latitude/longitude ao backend.
5. Emergencia so fica editavel para veterinario/admin.
6. Falha de aviso precisa aparecer na lista de acoes da recepcao.
7. Tratar `401`, `403`, `404`, `409` e `422` sem apagar dados digitados.
8. A ordem da fila so e alterada por veterinario/admin, enviando a lista inteira (`PUT /queue/order`); a recepcao so ve a ordem.

## Congelamento e mudanca

Qualquer alteracao de rota, payload, enum ou regra precisa atualizar:

- `backend/docs/API_CONTRACT.md`;
- este documento;
- frontend afetado;
- testes automatizados/manuais;
- ADR quando a mudanca for arquitetural.

O contrato ainda nao pode ser marcado como homologado porque o frontend nao foi validado ponta a ponta.
