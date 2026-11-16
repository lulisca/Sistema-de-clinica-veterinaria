# ADR-0002 — Localização e acionamento da F2

- **Data de consolidação:** 2026-11-16.
- **Status:** adotado na versão integrada com parâmetros `MOCKED`.
- **Linha de base:** decisão do GP registrada no ADR-001 da raiz.

## Contexto

A F2 usa distância ou tempo de deslocamento para decidir quando avisar o tutor. O sistema não deve rastrear o tutor continuamente. O Caderno do Aluno exige solicitação em momentos-chave, consentimento explícito, minimização, retenção curta e operação sem GPS.

## Alternativas

1. **Rastreamento contínuo:** maior exposição de dados, dependência do navegador e consumo de bateria; não adotado nesta implementação.
2. **Captura pontual:** solicitar localização em momentos-chave; converter em tempo estimado de deslocamento; persistir apenas esse tempo por prazo configurado. Reduz a persistência de dados precisos, mas depende de uma captura válida e de um serviço de rotas.
3. **Sem geolocalização:** usar antecedência fixa configurada pela clínica. É menos individualizado, mas mantém o serviço disponível para quem negar permissão.

## Decisão técnica aplicada

- Captura pontual nos momentos `CHECK_IN`, `NOTIFICATION` e `RETURN_CONFIRMATION`.
- O backend recebe apenas `travel_minutes`; não recebe nem persiste latitude/longitude.
- Consentimento e finalidade são expostos pelo endpoint de política e registrados na auditoria.
- `LOCATION_RETENTION_MINUTES` controla a expiração no servidor.
- Recusa de permissão usa `DEFAULT_FIXED_NOTICE_MINUTES` quando configurado.
- A decisão compara p50 de espera com tempo de deslocamento + margem explícita e informa `FEASIBLE`, `AT_RISK` ou `INFEASIBLE`.
- A notificação da entrega é `SIMULATOR`; canal real está fora do escopo congelado.

## Consequências aceitas

- A configuração `MOCKED` usa retenção de 60 minutos, aviso fixo de 20 minutos e margem de 10 minutos.
- O frontend calcula deslocamento por Haversine; não existe serviço externo de rotas nesta versão.
- O canal permanece `SIMULATOR`, sem alegação de envio externo.
- A captura pontual reduz a exposição e o consumo em relação ao rastreamento contínuo, mas não acompanha mudanças de rota em tempo real.
- Os parâmetros permanecem configuráveis e uma alteração futura exige nova decisão e regressão.

## Rastreabilidade

Contrato, testes e telas relacionados estão em `backend/docs/API_CONTRACT.md`, `backend/tests/test_f2.py` e `frontend/src/paginas/tutor/StatusTutor.tsx`.
