# Plano de testes

> **Versao:** 2026-11-16. A suite backend atual possui 43 testes. O frontend esta integrado; a jornada local CT19 e o smoke externo CT20 permanecem em execucao.

## Objetivos

- verificar F1, F2 e F3;
- cobrir seguranca, privacidade, estados impossiveis e entradas invalidas;
- validar frontend, API e banco;
- produzir evidencia reproduzivel para congelamento e bancada `MOCKED`.

## Niveis

| Nivel | Escopo | Responsavel | Evidencia |
|---|---|---|---|
| Estatico | contrato, segredos e documentacao | G3 | diff e checklist |
| Frontend | TypeScript, build e lint | G2 + G3 | saida dos comandos |
| Automatizado API | `backend/tests` | G1 + G3 | `pytest -q` |
| Integracao | frontend, API e banco | G2 + G3 | casos e capturas |
| Ponta a ponta | jornada tutor/recepcao/veterinario | Rafa + G3 | CT19 registrado |
| Smoke externo | URLs publicadas | G3 | CT20, versao e data |
| Bancada cruzada | Empresa 02 ficticia | G3 | BC01-BC16 e evidencias locais |

## Ambiente minimo

- dependencias de `backend/requirements.txt` e `frontend/package-lock.json`;
- banco isolado para teste;
- variaveis `MOCKED` sem segredos reais;
- frontend e API na mesma versao;
- navegador anonimo para token publico.

## Criterios locais de saida

- suite automatizada aprovada;
- casos criticos F1/F2/F3 cobertos;
- nenhum defeito critico aberto;
- defeitos observados registrados, triados e retestados;
- CT19 executado com branch, commit, ambiente e evidencia.

## Criterios de liberacao externa

- Vercel e Neon configurados;
- migrations e CORS conferidos;
- CT20 executado por HTTPS;
- URLs e commit da versao registrados.

## Suite manual minima

| ID | Feature | Caso | Resultado esperado |
|---|---|---|---|
| CT01 | F1 | estimativa com amostras | p50/p90 por tipo |
| CT02 | F1 | amostras insuficientes | `insufficient_data` |
| CT03 | F1 | tipos diferentes | distribuicoes separadas |
| CT04 | F1 | iniciar/finalizar | espera real e erros gravados |
| CT05 | F1 | massa `MOCKED` | excluida por padrao e identificada quando habilitada |
| CT06 | F2 | consentir deslocamento | somente minutos persistidos |
| CT07 | F2 | negar localizacao | acesso mantido e fallback |
| CT08 | F2 | enviar coordenadas | payload rejeitado |
| CT09 | F2 | aviso duplicado | segunda notificacao bloqueada |
| CT10 | F2 | falha de aviso | acao da recepcao criada |
| CT11 | F2 | snapshot expirado | removido e fallback aplicado |
| CT12 | F3 | emergencia por recepcao | operacao negada |
| CT13 | F3 | emergencia por vet/admin | entrada passa a frente |
| CT14 | F3 | mesma prioridade | check-in mais antigo primeiro |
| CT15 | F3 | filtros por especie/tipo | resultados corretos |
| CT16 | F3 | recurso ocupado | dupla alocacao rejeitada |
| CT17 | Seguranca | token publico invalido | erro sem vazamento |
| CT18 | Seguranca | JWT ausente | `401` nas rotas internas |
| CT19 | Integracao | jornada completa local | cadastro/check-in ate `COMPLETED` |
| CT20 | Publicacao | acesso externo | frontend/API por HTTPS |
| CT21 | F1 tela | sem amostras | “Indisponivel”, nunca “0 min” |
| CT22 | F2 tela | “Agora nao” | fila mantida com aviso fixo |
| CT23 | F2 tela | permitir localizacao | rede envia minutos, sem coordenadas |
| CT24 | F3 tela | login como recepcao | emergencia nao aparece |
| CT25 | Seguranca tela | fila sem login | redireciona ao login |
| CT26 | Entrada invalida | campo vazio ou duracao invalida | recusa sem criar registro |
| CT27 | Tutor | registrar conta, animal e entrada | fluxo autenticado criado |
| CT28 | Tutor | usar animal de outro tutor ou duplicar entrada | operacao rejeitada |
| CT29 | F3 | reordenar fila | nova ordem persistida e F1 recalculada |
| CT30 | Concorrencia | reordenar lista desatualizada | `409`, recarga e nova tentativa |
| CT31 | F3 | remover emergencia | entrada retorna a ordenacao comum |
| CT32 | Privacidade | consultar status publico | sintomas e contato ausentes |

## Roteiro comum do professor

| Passo | Casos |
|---|---|
| Chegada e estimativa | CT01, CT03, CT21 |
| Segregacao e recurso | CT15, CT16 |
| Emergencia e fila | CT12, CT13, CT24, CT31 |
| Tutor distante/proximo | CT06, CT23 |
| Recusar localizacao | CT07, CT22 |
| Encerrar e comparar erro | CT04, CT19 |
| Historico e erro medio | CT04 e tela Indicadores |

## Regressao

Reexecutar casos afetados e a suite automatizada apos mudanca em contrato, estados, estimacao, consentimento, prioridade, migrations ou deploy.

## Registro de defeito

Registrar ID, origem, versao, ambiente, pre-condicao, passos, esperado, obtido, severidade e evidencia. Defeito critico bloqueia liberacao; alto bloqueia a feature; medio exige decisao; baixo nao impede o fluxo principal.
