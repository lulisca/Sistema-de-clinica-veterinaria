# Plano de testes

> **Versao:** 2026-11-16. Existem 30 testes backend, que passaram em 15/11/2026. O frontend foi integrado em 15/11 e passou em build e lint em 16/11. Resultados detalhados em [resultados-testes.md](resultados-testes.md).

## Objetivos

- verificar F1, F2 e F3 contra os criterios academicos;
- cobrir seguranca, privacidade, estados impossiveis e entradas invalidas;
- validar integracao frontend-API-banco;
- produzir evidencia reproduzivel para congelamento e bancada.

## Niveis

| Nivel | Escopo | Responsavel | Evidencia |
|---|---|---|---|
| Estatico | compile, contrato, segredo e documentacao | G3 | comandos e diff |
| Estatico frontend | tipos TypeScript e lint | G2 + G3 | saida de `npm run build` e `npm run lint` |
| Automatizado API | `backend/tests` | G1 + G3 | saida `pytest -q` |
| Integracao | frontend, API e banco | G2 + G3 | casos e capturas |
| Ponta a ponta | jornadas de tutor/recepcao/vet | G3 | roteiro preenchido |
| Smoke externo | URL publicada | G3 | data, versao e resultado |
| Bancada cruzada | sistema Empresa 02 | G3 | minimo 15 casos |

## Ambiente minimo

- Python e dependencias de `backend/requirements.txt`;
- banco limpo ou isolado para teste;
- variaveis de demonstracao sem segredos reais;
- frontend apontando para a mesma versao da API;
- navegador em janela anonima para testar token do tutor.

## Criterios de entrada

- versao/commit identificados;
- migrations aplicadas;
- massa de teste sem dados pessoais;
- endpoints e telas necessarios disponiveis.

## Criterios de saida

- testes automatizados executados e falhas triadas;
- todos os casos criticos F1/F2/F3 aprovados;
- nenhum defeito critico aberto;
- defeitos medios/baixos registrados com decisao;
- URL externa submetida a smoke test;
- evidencias vinculadas a versao.

## Suite manual minima

| ID | Feature | Caso | Resultado esperado |
|---|---|---|---|
| CT01 | F1 | estimativa com amostras aceitas | p50/p90 por tipo e revisao persistida |
| CT02 | F1 | menos que minimo de amostras | `insufficient_data`, sem numero inventado |
| CT03 | F1 | tipos diferentes | estimativas usam a amostra do tipo correto |
| CT04 | F1 | iniciar atendimento | espera real e erros gravados |
| CT05 | F1 | massa `MOCKED` | excluida por padrao e identificada quando o modo de apresentacao estiver ligado |
| CT06 | F2 | consentir e informar deslocamento | somente minutos persistidos |
| CT07 | F2 | negar localizacao | tutor continua; fallback quando configurado |
| CT08 | F2 | enviar coordenadas | payload rejeitado |
| CT09 | F2 | aviso duplicado | segunda notificacao bloqueada |
| CT10 | F2 | falha de aviso | acao da recepcao criada |
| CT11 | F2 | snapshot expirado | removido e fallback aplicado |
| CT12 | F3 | emergencia por recepcao | operacao negada |
| CT13 | F3 | emergencia por vet/admin | entrada passa a frente |
| CT14 | F3 | mesma prioridade | check-in mais antigo primeiro |
| CT15 | F3 | filtros por especie/tipo | resultados corretos |
| CT16 | F3 | recurso exclusivo ocupado | dupla alocacao rejeitada |
| CT17 | Seguranca | token publico invalido | 404/erro sem vazar dados |
| CT18 | Seguranca | JWT ausente | 401 nas rotas internas |
| CT19 | Integracao | jornada completa | check-in ate conclusao sem inconsistencia |
| CT20 | Publicacao | acesso externo | frontend/API respondem por HTTPS |
| CT21 | F1 tela | tipo sem amostras suficientes | tutor e fila mostram "Indisponivel", nunca "0 min" |
| CT22 | F2 tela | tutor clica em "Agora nao" | tela "Voce segue na fila" com aviso por tempo fixo; a fila continua |
| CT23 | F2 tela | tutor permite localizacao | requisicao enviada a API contem so minutos, sem latitude/longitude (conferir na aba Rede do navegador) |
| CT24 | F3 tela | login como recepcao | botao "Emergencia" nao aparece |
| CT25 | Seguranca tela | abrir `/recepcao/fila` sem login | redireciona para `/recepcao/login` |
| CT26 | Entrada invalida | duracao prevista 0 ou 500 no agendamento | formulario recusa; nada e criado |

## Roteiro comum do professor (Anexo H)

| Passo do roteiro | Casos que cobrem |
|---|---|
| 1. Chegada e estimativa com faixa | CT01, CT03, CT21 |
| 2. Caso que exige segregacao | CT15, CT16 |
| 3. Emergencia e efeito na fila | CT12, CT13, CT24 |
| 4. Tutor distante e proximo | CT06, CT23 |
| 5. Recusar localizacao | CT07, CT22 |
| 6. Encerrar e comparar previsto com realizado | CT04 |
| 7. Historico do dia e erro medio | CT04 (tela Indicadores) |

## Regressao obrigatoria

Reexecutar CT01-CT26 e testes automatizados apos mudanca em contrato, estados, estimacao, consentimento, prioridade, migrations ou deploy.

## Registro de defeito

Cada defeito deve conter ID, versao, ambiente, pre-condicao, passos, esperado, obtido, severidade e evidencia. Critico bloqueia congelamento; alto bloqueia a feature; medio possui contorno; baixo nao impede o fluxo principal.
