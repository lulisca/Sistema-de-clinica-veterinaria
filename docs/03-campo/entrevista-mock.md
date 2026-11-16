# Entrevista mockada - Vila Nova EC

> Cenario preenchido para definir regras de desenvolvimento e compor o C1-MOCKED aprovado pelo GP. Nao representa entrevista, resposta clinica ou participacao externa real.

| Pergunta | Resposta `MOCKED` adotada no projeto |
|---|---|
| Quais tipos mais comuns? | Consulta, vacina, exame e retorno |
| Como entram na fila? | Agendados fazem check-in; demanda espontanea entra como encaixe |
| Quem define emergencia? | Somente veterinario ou administrador autorizado |
| Quais eixos separam atendimentos? | Especie e tipo/motivo; risco infeccioso ou reativo exige cuidado adicional |
| Como desempatar? | Emergencia, prioridade, horario de check-in e ID |
| O tutor pode esperar fora? | Sim, usando o link publico |
| E se negar localizacao? | Continua no sistema com aviso fixo |
| Antecedencia sem GPS? | 20 minutos, configuracao `MOCKED` aprovada pelo GP |
| Retencao do deslocamento? | 60 minutos, configuracao `MOCKED` aprovada pelo GP |
| Margem de retorno? | 10 minutos, configuracao `MOCKED` aprovada pelo GP |
| Qual canal de aviso? | `SIMULATOR` nesta versao |
| Recurso compartilhado critico? | Sala de isolamento e profissional veterinario |

## Uso

As respostas orientam frontend, backend, testes e demonstracao da versao atual. Se uma entrevista real for autorizada posteriormente e produzir regras diferentes, contrato, ADR, testes e manual devem ser atualizados com a data e a evidencia verdadeiras.
