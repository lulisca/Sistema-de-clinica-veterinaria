# Registro de integração frontend/backend

> **Estado em 2026-11-16:** frontend integrado ao backend da `development` e incorporado à linha de revisão final. O contrato de referência está em `backend/docs/API_CONTRACT.md`; a execução local também disponibiliza o Swagger da API.

## Telas integradas

1. **Login interno:** e-mail, senha, JWT e controle por perfil.
2. **Fila da recepção:** filtros, estados, p50/p90, chamada, início, conclusão, emergência e reordenação.
3. **Cadastro:** agendamento, check-in e encaixe.
4. **Detalhe do atendimento:** estimativas, avisos, retorno, sintomas e recursos.
5. **Tutor público:** status pelo token, faixa de espera, consentimento, localização calculada no navegador e confirmação de retorno.
6. **Recursos e avisos:** alocação exclusiva, conflito, falha de notificação e providência da recepção.
7. **Indicadores:** prontidão da F1, histórico previsto × realizado e erro.

O RF17 possui contrato e backend de autoatendimento autenticado, mas não recebe tela dedicada no escopo congelado desta versão.

## Jornada integrada

1. autenticar a equipe;
2. criar agendamento, check-in ou encaixe;
3. entregar o link público ao tutor;
4. mostrar p50/p90 ou `insufficient_data`;
5. aceitar ou negar localização sem enviar coordenadas ao backend;
6. avaliar aviso `SIMULATOR` e confirmar retorno;
7. declarar ou remover emergência com perfil autorizado;
8. reordenar a fila e tratar `409` quando a lista estiver desatualizada;
9. alocar e liberar recurso exclusivo;
10. iniciar e concluir o atendimento.

## Regras consolidadas

- latitude e longitude não são enviadas ao backend;
- negar localização não bloqueia o tutor;
- o C1-MOCKED é a linha aprovada pelo GP para esta entrega, sem alegação de coleta real;
- com `ALLOW_MOCKED_ESTIMATES=true`, a interface pode mostrar p50/p90 e deve identificar `data_source=MOCKED`;
- emergência, remoção de emergência e reordenação aparecem somente para veterinário/admin;
- reordenação com versão ou lista desatualizada retorna `409`, recarrega a fila e exige nova confirmação;
- p50 e p90 não são média global nem garantia máxima;
- erros `401`, `403`, `404`, `409` e `422` recebem mensagens compreensíveis;
- o canal atual é `SIMULATOR`, sem alegação de WhatsApp, SMS ou e-mail real;
- sintomas e contato não aparecem no status público.

## Parâmetros congelados

| Parâmetro | Valor da entrega |
|---|---|
| Aviso fixo sem localização | 20 minutos `MOCKED` |
| Retenção do snapshot | 60 minutos `MOCKED` |
| Margem de segurança | 10 minutos `MOCKED` |
| Estimativa da apresentação | `ALLOW_MOCKED_ESTIMATES=true` |
| API local | `http://localhost:8000/api` |
| Frontend local/CORS | `http://localhost:3000` |

## Evidências de integração

| Verificação | Estado | Evidência |
|---|---|---|
| Contrato consumido pelo frontend | Concluído | `frontend/src/api.ts` e `backend/docs/API_CONTRACT.md` |
| Estados e mensagens alinhados | Concluído | `frontend/src/textos.ts` e manual do usuário |
| Controle de perfil | Concluído | login, emergência e reordenação |
| Privacidade do tutor | Concluído | token isolado, minutos sem coordenadas e campos públicos reduzidos |
| Build e lint históricos | Concluído | execução registrada em `docs/06-testes/resultados-testes.md` |
| Suite backend | Concluído | 43 testes aprovados |
| CT19 ponta a ponta local | Em execução | registro será acrescentado aos resultados de testes |
| Publicação e CT20 | Em execução | Vercel, Neon e smoke HTTPS |

## Responsabilidade após a integração

- **G1:** mantém contrato, API, banco e correções do backend;
- **G2:** mantém as telas e mensagens alinhadas ao contrato;
- **G3:** executa e registra CT19, CT20, bancada e encerramento;
- mudanças posteriores devem atualizar código, teste, manual e matriz de rastreabilidade na mesma entrega.
