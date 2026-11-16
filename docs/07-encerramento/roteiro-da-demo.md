# Roteiro da demonstracao

> Meta: demonstrar o piso funcional sem depender de improviso. Preencher URLs, logins e responsaveis antes da apresentacao.

## Preparacao

- [ ] versao/commit identificados;
- [ ] usuarios e massa de demo carregados;
- [ ] navegador interno e janela anonima do tutor;
- [ ] plano B local disponivel;
- [ ] nenhuma tela exibe segredo ou dado pessoal real.

## Sequencia de 10 a 12 minutos

1. **Problema e escopo (1 min):** espera, deslocamento, prioridade e limites.
2. **Check-in (1 min):** recepcao registra atendimento e gera acesso publico.
3. **F1 (2 min):** mostrar p50/p90, revisao e depois previsto x realizado; explicar `insufficient_data`.
4. **F2 (2 min):** consentir, informar deslocamento, avaliar aviso e confirmar retorno.
5. **Borda F2 (1 min):** negar localizacao e demonstrar fallback.
6. **F3 (2 min):** especie/tipo, emergencia autorizada, desempate e recurso exclusivo.
7. **Qualidade (1 min):** testes, privacidade, dados mockados e limites do C1.
8. **Hardware/arquitetura (1 min):** painel ESP32 proposto e fluxo HTTPS.
9. **Fechamento (1 min):** resultados, pendencias e licoes.

## Plano B

- se internet falhar, executar frontend/API localmente;
- se servico de rotas falhar, usar tempo de deslocamento de demo declarado;
- se notificacao falhar, mostrar o tratamento de falha da recepcao;
- se estimativa estiver sem amostra aceita, explicar a trava e usar base de demonstracao apropriada sem chama-la de coleta real.

## Perguntas que todos devem saber responder

- por que p50/p90 e nao media global?
- por que `MOCKED` nao calibra a F1?
- quem pode declarar emergencia?
- o que acontece se o tutor negar localizacao?
- quais dados de localizacao ficam no banco?
- como se evita dupla alocacao?
- quais partes ainda nao estao validadas?
