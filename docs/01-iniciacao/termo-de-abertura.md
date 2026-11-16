# Termo de abertura

> **Status:** rascunho consolidado em 2026-11-15, revisado pelo G3 em 2026-11-16. Equipe e escopo-base confirmados; parceiro comunitário real, evidências do C1 e assinatura formal permanecem a validar.

## 1. Nome da empresa e do projeto

- **Empresa:** Empresa 01
- **Projeto:** Agenda + Fila Virtual para Clínica Veterinária
- **Cenário de demonstração:** Clínica Vila Nova EC, Engenheiro Coelho/SP — entidade fictícia, usada somente em dados e telas de teste.

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
8. O C1 somente será considerado validado quando houver evidência de clínica real aceita pelo professor; a base mockada atual valida apenas desenvolvimento e testes.

## 4. Escopo

**Incluído:**

- agenda simples, cadastro de tutor e animal, agendamento, check-in e encaixe;
- fila com prioridade, emergência definida por profissional autorizado e recursos compartilhados;
- F1 com p50/p90 por tipo, revisões, espera real e métricas de erro;
- F2 com consentimento, captura pontual, tempo de deslocamento e alternativa sem GPS;
- F3 com espécie, motivo/tipo, risco e alocação exclusiva de recursos;
- telas mínimas de tutor, recepção e indicadores;
- testes, publicação, manual, documentação de gestão, arquitetura e hardware;
- dados mockados identificados para desenvolvimento e demonstração.

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
| 16/11/2026 | Congelamento previsto: sistema publicado, manual, riscos e acessos para teste externo |
| 23/11/2026 | Relatório de bancada cruzada e respostas iniciais |
| 30/11/2026 | Apresentação final, demonstração e relatório de extensão |
| 03/12/2026 | Versão final corrigida, documentação e lições aprendidas |

Os marcos anteriores permanecem registrados no cronograma. Artefatos produzidos após a data planejada devem declarar a data real, sem retroatividade.

## 6. Equipe

- **Grupo 1 — Backend:** Lucas Kather, Pedro Valença, Rafael Lindquist e Rafael Nicolas
- **Grupo 2 — Frontend:** Alisson, Leo e Luísa
- **Grupo 3 — Qualidade e Projeto:** Kauã e Nathan

A equipe possui nove integrantes e não designa gerente de projeto nem arquiteto (ADR-000). Decisões entre frentes são tomadas em conjunto e registradas em ADR ou ata.

## 7. Stakeholders e seus interesses

- **Professor/cliente:** homologação contra o roteiro, entregáveis e sustentação técnica.
- **Equipe Empresa 01:** execução, integração, documentação e defesa das decisões.
- **Tutores:** previsão compreensível, privacidade e aviso no momento adequado.
- **Recepção:** visão da fila, tratamento de falhas e operação simples.
- **Médico-veterinário:** autoridade exclusiva sobre emergência e apoio à alocação clínica.
- **Clínica parceira real:** stakeholder ainda não confirmado no repositório.
- **Empresa 02:** acesso à versão congelada para bancada cruzada.
- **Coordenação/UNASP:** integridade acadêmica, extensão e aderência ao cronograma.

O cenário fictício Vila Nova EC não é tratado como parceiro real.

## 8. Premissas assumidas

- desenvolvimento com ferramentas gratuitas ou já disponíveis à equipe;
- acesso à internet e computadores pessoais;
- frontend consumindo contrato REST do backend;
- uso de dados mockados identificados enquanto a evidência de campo estiver pendente;
- participação dos integrantes na revisão e capacidade de explicar os artefatos;
- decisões clínicas permanecem sob responsabilidade do veterinário.

## 9. Restrições

- prazo final acadêmico em 03/12/2026 e apresentação em 30/11/2026;
- equipe de nove integrantes e trabalho dividido em três frentes;
- orçamento operacional próximo de zero e preferência por hospedagem gratuita;
- proteção de dados e minimização da geolocalização;
- ausência atual de parceiro e coleta real verificável para o C1;
- frontend ainda não integrado e testes do backend ainda não executados no ambiente atual;
- ADRs e atas não podem ser retrodatados.

## 10. Riscos iniciais conhecidos

- C1 não ser validado por falta de evidência de campo real;
- frontend não integrar as três features antes da demonstração;
- testes não serem executados ou corrigidos a tempo;
- sistema não ser publicado para acesso externo;
- parâmetros de F2 e regras finais de F3 permanecerem sem aprovação;
- hardware e manual não serem concluídos;
- concentração do trabalho do G3 em poucos integrantes;
- integrantes não conseguirem sustentar o trabalho na arguição.

## 11. Assinatura

- **Aprovação:** um representante de cada frente (G1, G2 e G3) — confirmação documental pendente
- **Data da aprovação formal:** a registrar na data real da deliberação
