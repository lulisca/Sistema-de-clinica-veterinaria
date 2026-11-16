# Bancada cruzada `MOCKED` - Empresa 02

> **Status em 2026-11-16:** simulacao documental aprovada pelo GP. A Empresa 02 e ficticia; os casos usam o sistema real e podem revelar defeitos tecnicos reais. Nao se declara participacao externa.

- **Sistema avaliado:** Agenda + Fila Virtual - Vila Nova EC.
- **Versao-base:** `development` integrada, revisada em `feature/revisao-final`.
- **Executor documental:** G3, com casos de G1 e G2.
- **Evidencias:** testes automatizados, CT19, capturas e logs locais.

## Casos

| ID | Pre-condicao | Acao | Esperado | Evidencia principal | Estado |
|---|---|---|---|---|---|
| BC01 | Massa `MOCKED` habilitada | consultar estimativa de consulta | p50/p90 e origem `MOCKED` | `test_f1_mocked_samples_can_power_identified_presentation_estimate` | Coberto localmente |
| BC02 | Dois tipos com amostras | comparar consulta e vacina | valores segmentados por tipo | testes F1 e relatorio de calibracao | Coberto localmente |
| BC03 | Tipo sem minimo de amostras | solicitar estimativa | `insufficient_data` | `test_f1_refuses_to_invent_estimate_without_data` | Coberto localmente |
| BC04 | Fila com previsao | alterar fila ou prioridade | nova revisao persistida | `test_f1_auto_recalculates_on_queue_changes` | Coberto localmente |
| BC05 | Atendimento com revisoes | iniciar/finalizar | espera e erros registrados | testes de start/finish F1 | Coberto localmente |
| BC06 | Tutor com token valido | consentir e enviar deslocamento | somente minutos persistidos | `test_tutor_can_submit_travel_time_without_coordinates` | Coberto localmente |
| BC07 | Tutor com token valido | negar localizacao | acesso mantido e fallback | `test_location_denial_uses_fixed_notice_and_stores_no_travel_time` | Coberto localmente |
| BC08 | Estimativa e deslocamento ativos | aumentar `travel_minutes` | aviso antecipado ou risco | `test_larger_travel_time_causes_earlier_notification` | Coberto localmente |
| BC09 | Atendimento chamado | confirmar retorno | estado `RETURNING` | `test_tutor_can_confirm_return_using_public_token` | Coberto localmente |
| BC10 | Aviso ativo nao confirmado | avaliar novamente | duplicidade bloqueada | teste de notificacao duplicada | Coberto localmente |
| BC11 | Fila elegivel e veterinario | reordenar entradas | nova ordem persistida | `test_vet_reordena_a_fila` | Coberto localmente |
| BC12 | Veterinario/admin autenticado | declarar emergencia | entrada vai ao topo | `test_only_vet_can_mark_emergency` | Coberto localmente |
| BC13 | Recepcao autenticada | tentar emergencia/reordenacao | operacao negada | testes de papel e reordenacao | Coberto localmente |
| BC14 | Entradas de especies/tipos distintos | aplicar filtros | apenas grupo correto exibido | CT19 e verificacao manual da tela | Em execucao no CT19 |
| BC15 | Recurso ja ocupado | alocar novamente | segunda alocacao rejeitada | `test_resource_cannot_be_double_allocated` | Coberto localmente |
| BC16 | Formulario aberto | enviar vazio, duracao invalida ou tipo inexistente | mensagem clara e nenhum registro | CT26 durante CT19 | Em execucao no CT19 |

BC03 verifica falta de dados para estimativa. Entrada invalida e tratada exclusivamente em BC16.

## Interpretacao dos estados

- **Coberto localmente:** comportamento exercitado por teste automatizado ou evidencia tecnica existente.
- **Em execucao no CT19:** comportamento visual/manual a ser registrado pelo Rafa.
- Um caso `MOCKED` pode abrir defeito real quando o comportamento observado divergir do esperado.

## Registro de evidencia

Para cada caso manual, registrar:

| Campo | Conteudo |
|---|---|
| Caso | BCxx |
| Branch/commit | versao executada |
| Ambiente | SO, navegador, Python/Node e banco |
| Pre-condicao | dados e perfil utilizados |
| Resultado | aprovado ou defeito encontrado |
| Evidencia | captura ou log sem segredo/token completo |

Defeitos encontrados nesta simulacao devem ser registrados em `respostas-aos-defeitos.md`, corrigidos e retestados. O marcador `MOCKED` descreve o cenario, nao reduz a validade tecnica do defeito observado.
