# Etapas do Projeto — Fila Virtual para Clínicas Veterinárias

**Empresa 01** · 9 integrantes · 3 grupos
**Cliente:** tutor (professor) · **Entrega final:** demonstração conjunta com a Empresa 02 no mesmo cenário de teste

---

## Regras fixas (valem para todas as etapas)

1. O sistema gerencia a fila e avisa o tutor quando é a vez do pet.
2. A decisão clínica (gravidade) é do veterinário — o sistema **não** diagnostica.
3. Dados dos tutores seguem a **LGPD**.
4. Demonstração final no mesmo cenário de teste das duas empresas.

---

## Papéis individuais

- **Gerente de Projeto (GP)** — conduz as reuniões de segunda, cuida de cronograma, destrava bloqueios.
- **Arquiteto** — decide stack, escreve ADRs, revisa integração entre grupos.

## Sugestão de divisão dos 3 grupos

- **Grupo 1 — Backend:** API, regras da fila, prioridade, notificações, banco.
- **Grupo 2 — Frontend:** telas do tutor, da recepção e (se v1 incluir) do veterinário/gestor.
- **Grupo 3 — Qualidade & Projeto:** documentação, testes, atas, riscos, deploy.

> A divisão não é rígida: quem terminar sua parte ajuda o grupo mais atolado.

---

## 1. Iniciação

**O que o grupo entrega:**
- `docs/01-iniciacao/termo-de-abertura.md` — nome do projeto, objetivo, prazo, patrocinador, equipe
- `docs/01-iniciacao/stakeholders.md` — mapa de stakeholders + **matriz poder × interesse**
- `docs/01-iniciacao/premissas-e-restricoes.md` — o que assumimos e o que nos limita

**Responsável principal:** Grupo 3 + GP
**Saída:** todo mundo sabendo quem é o cliente, quem influencia e quais são as regras do jogo.

---

## 2. Escopo

**O que o grupo entrega:**
- `docs/02-planejamento/escopo.md` contendo:
  - Contexto e problema
  - Objetivos e justificativa
  - Usuários do sistema
  - **Dentro do escopo** / **Fora do escopo**
  - Requisitos iniciais
  - Critérios de aceite
  - Marcos
  - Pendências em aberto

**Responsável principal:** Grupo 3 + Arquiteto
**Saída:** documento que a outra empresa também entende sem precisar perguntar.

---

## 3. Planejamento

**O que o grupo entrega:**
- EAP (Estrutura Analítica do Projeto)
- Cronograma com os marcos das reuniões de segunda
- Plano de comunicação (canais, cadência, formato das atas)

**Responsável principal:** GP + Grupo 3

---

## 4. Custos e Riscos

**O que o grupo entrega:**
- Estimativa de custos: `horas × valor-hora simulado` + infraestrutura + envio de mensagens
- Planilha comparando **estimado × realizado**, atualizada por sprint
- Plano de riscos (risco, probabilidade, impacto, resposta: *evitar / mitigar / transferir / aceitar*, acompanhamento)

**Responsável principal:** GP + 1 representante de cada grupo

---

## 5. Análise e Arquitetura

**O que o grupo entrega:**
- Requisitos funcionais e não funcionais
- Casos de uso principais
- Modelo de dados (diagrama ER)
- ADRs em `docs/adr/0001-*.md`, `0002-*.md`...
- Protótipo das telas (Figma, Excalidraw, ou wireframe simples)

**Responsável principal:** Arquiteto + 1 pessoa de cada grupo
**Saída:** base técnica para os três grupos começarem a codar sem se atropelar.

---

## 6. Implementação

### 6.1 Backend — Grupo 1
- API (REST ou GraphQL)
- Autenticação (recepção, veterinário)
- Lógica da fila: ordem de chegada + prioridade
- Mecanismo de notificação (canal definido na etapa 2)
- Persistência (banco de dados)
- Logs e trilha de auditoria (LGPD)

### 6.2 Frontend — Grupo 2
- Fluxo do **tutor**: entrar na fila, ver posição, receber aviso
- Fluxo da **recepção**: ver fila, chamar próximo, marcar presença
- Fluxo do **veterinário** (se v1 incluir): iniciar / finalizar atendimento
- (Opcional) Painel de senhas para a sala de espera

### 6.3 Integração — Grupo 3 + Arquiteto
- Build conjunto (front consumindo back real)
- Ambiente de homologação acessível aos três grupos
- Relatórios de sprint em `docs/05-implementacao/sprints/`
- Atas das reuniões em `docs/reunioes/`

---

## 7. Testes e Homologação

**O que o grupo entrega:**
- `docs/06-testes/plano-de-testes.md`
- Testes **unitários** (backend e frontend)
- Testes de **integração** (fluxo de ponta a ponta)
- Homologação formal pelo tutor com check-list assinado

**Responsável principal:** Grupo 3 (QA), com apoio dos autores do código

---

## 8. Go-live e Encerramento

**O que o grupo entrega:**
- Deploy em ambiente demonstrável (cloud grátis ou local acessível por rede)
- `docs/07-encerramento/manual-do-usuario.md` (curto, com prints)
- Apresentação final: slides + roteiro da demo
- `docs/07-encerramento/licoes-aprendidas.md`

**Responsável principal:** todos; GP coordena a apresentação.

---

## Pendências em aberto (decidir antes de avançar)

- [ ] Perfis que o sistema atende na v1 (só tutor + recepção? inclui veterinário? gestor?)
- [ ] Canal de notificação obrigatório na demo (painel na recepção? WhatsApp? SMS? e-mail? push?)
- [ ] Onde o tutor pode esperar (só na clínica? em qualquer lugar? híbrido com confirmação?)
- [ ] Stack técnico (linguagem/framework do backend, framework do frontend, banco)
- [ ] Hospedagem (local, cloud grátis, cloud pago simulado?)
- [ ] Data da apresentação final
- [ ] Nomes dos 9 integrantes e quem assume cada papel (GP, Arquiteto, Grupo 1/2/3)

---

## Ordem recomendada de execução

1. Fechar as pendências acima na próxima reunião de segunda.
2. Grupo 3 entrega **Iniciação** e **Escopo** (etapas 1 e 2).
3. GP entrega **Planejamento, Custos e Riscos** (etapas 3 e 4) com apoio dos grupos.
4. Arquiteto + 1 por grupo entrega **Análise e Arquitetura** (etapa 5).
5. Grupos 1 e 2 **implementam em paralelo** (etapa 6), Grupo 3 integra e documenta.
6. Grupo 3 lidera **Testes e Homologação** (etapa 7).
7. Todos preparam **Go-live e Apresentação** (etapa 8).
