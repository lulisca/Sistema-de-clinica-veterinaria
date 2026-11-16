# Handoff para o frontend - liberado

> Contrato liberado para o G2 trabalhar. Fonte detalhada: `backend/docs/API_CONTRACT.md` e Swagger da API executada.

## Telas minimas

1. **Login interno** - e-mail, senha e armazenamento do JWT.
2. **Recepcao/fila** - listar entradas, filtros, estados, p50/p90 e acoes.
3. **Novo atendimento** - agendamento, check-in e encaixe.
4. **Tutor publico** - status pelo token, faixa de espera, consentimento e retorno.
5. **Prioridade/recurso** - disponivel conforme perfil; mostrar conflito de recurso.
6. **Falhas de aviso** - lista e resolucao da acao da recepcao.

## Fluxo minimo de entrega

1. login;
2. criar/usar tutor e animal;
3. criar encaixe ou check-in;
4. abrir link publico;
5. mostrar F1 ou `insufficient_data`;
6. aceitar ou negar localizacao;
7. avaliar aviso `SIMULATOR` e confirmar retorno;
8. alterar prioridade com perfil autorizado;
9. iniciar e finalizar atendimento.

## Regras que o frontend nao pode alterar

- nao enviar latitude/longitude ao backend;
- negacao de localizacao nao bloqueia o tutor;
- `MOCKED` nao e coleta real nem calibracao oficial; quando usado, mostrar `data_source=MOCKED`;
- emergencia so aparece para veterinario/admin;
- p50 e p90 nao sao media global nem garantia maxima;
- erros `401`, `403`, `404`, `409` e `422` devem ser mostrados;
- canal atual e `SIMULATOR`, sem alegar WhatsApp/SMS.

## Parametros de trabalho

- aviso fixo sem GPS: 20 min;
- retencao: 60 min;
- margem de seguranca: 10 min;
- estimativa de apresentacao: `ALLOW_MOCKED_ESTIMATES=true`;
- CORS local: `http://localhost:3000`.

Os valores sao linha de trabalho para concluir a interface; a arquiteta pode altera-los antes do fechamento.

## Criterio de aceite do G2

- jornada principal funciona sem Swagger;
- tutor nao acessa outro atendimento;
- estados e mensagens batem com a API;
- nenhum segredo esta no codigo;
- frontend informa a URL/configuracao esperada da API;
- G3 consegue executar os casos CT01-CT20.
