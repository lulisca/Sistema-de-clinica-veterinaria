# Plano de comunicacao

> **Versao planejada:** 2026-10-12. Consolidada em 2026-11-15 sem criar registros retroativos.

| Comunicacao | Participantes | Canal | Frequencia/prazo | Registro | Responsavel |
|---|---|---|---|---|---|
| Reuniao de marco | Todos | Presencial ou chamada | Segunda-feira | Ata no repositorio no mesmo dia | GP |
| Status das frentes | Lideres G1/G2/G3, GP e arquiteto | Grupo da equipe | Diario durante a execucao | Resumo ou checklist | Cada frente |
| Decisao arquitetural | Arquiteto, GP e afetados | Reuniao + PR | Antes da implementacao definitiva | ADR datado e PR | Arquiteto |
| Alteracao de contrato | G1, G2 e G3 | Issue/PR | Antes do merge | Contrato e testes atualizados | Arquiteto |
| Bloqueio critico | Qualquer integrante + GP | Canal imediato | Ao identificar | Issue ou impedimento | Quem detectou |
| Revisao de risco | GP e G3 | Reuniao de marco | A cada marco | Plano de riscos | G3 |
| Validacao externa | Equipe avaliadora | Canal do professor | Quando houver acesso | Relatorios e evidencias | G3 |
| Entrega ao professor | GP e equipe | Canal academico | Datas oficiais | Comprovante/versao | GP |

## Formato do status diario

1. concluido desde o ultimo status;
2. proximo resultado verificavel;
3. bloqueio e pessoa necessaria;
4. link para PR, issue, commit ou documento.

## Regras

- decisao relevante vira ADR, ata, issue ou atualizacao documental;
- trabalho de outra frente so e concluido com evidencia;
- mudanca incompativel da API e avisada antes do merge;
- segredos, dados pessoais e coordenadas nao entram em canais ou commits;
- ausente na reuniao le a ata e responde pendencias;
- pessoa sorteada, nao apenas o GP, apresenta o status.

## Escalonamento

| Nivel | Exemplo | Prazo | Acao |
|---|---|---:|---|
| 1 - local | duvida ou pequena correcao | mesmo dia | Resolver na frente e registrar no PR |
| 2 - integracao | contrato ou conflito entre frentes | 4 horas uteis | Acionar arquiteto e GP |
| 3 - marco | risco de nao publicar/testar/entregar | imediato | GP reduz escopo extra |
| 4 - academico | C1, Empresa 02, professor ou parceiro | imediato | GP solicita orientacao formal |
