# ADR-0002 — Localização e acionamento da F2

- **Data:** preencher com a data real da deliberação da equipe.
- **Status:** proposta técnica — não aprovada pela clínica/equipe.
- **Responsáveis pela decisão:** preencher com os nomes de quem efetivamente deliberar.

## Contexto

A F2 usa distância ou tempo de deslocamento para decidir quando avisar o tutor. O sistema não deve rastrear o tutor continuamente. O Caderno do Aluno exige solicitação em momentos-chave, consentimento explícito, minimização, retenção curta e operação sem GPS.

## Alternativas

1. **Rastreamento contínuo:** maior exposição de dados, dependência do navegador e consumo de bateria; não adotado nesta implementação.
2. **Captura pontual:** solicitar localização em momentos-chave; converter em tempo estimado de deslocamento; persistir apenas esse tempo por prazo configurado. Reduz a persistência de dados precisos, mas depende de uma captura válida e de um serviço de rotas.
3. **Sem geolocalização:** usar antecedência fixa configurada pela clínica. É menos individualizado, mas mantém o serviço disponível para quem negar permissão.

## Proposta técnica implementada

- Captura pontual nos momentos `CHECK_IN`, `NOTIFICATION` e `RETURN_CONFIRMATION`.
- O backend recebe apenas `travel_minutes`; não recebe nem persiste latitude/longitude.
- Consentimento e finalidade são expostos pelo endpoint de política e registrados na auditoria.
- `LOCATION_RETENTION_MINUTES` controla a expiração no servidor.
- Recusa de permissão usa `DEFAULT_FIXED_NOTICE_MINUTES` quando configurado.
- A decisão compara p50 de espera com tempo de deslocamento + margem explícita e informa `FEASIBLE`, `AT_RISK` ou `INFEASIBLE`.
- A notificação é `SIMULATOR` até a equipe escolher o canal real.

## Consequências e pendências para aprovação

- A equipe precisa escolher e justificar o prazo de retenção.
- A clínica precisa validar a antecedência fixa para quem negar GPS e a margem de segurança.
- A equipe precisa escolher o serviço de rotas e o canal de notificação.
- A captura pontual reduz a exposição e o consumo em relação ao rastreamento contínuo, mas não acompanha mudanças de rota em tempo real.
- O valor de demonstração de 60 minutos não constitui decisão de retenção.

## Critério de aprovação

Substituir o status por `aceito` somente após deliberação real, preencher data e responsáveis, registrar as opções consideradas e commitar o ADR na data da decisão.
