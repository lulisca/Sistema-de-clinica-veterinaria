# Bancada cruzada - 15 casos preparados

> Casos prontos para execucao no sistema da outra empresa. Resultados permanecem `NAO EXECUTADO` ate existir acesso; nenhum defeito e inventado.

- **Sistema avaliado:** preencher ao receber acesso.
- **URL/versao:** pendente externa.
- **Executor:** G3.

| ID | Feature | Caso | Passos resumidos | Esperado | Resultado |
|---|---|---|---|---|---|
| BC01 | F1 | estimativa por tipo | inserir consulta e consultar espera | faixa especifica do tipo | NAO EXECUTADO |
| BC02 | F1 | segundo tipo | inserir vacina no mesmo cenario | valor difere de consulta | NAO EXECUTADO |
| BC03 | F1 | falta de amostras | usar tipo sem base suficiente | informar indisponibilidade | NAO EXECUTADO |
| BC04 | F1 | revisao | alterar fila/prioridade | previsao e revisada | NAO EXECUTADO |
| BC05 | F1 | erro real | iniciar atendimento | previsto x realizado registrado | NAO EXECUTADO |
| BC06 | F2 | consentimento aceito | permitir localizacao pontual | aviso considera deslocamento | NAO EXECUTADO |
| BC07 | F2 | permissao negada | negar localizacao | sistema continua com fallback | NAO EXECUTADO |
| BC08 | F2 | deslocamento longo | informar tempo maior | aviso ocorre antes/indica risco | NAO EXECUTADO |
| BC09 | F2 | confirmacao | confirmar retorno | estado atualizado | NAO EXECUTADO |
| BC10 | F2 | aviso duplicado | repetir acionamento | duplicidade bloqueada | NAO EXECUTADO |
| BC11 | F3 | prioridade | criar duas prioridades | maior prioridade vem primeiro | NAO EXECUTADO |
| BC12 | F3 | emergencia | classificar por perfil autorizado | emergencia passa a frente | NAO EXECUTADO |
| BC13 | F3 | perfil indevido | recepcao tenta emergencia | operacao negada | NAO EXECUTADO |
| BC14 | F3 | segregacao | filtrar especie e motivo | grupos corretos | NAO EXECUTADO |
| BC15 | F3 | recurso ocupado | alocar mesmo recurso duas vezes | segunda alocacao rejeitada | NAO EXECUTADO |

## Cobertura de borda

- entrada invalida: BC03 ou payload invalido complementar;
- permissao negada: BC07 e BC13;
- estado impossivel: BC10 e BC15.

## Registro de defeito

Para qualquer falha, preencher:

| Campo | Valor |
|---|---|
| Caso | |
| Versao | |
| Passos | |
| Esperado | |
| Obtido | |
| Severidade | baixa / media / alta |
| Evidencia | captura ou log |

Sem acesso externo, a entrega possivel do G3 e esta suite completa e pronta para execucao.
