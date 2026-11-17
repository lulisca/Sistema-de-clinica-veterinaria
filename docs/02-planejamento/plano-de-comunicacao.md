# Plano de comunicacao

> **Marco planejado:** 2026-10-12. **Elaboracao e revisao real:** 2026-11-16. Os registros devem usar a data efetiva e identificar explicitamente qualquer cenario `MOCKED`.

| Comunicacao | Participantes | Canal | Frequencia/prazo | Registro | Responsavel |
|---|---|---|---|---|---|
| Reuniao de marco | Todos | Presencial ou chamada | Conforme calendario academico | Ata ou resumo datado no repositorio | GP |
| Status das frentes | Lideres G1/G2/G3, GP e arquiteto | Grupo da equipe | Diario durante o fechamento | Resumo, checklist, commit ou PR | Cada frente |
| Decisao arquitetural | Arquiteto, GP e afetados | Reuniao + PR | Antes da implementacao definitiva | ADR datado e PR | Arquiteto |
| Alteracao de contrato | G1, G2 e G3 | Issue/PR | Antes do merge | Contrato e testes atualizados | Arquiteto |
| Bloqueio critico | Qualquer integrante + GP | Canal imediato | Ao identificar | Issue, mensagem consolidada ou PR | Quem detectou |
| Revisao de risco | GP e G3 | Reuniao de marco | A cada marco | Plano de riscos | G3 |
| C1, extensao e Empresa 02 `MOCKED` | GP, arquiteto e G3 | Documentos do repositorio | No fechamento da versao | Aviso `MOCKED`, relatorio e limitacoes | GP + G3 |
| Atividade externa real futura | GP, professor e participantes autorizados | Canal academico oficial | Somente apos autorizacao | Data, participantes, consentimento e evidencia verificavel | GP |
| Publicacao e teste externo | G1, G2, G3 e arquiteto | PR + ambiente publicado | Durante o fechamento | URLs, versao, migrations e smoke test | Arquiteto + G3 |
| Entrega ao professor | GP e equipe | Canal academico | Datas oficiais | Comprovante e identificacao da versao | GP |

## Formato do status diario

1. resultado concluido desde o ultimo status;
2. proximo resultado verificavel;
3. bloqueio e pessoa necessaria;
4. link para PR, issue, commit ou documento.

## Regras

- decisao relevante vira ADR, ata, issue ou atualizacao documental na data real;
- trabalho de outra frente so e concluido com evidencia;
- mudanca incompativel da API e comunicada antes do merge;
- segredos, dados pessoais e coordenadas nao entram em canais ou commits;
- integrante ausente consulta o registro e responde as acoes atribuidas;
- pessoa sorteada, nao apenas o GP, apresenta o status;
- conteudo `MOCKED` nunca e comunicado como participacao, coleta ou validacao externa real.

## Escalonamento

| Nivel | Exemplo | Prazo | Acao |
|---|---|---:|---|
| 1 - local | duvida ou pequena correcao | mesmo dia | Resolver na frente e registrar no PR |
| 2 - integracao | contrato ou conflito entre frentes | 4 horas uteis | Acionar arquiteto e GP |
| 3 - marco | risco de nao publicar, testar ou entregar | imediato | GP suspende escopo extra e prioriza o bloqueador |
| 4 - academico | professor solicitar evidencia real alem dos cenarios `MOCKED` | imediato | GP solicita orientacao formal antes de alterar a linha de base |
