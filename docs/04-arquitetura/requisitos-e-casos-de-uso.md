# Requisitos e casos de uso

> **Consolidado em:** 2026-11-15. Os requisitos obrigatorios F1-F3 derivam do enunciado; regras operacionais pendentes nao sao apresentadas como aprovadas.

## Requisitos funcionais

| ID | Requisito | Evidencia atual | Estado |
|---|---|---|---|
| RF01 | Autenticar usuarios internos por perfil | JWT e perfis no backend | Implementado no backend |
| RF02 | Cadastrar tutor e animal | Endpoints e modelos | Implementado no backend |
| RF03 | Criar, alterar e listar agendamentos | API de appointments | Implementado no backend |
| RF04 | Fazer check-in e registrar encaixe | API de check-in/walk-in | Implementado no backend |
| RF05 | Consultar e operar a fila | API de queue | Implementado no backend |
| RF06 | Calcular previsao por tipo com p50/p90 | Servico de estimacao | Implementado no backend |
| RF07 | Versionar previsoes e medir erro real | WaitEstimate e metricas | Implementado no backend |
| RF08 | Solicitar consentimento pontual de localizacao | API publica F2 | Implementado no backend |
| RF09 | Decidir aviso pelo deslocamento e oferecer fallback | API de return-decision | Implementado no backend; parametros a aprovar |
| RF10 | Registrar aviso, confirmacao e falha | API de notifications | Implementado com simulador |
| RF11 | Segregar por especie e tipo/motivo | Campos e filtros da fila | Implementado no backend |
| RF12 | Aplicar prioridade e emergencia autorizada | Regra de ordenacao e perfis | Implementado; escala final a aprovar |
| RF13 | Impedir dupla alocacao de recurso exclusivo | ResourceAllocation | Implementado no backend |
| RF14 | Disponibilizar telas do tutor e equipe | Frontend | Pendente de integracao |
| RF15 | Publicar versao acessivel externamente | Deploy | Pendente |

## Requisitos nao funcionais

| ID | Requisito | Criterio |
|---|---|---|
| RNF01 | Privacidade | Backend nao recebe latitude/longitude; consentimento e retencao curta |
| RNF02 | Seguranca | JWT interno, token publico aleatorio e segredo fora do Git |
| RNF03 | Rastreabilidade | Auditoria, revisoes F1, Git, ADRs, atas e Registro de IA |
| RNF04 | Portabilidade | Execucao local e por Docker; PostgreSQL em producao |
| RNF05 | Usabilidade | Fluxos minimos compreensiveis sem conhecimento tecnico |
| RNF06 | Disponibilidade de demo | URL externa ou contingencia formal documentada |
| RNF07 | Qualidade | Testes automatizados, manuais, bordas e bancada cruzada |
| RNF08 | Integridade academica | Dado mockado identificado; nenhuma evidencia inventada |

## Casos de uso principais

### UC01 - Registrar chegada

- **Ator:** recepcao.
- **Pre-condicao:** tutor e animal cadastrados ou dados minimos disponiveis.
- **Fluxo:** localizar/criar atendimento, fazer check-in ou encaixe, informar tipo/especie e receber token publico.
- **Resultado:** entrada `WAITING`; previsao criada somente se houver amostras aceitas suficientes.

### UC02 - Acompanhar espera

- **Ator:** tutor.
- **Pre-condicao:** token publico valido.
- **Fluxo:** abrir status, consultar posicao contextualizada e faixa de espera.
- **Excecao:** sem amostras suficientes, informar indisponibilidade em vez de inventar estimativa.

### UC03 - Informar deslocamento

- **Ator:** tutor.
- **Fluxo:** ler finalidade, aceitar ou negar consentimento; se aceitar, o cliente envia somente `travel_minutes`.
- **Resultado:** sistema calcula momento de aviso; negacao usa antecedencia fixa quando configurada.

### UC04 - Chamar e confirmar retorno

- **Atores:** recepcao e tutor.
- **Fluxo:** avaliar aviso, registrar evento simulado, tutor confirma retorno; falha abre acao para recepcao.
- **Resultado:** estado passa a `RETURNING` ou fica com tratamento manual registrado.

### UC05 - Priorizar emergencia

- **Ator:** veterinario/admin.
- **Fluxo:** declarar emergencia ou prioridade; backend reordena e revisa previsoes.
- **Restricao:** recepcao comum e sistema nao classificam emergencia.

### UC06 - Alocar recurso exclusivo

- **Ator:** equipe interna.
- **Fluxo:** selecionar sala/equipamento/profissional e iniciar alocacao.
- **Excecao:** recurso ocupado nao pode ser alocado simultaneamente.

### UC07 - Encerrar atendimento

- **Ator:** equipe interna.
- **Fluxo:** iniciar e finalizar atendimento.
- **Resultado:** espera real e erros sao gravados; duracao vira amostra `SYSTEM`.

## Decisoes pendentes

- tolerancia de atraso, falta e reinsercao;
- precedencia detalhada entre agendado e encaixe;
- niveis de prioridade alem da emergencia;
- parametros F2 de demo: 20 min sem GPS, 60 min de retencao e 10 min de margem;
- hospedagem e servico de rotas do frontend.
