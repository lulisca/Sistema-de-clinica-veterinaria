# Requisitos e casos de uso

> **Marco planejado:** 2026-10-19. **Consolidacao real:** 2026-11-16. Linha de base aprovada pelo GP e conferida contra frontend, backend e 55 testes automatizados.

## Requisitos funcionais

| ID | Requisito | Evidencia | Estado |
|---|---|---|---|
| RF01 | Autenticar equipe por perfil | JWT, perfis e login | Implementado |
| RF02 | Cadastrar tutor e animal | API e cadastro assistido | Implementado |
| RF03 | Criar e alterar agendamentos | API e tela de cadastro | Implementado |
| RF04 | Fazer check-in e encaixe | API e fluxo assistido | Implementado |
| RF05 | Consultar e operar fila | API e tela de fila | Implementado |
| RF06 | Calcular p50/p90 por tipo | Estimacao e tela do tutor | Implementado |
| RF07 | Versionar previsoes e medir erro | Historico e metricas | Implementado |
| RF08 | Solicitar consentimento pontual | API F2 e tela do tutor | Implementado |
| RF09 | Decidir aviso e oferecer fallback | F2 com 20/60/10 `MOCKED` | Implementado |
| RF10 | Registrar aviso, confirmacao e falha | Simulador e tela de avisos | Implementado |
| RF11 | Segregar por especie e tipo | Campos e filtros | Implementado |
| RF12 | Aplicar prioridade e emergencia autorizada | Perfis e ordenacao | Implementado |
| RF13 | Impedir dupla alocacao de recurso | ResourceAllocation | Implementado |
| RF14 | Disponibilizar telas do tutor e equipe | Frontend na `development` | Implementado |
| RF15 | Publicar versao externa | ADR-003 e plano de publicacao | Concluido; CT20 aprovado |
| RF16 | Reordenar com protecao de concorrencia | `PUT /queue/order`, botoes, arrastar e `409` | Implementado |
| RF17 | Autoatendimento autenticado do tutor | Registro, animais e entrada remota | Backend implementado; sem tela dedicada |
| RF18 | Registrar sintomas sem exposicao publica | Modelos, API e telas internas | Implementado |

## Requisitos nao funcionais

| ID | Requisito | Criterio e situacao |
|---|---|---|
| RNF01 | Privacidade | Sem coordenadas no backend; contato e sintomas fora do status publico |
| RNF02 | Seguranca | JWT, token publico aleatorio e segredos fora do Git |
| RNF03 | Rastreabilidade | Auditoria, revisoes F1, Git, ADRs e Registro de IA |
| RNF04 | Portabilidade | Execucao local, Docker e PostgreSQL na producao |
| RNF05 | Usabilidade | Estados claros, erros tratados e fluxos demonstraveis |
| RNF06 | Disponibilidade | Execucao local documentada e publicacao externa verificada por HTTPS |
| RNF07 | Qualidade | 55 testes, casos manuais, capturas e bancada `MOCKED` |
| RNF08 | Integridade academica | Dados `MOCKED` identificados; nenhuma evidencia externa inventada |

## Casos de uso

### UC01 - Registrar chegada

- **Ator:** recepcao.
- **Fluxo:** localizar ou criar atendimento, fazer check-in ou encaixe, informar tipo, especie e sintomas.
- **Resultado:** entrada `WAITING` e token publico; estimativa quando houver amostras elegiveis.

### UC02 - Acompanhar espera

- **Ator:** tutor com token valido.
- **Fluxo:** consultar posicao, estado e p50/p90.
- **Excecao:** mostrar indisponibilidade quando faltarem amostras.

### UC03 - Informar deslocamento

- **Ator:** tutor.
- **Fluxo:** aceitar ou negar consentimento; se aceitar, enviar somente `travel_minutes`.
- **Resultado:** decisao de aviso; negacao usa antecedencia fixa `MOCKED`.

### UC04 - Chamar e confirmar retorno

- **Atores:** equipe e tutor.
- **Fluxo:** avaliar aviso simulado, confirmar retorno e tratar falha pela recepcao.
- **Resultado:** estado `RETURNING` ou providencia manual registrada.

### UC05 - Priorizar e reordenar

- **Ator:** veterinario/admin.
- **Fluxo:** declarar/remover emergencia ou reorganizar a lista elegivel.
- **Restricao:** fila alterada por terceiro retorna `409`; recepcao comum nao classifica emergencia.

### UC06 - Alocar recurso exclusivo

- **Ator:** equipe interna.
- **Fluxo:** iniciar e encerrar alocacao de sala, equipamento ou profissional.
- **Excecao:** recurso ocupado nao pode ser duplicado.

### UC07 - Encerrar atendimento

- **Ator:** equipe interna.
- **Resultado:** espera real e erros gravados; duracao pode virar amostra `SYSTEM`.

### UC08 - Autoatendimento autenticado

- **Ator:** tutor autenticado.
- **Fluxo:** registrar conta, cadastrar animal e solicitar entrada com tipo e sintomas.
- **Restricao:** tutor nao define emergencia, prioridade ou veterinario; segunda entrada ativa e rejeitada.
- **Interface:** contrato e backend implementados, sem tela dedicada nesta versao.

## Decisoes e limites

- F1 usa p50/p90; `MOCKED` somente em modo configuravel e identificado.
- F2 usa 20 min de aviso, 60 min de retencao e 10 min de margem como configuracao `MOCKED` aprovada.
- F3 ordena por emergencia, `priority_level`, check-in e ID.
- Distancia e calculada por Haversine no navegador; nao ha servico externo de rotas.
- Atraso, falta e reinsercao automatica nao foram arbitrados e nao integram o comportamento atual.
- Hardware fisico e frontend dedicado do autoatendimento estao fora do escopo congelado.
- Publicacao Vercel + Neon e CT20 externo concluidos em 16/11.
