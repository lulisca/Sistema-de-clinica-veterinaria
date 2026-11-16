# Plano de comunicacao

> **Versao planejada:** 2026-10-12. Consolidada em 2026-11-15 sem criar registros retroativos.

| Comunicacao | Participantes | Canal | Frequencia/prazo | Registro | Responsavel |
|---|---|---|---|---|---|
| Reuniao de marco | Todos | Presencial ou chamada | Segunda-feira | Ata no repositorio no mesmo dia | G3 |
| Status das frentes | Representantes de G1/G2/G3 | Grupo da equipe | Diario durante a execucao | Resumo ou checklist | Cada frente |
| Decisao arquitetural | Frentes afetadas | Reuniao + PR | Antes da implementacao definitiva | ADR datado e PR | Frente que propoe; G3 registra |
| Alteracao de contrato | G1, G2 e G3 | Issue/PR | Antes do merge | Contrato e testes atualizados | G1 |
| Bloqueio critico | Qualquer integrante + frente afetada | Canal imediato | Ao identificar | Issue ou impedimento | Quem detectou |
| Revisao de risco | Todos | Reuniao de marco | A cada marco | Plano de riscos | G3 |
| Validacao externa | Equipe avaliadora | Canal do professor | Quando houver acesso | Relatorios e evidencias | G3 |
| Entrega ao professor | Equipe | Canal academico | Datas oficiais | Comprovante/versao | G3 |

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
- pessoa sorteada na hora apresenta o status.

## Escalonamento

| Nivel | Exemplo | Prazo | Acao |
|---|---|---:|---|
| 1 - local | duvida ou pequena correcao | mesmo dia | Resolver na frente e registrar no PR |
| 2 - integracao | contrato ou conflito entre frentes | 4 horas uteis | Reunir as frentes afetadas e registrar a decisao |
| 3 - marco | risco de nao publicar/testar/entregar | imediato | Equipe reduz escopo extra |
| 4 - academico | C1, Empresa 02, professor ou parceiro | imediato | G3 solicita orientacao formal |
