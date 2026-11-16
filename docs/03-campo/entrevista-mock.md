# Entrevista mockada - Vila Nova EC

> Roteiro preenchido para definir regras de desenvolvimento. Nao representa entrevista real nem evidencia do C1.

| Pergunta | Resposta mockada usada no projeto |
|---|---|
| Quais tipos mais comuns? | Consulta, vacina, exame e retorno |
| Como entram na fila? | Agendados fazem check-in; demanda espontanea entra como encaixe |
| Quem define emergencia? | Somente veterinario ou administrador autorizado |
| Quais eixos separam atendimentos? | Especie e tipo/motivo; risco infeccioso/reativo exige cuidado adicional |
| Como desempatar? | Emergencia, prioridade, horario de check-in e ID |
| O tutor pode esperar fora? | Sim, usando o link publico |
| E se negar localizacao? | Continua no sistema com aviso fixo |
| Antecedencia inicial sem GPS? | 20 minutos para testes |
| Retencao do deslocamento? | 60 minutos para testes |
| Margem inicial de retorno? | 10 minutos para testes |
| Qual canal de aviso? | `SIMULATOR` nesta versao |
| Recurso compartilhado critico? | Sala de isolamento e profissional veterinario |

## Uso

As respostas orientam frontend, backend e testes. Se houver decisao real diferente, contrato, ADR, testes e manual devem ser atualizados.
