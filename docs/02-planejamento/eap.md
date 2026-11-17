# Estrutura Analitica do Projeto - EAP

> **Marco planejado:** 2026-10-19. **Elaboracao e aprovacao da linha de base:** 2026-11-16. As marcacoes representam o estado documental e tecnico verificado no fechamento.

## 1. Gestao e processo

- [x] 1.1 Termo de abertura
- [x] 1.2 Stakeholders, premissas e restricoes
- [x] 1.3 Escopo e EAP
- [x] 1.4 Cronograma consolidado
- [x] 1.5 Comunicacao, custos e riscos
- [x] 1.6 Aprovacao formal da linha de base pelo GP
- [x] 1.7 Decisoes e revisoes registradas nas datas reais
- [x] 1.8 Registro de IA mantido no repositorio

## 2. Campo e calibracao `MOCKED`

- [x] 2.1 Protocolo de coleta documentado
- [x] 2.2 Base de 40 dados mockados para desenvolvimento
- [x] 2.3 Quatro janelas mockadas documentadas
- [x] 2.4 Relatorio de validacao tecnica da massa mockada
- [x] 2.5 C1-MOCKED aprovado pelo GP para verificacao tecnica
- [x] 2.6 Entrevista substituida por cenario simulado e identificado
- [x] 2.7 Relatorio de calibracao F1 com fonte `MOCKED` declarada

## 3. Arquitetura

- [x] 3.1 Contrato tecnico do backend
- [x] 3.2 Modelo de dados
- [x] 3.3 Documentacao tecnica de F1 e F2
- [x] 3.4 Requisitos e casos de uso consolidados
- [x] 3.5 Contrato de interface e rastreabilidade
- [x] 3.6 Arquitetura geral e plano de implantacao
- [x] 3.7 ADRs registrados nas datas reais
- [x] 3.8 Parametros F2 20/60/10 `MOCKED` e regra F3 aprovados

## 4. Software

- [x] 4.1 Backend de agenda, fila e autenticacao
- [x] 4.2 Backend F1
- [x] 4.3 Backend F2 com simulador
- [x] 4.4 Backend F3
- [x] 4.5 Frontend do tutor e autoatendimento
- [x] 4.6 Frontend da recepcao e do veterinario
- [x] 4.7 Integracao frontend-API na `development`
- [x] 4.8 Teste ponta a ponta local das tres features - **aprovado com ressalvas no CT19**

## 5. Hardware

- [x] 5.1 Painel de chamada definido como prototipo documental
- [x] 5.2 Diagrama de blocos e interface com API
- [x] 5.3 Lista e justificativa de componentes
- [x] 5.4 Calculo de alimentacao, consumo e protecao
- [x] 5.5 ADR do hardware
- [x] 5.6 Construcao fisica classificada como fora do escopo da versao

## 6. Qualidade

- [x] 6.1 Testes automatizados escritos no backend
- [x] 6.2 Plano de testes consolidado
- [x] 6.3 Suite backend executada com 49 testes aprovados
- [x] 6.4 Casos manuais F1/F2/F3 e bordas documentados
- [x] 6.5 Evidencias locais, resultados e 12 capturas do manual
- [x] 6.6 Bancada cruzada simulada com Empresa 02 ficticia `MOCKED`
- [x] 6.7 Respostas aos defeitos registradas

## 7. Publicacao e operacao

- [x] 7.1 Execucao local documentada
- [x] 7.2 Docker Compose local do backend
- [x] 7.3 Plataforma escolhida no ADR-003: Vercel + Neon
- [ ] 7.4 Banco e variaveis de producao - **em execucao**
- [ ] 7.5 API e frontend publicados - **em execucao**
- [ ] 7.6 Migrations, CORS, limpeza F2 e smoke test externo - **em execucao**
- [x] 7.7 Bancada da Empresa 02 representada por simulacao `MOCKED`, sem alegacao de entrega externa real

## 8. Encerramento e defesa

- [x] 8.1 Manual do usuario com capturas
- [x] 8.2 Roteiro da demonstracao
- [x] 8.3 Estrutura da apresentacao final
- [x] 8.4 Relatorio de extensao como simulacao documental `MOCKED`, congelada em 16/11
- [x] 8.5 Licoes aprendidas
- [x] 8.6 Matriz de rastreabilidade e pacote documental

## Pacotes criticos do G3

O G3 responde pelos pacotes 1, 2, 5, 6, 7 e 8 e pela consolidacao documental do pacote 3. G1 e G2 mantem backend e frontend; o GP aprova a linha de base e o arquiteto revisa o conteudo tecnico. O CT19 local foi aprovado com ressalvas. Publicacao e CT20 permanecem como atividades de fechamento em execucao, sem serem apresentados como concluidos antes da evidencia.
