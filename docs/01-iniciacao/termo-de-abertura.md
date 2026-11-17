# Termo de abertura

> **Status:** aprovado pelo GP em 2026-11-16. Equipe, escopo e responsabilidades estão consolidados. A entrega técnica utiliza cenário, dados, C1 e bancada cruzada `MOCKED`, identificados como simulação. O CT19 local foi aprovado com ressalvas; publicação externa e CT20 foram concluídos no fechamento.

## 1. Nome da empresa e do projeto

- **Empresa:** Empresa 01
- **Projeto:** Agenda + Fila Virtual para Clínica Veterinária
- **Cenário de demonstração:** Clínica Vila Nova EC, Engenheiro Coelho/SP — entidade fictícia aprovada pelo GP para dados, telas, testes e demonstração `MOCKED`.

## 2. Justificativa

Clínicas veterinárias com consultas agendadas e demanda espontânea precisam coordenar prioridades, espécies, riscos e recursos compartilhados. A espera prolongada na recepção aumenta o estresse dos animais e oferece pouca previsibilidade ao tutor. O projeto propõe uma agenda integrada a uma fila virtual, com estimativa de espera, acionamento conforme deslocamento e segregação operacional dos atendimentos.

## 3. Objetivo e critérios de sucesso mensuráveis

Construir e publicar uma versão demonstrável que permita à recepção administrar a fila e ao tutor acompanhar seu atendimento.

Critérios de sucesso:

1. F1 calcula uma faixa de espera por tipo de atendimento, preserva revisões e compara previsto com realizado.
2. F2 considera o tempo de deslocamento para decidir o aviso, registra consentimento e mantém alternativa sem GPS.
3. F3 utiliza ao menos dois eixos de segregação, aplica prioridade declarada e impede dupla alocação de recurso exclusivo.
4. O fluxo mínimo funciona do frontend ao banco em ambiente acessível para demonstração.
5. Testes próprios e roteiro comum do professor possuem resultado e evidência registrados.
6. O esquema de hardware contém componentes, comunicação, alimentação e consumo.
7. A documentação, o Registro de IA e o histórico do repositório permanecem rastreáveis.
8. O C1-MOCKED verifica tecnicamente a solução com massa controlada e identificada; não representa coleta de campo real nem deve ser apresentado como evidência externa.

## 4. Escopo

**Incluído:**

- agenda simples, cadastro de tutor e animal, agendamento, check-in e encaixe;
- fila com prioridade, emergência definida por profissional autorizado e recursos compartilhados;
- F1 com p50/p90 por tipo, revisões, espera real e métricas de erro;
- F2 com consentimento, captura pontual, tempo de deslocamento e alternativa sem GPS;
- F3 com espécie, motivo/tipo, risco e alocação exclusiva de recursos;
- telas mínimas de tutor, recepção e indicadores;
- testes, publicação, manual, documentação de gestão, arquitetura e protótipo documental de hardware;
- dados mockados identificados para desenvolvimento e demonstração.
- simulação documental de extensão e bancada cruzada com organizações fictícias, sempre identificada como `MOCKED`.

**Excluído:**

- prontuário clínico, diagnóstico ou triagem automática;
- pagamentos, estoque, internação e gestão financeira;
- múltiplas clínicas e agenda recorrente;
- aplicativo móvel nativo;
- rastreamento contínuo do tutor;
- integração obrigatória com provedor real de WhatsApp ou SMS;
- painel gerencial completo.

## 5. Principais entregas e datas

| Data | Entrega ou marco |
|---|---|
| 16/11/2026 | Congelamento técnico com código integrado, documentação, manual, dados e cenários `MOCKED`; CT19 local aprovado com ressalvas; publicação e CT20 concluídos |
| 23/11/2026 | Relatório da bancada cruzada simulada com Empresa 02 fictícia; substituir por evidência real somente se o professor autorizar nova etapa |
| 30/11/2026 | Apresentação final, demonstração e relatório da simulação extensionista `MOCKED` |
| 03/12/2026 | Versão final corrigida, documentação e lições aprendidas |

Os marcos anteriores permanecem registrados no cronograma. Artefatos produzidos após a data planejada devem declarar a data real, sem retroatividade.

## 6. Equipe

- **Gerente de Projeto:** Alisson
- **Arquiteto:** Nathan
- **Grupo 1 — Backend:** Lucas Kather, Pedro Valença, Rafael Lindquist e Rafael Nicolas
- **Grupo 2 — Frontend:** Alisson, Leo e Luísa
- **Grupo 3 — Qualidade e Projeto:** Kauã e Nathan

GP e arquiteto acumulam participação nas frentes. A equipe possui nove integrantes.

## 7. Stakeholders e seus interesses

- **Professor/cliente:** homologação contra o roteiro, entregáveis e sustentação técnica.
- **Equipe Empresa 01:** execução, integração, documentação e defesa das decisões.
- **Tutores:** previsão compreensível, privacidade e aviso no momento adequado.
- **Recepção:** visão da fila, tratamento de falhas e operação simples.
- **Médico-veterinário:** responsabilidade clínica sobre emergência e apoio à alocação; veterinário/admin registram a decisão no sistema.
- **Clínica Vila Nova EC (MOCKED):** cenário fictício oficial da entrega técnica, sem alegação de parceria ou coleta real.
- **Empresa 02 (MOCKED):** organização fictícia usada para simular a bancada cruzada da versão congelada.
- **Coordenação/UNASP:** integridade acadêmica, extensão e aderência ao cronograma.

Os cenários Vila Nova EC e Empresa 02 são simulações documentais. Se o professor autorizar atividade real posterior, os documentos e evidências correspondentes serão substituídos com a data verdadeira da nova execução.

## 8. Premissas assumidas

- desenvolvimento com ferramentas gratuitas ou já disponíveis à equipe;
- acesso à internet e computadores pessoais;
- frontend consumindo contrato REST do backend;
- uso de dados mockados identificados, aprovado pelo GP para desenvolvimento, testes e demonstração;
- parâmetros F2 de demonstração aprovados como `MOCKED`: aviso fixo de 20 minutos, retenção de 60 minutos e margem de segurança de 10 minutos;
- participação dos integrantes na revisão e capacidade de explicar os artefatos;
- decisões clínicas permanecem sob responsabilidade do veterinário.

## 9. Restrições

- prazo final acadêmico em 03/12/2026 e apresentação em 30/11/2026;
- equipe de nove integrantes e trabalho dividido em três frentes;
- orçamento operacional próximo de zero e preferência por hospedagem gratuita;
- proteção de dados e minimização da geolocalização;
- a entrega de 16/11 utiliza cenário fictício e não declara parceria, entrevista ou coleta de campo real;
- frontend integrado e backend com 55 testes aprovados; CT19 local aprovado com ressalvas; publicação externa e CT20 concluídos no fechamento;
- hardware limitado ao protótipo documental, sem construção física prevista no escopo aprovado;
- ADRs e atas não podem ser retrodatados.

## 10. Riscos iniciais conhecidos

- a avaliação acadêmica exigir evidência de campo real além do C1-MOCKED aprovado pelo GP;
- o teste ponta a ponta identificar incompatibilidade entre frontend, API e banco;
- a publicação Vercel + Neon ou o smoke test externo falhar durante o fechamento;
- parâmetros F2 `MOCKED` serem interpretados incorretamente como parâmetros clínicos reais;
- o protótipo documental de hardware ser interpretado incorretamente como protótipo físico;
- concentração do trabalho do G3 em poucos integrantes;
- integrantes não conseguirem sustentar o trabalho na arguição.

## 11. Assinatura

- **Gerente de Projeto:** Alisson — termo aprovado em 2026-11-16
- **Arquiteto:** Nathan — função e responsabilidade técnica formalizadas pelo GP em 2026-11-16
- **Data da aprovação formal:** 2026-11-16
