# Roteiro da demonstração

> Meta: demonstrar o piso funcional sem improviso. A publicação externa Vercel + Neon e o smoke CT20 foram concluídos em 16/11.

## Preparação

| Item | Estado da entrega |
|---|---|
| Versão e commit identificados | Concluído |
| Usuários e massa `MOCKED` carregados | Concluído |
| Navegador da recepção e janela anônima do tutor | Concluído |
| Plano B local | Concluído |
| Revisão para não exibir segredo ou dado pessoal real | Concluído |
| URLs externas e smoke CT20 | Concluídos |

## Sequência de 10 a 12 minutos

1. **Problema e escopo (1 min):** espera, deslocamento, prioridade e limites.
2. **Check-in (1 min):** recepção registra atendimento e gera acesso público do tutor.
3. **F1 (2 min):** mostrar p50/p90 e previsto × realizado. Explicar que `ALLOW_MOCKED_ESTIMATES=true` habilita a massa da apresentação e que a API identifica a origem como `data_source=MOCKED`. Mostrar também `insufficient_data`.
4. **F2 (2 min):** consentir, informar deslocamento, avaliar aviso e confirmar retorno.
5. **Borda F2 (1 min):** negar localização e demonstrar o aviso por tempo fixo.
6. **F3 (2 min):** espécie/tipo, emergência autorizada, reordenação e recurso exclusivo.
7. **Qualidade (1 min):** 55 testes do backend, privacidade, CT19 aprovado com ressalvas, CT20 aprovado e limites do cenário `MOCKED`.
8. **Hardware/arquitetura (1 min):** protótipo documental do painel ESP32, protocolo e fluxo HTTPS.
9. **Fechamento (1 min):** resultados, atividades em execução e lições aprendidas.

## Plano B

- se a internet falhar, executar frontend e API localmente;
- se o serviço de rotas falhar, usar o tempo de deslocamento `MOCKED` declarado;
- se a notificação falhar, mostrar o tratamento de falha da recepção;
- se a estimativa estiver sem amostras elegíveis, explicar `insufficient_data` e habilitar apenas a massa `MOCKED` identificada para a apresentação;
- se a publicação externa estiver indisponível durante a apresentação, usar a execução local documentada e citar o CT20 aprovado em 16/11 no commit `0fd8c67`.

## Perguntas que todos devem saber responder

- por que a F1 usa p50/p90 em vez de média global?
- como o sistema identifica uma estimativa calculada com dados `MOCKED`?
- qual é a diferença entre C1-MOCKED e uma coleta real futura?
- quem pode declarar e remover emergência?
- o que acontece quando o tutor nega localização?
- quais dados de localização ficam no banco?
- como o sistema evita dupla alocação de recurso?
- quais são os limites da versão e quais atividades externas estão em execução?
