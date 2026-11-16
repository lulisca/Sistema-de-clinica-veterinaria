# Referência — planejamento detalhado do G3

> Cópia preservada de `Downloads/ETAPAS.md`, preparada anteriormente pelo GP. Este arquivo é fonte de trabalho e não substitui o `ETAPAS.md` da raiz. As afirmações de conclusão precisam ser confirmadas por evidência antes de serem transferidas para os entregáveis oficiais.

---

# Etapas do projeto — Agenda + Fila Virtual

**Empresa:** 01 · **Equipe:** 9 integrantes · **Organização:** 3 grupos
**Cliente do projeto:** professor · **Parceiro de campo:** clínica veterinária
**Proposta escolhida em 19/10/2026:** agenda simples integrada à fila de atendimento
**Situação:** planejamento. A existência deste documento não comprova coleta, implementação ou aprovação.

## Sumário

1. [Objetivo e escopo](#escopo)
2. [Requisitos e critérios de aceite](#requisitos)
3. [Equipe e autonomia dos grupos](#equipe)
4. [Entregáveis por categoria](#entregaveis)
5. [Sequência de execução e calendário](#calendario)
6. [Avaliação do professor](#avaliacao)
7. [Decisões pendentes e próxima reunião](#pendencias)
8. [Fontes e preservação do original](#fontes)

<a id=escopo></a>
## 1. Objetivo e escopo

### 1.1 Problema e objetivo

Clínicas que combinam consultas agendadas e demanda espontânea precisam administrar atrasos, prioridades, salas e profissionais compartilhados. A espera sem previsão também dificulta que o tutor aguarde fora da recepção com o animal.

O projeto organiza essa operação e permite ao tutor acompanhar a previsão de espera e receber o aviso de retorno. O sucesso será verificado pelos critérios da seção 2, com dados reais e demonstração sobre o roteiro comum às duas empresas.

### 1.2 Usuários e limites do produto

| Usuário | Operações da v1 |
|---|---|
| Recepção | Operar agenda, registrar chegada e encaixes, acompanhar filas e recursos, chamar e confirmar presença. |
| Médico-veterinário | Registrar classificação clínica de emergência e operar o fluxo mínimo de início/fim do atendimento. |
| Tutor do animal | Acessar seu atendimento, consultar posição contextualizada na fila e previsão, informar localização com consentimento, receber aviso e confirmar retorno. |

**Dentro do escopo:** agenda simples; cancelamento e remarcação; check-in; encaixes, atrasos e faltas; filas e prioridades; alocação de salas e profissionais; previsão com incerteza e medição do erro; chamada por deslocamento; alternativa sem localização; histórico de atendimento.

**Fora do escopo:** prontuário, diagnóstico automático, pagamentos, estoque, internação, múltiplas clínicas, agenda recorrente, aplicativo nativo, rastreamento contínuo e painel gerencial completo.

O tutor pode aguardar fora da clínica. O sistema não diagnostica nem classifica gravidade por conta própria; decisões clínicas cabem ao veterinário. O tratamento de dados deve observar a LGPD.

O escopo acadêmico também inclui gestão, campo, arquitetura, hardware, qualidade, extensão e processo, detalhados na seção 4.

<a id=requisitos></a>
## 2. Requisitos e critérios de aceite

**Origem dos requisitos:** F1, F2 e F3 são obrigatórios no Caderno do Aluno. Agenda e regras complementares são o escopo escolhido pela empresa. Os critérios de aceite abaixo tornam a proposta verificável; não acrescentam pesos à nota oficial.

Os IDs R01–R13 foram mantidos para rastreabilidade. R13 está na seção de hardware, onde ficam os detalhes dessa entrega.

### 2.1 F1 — Tempo de espera, margem e erro real

Reúne os dois pontos do ETAPAS original: **“tempo médio de espera”** e **“taxa de erro para mais e para menos”**.

| ID | Requisito | Critério de aceite |
|---|---|---|
| R06 | Calcular previsão por tipo de atendimento, calibrada com dados de campo, e mostrar faixa de incerteza. | Exibir previsão e faixa; justificar método, recalcular após eventos relevantes e demonstrar comportamento quando faltarem amostras. Uma média global de tipos diferentes não atende. |
| R07 | Registrar previsto e realizado para medir o erro. | Preservar a previsão no check-in e suas revisões com horário; comparar com a espera até o início do atendimento e apresentar os indicadores definidos abaixo. |

**Margem não é erro observado:** a margem acompanha a previsão; o erro é calculado quando a espera real é conhecida. “25 ± 5 min” é um exemplo de apresentação, não fórmula obrigatória nem garantia de erro máximo. O professor prefere intervalos por percentis; a escolha precisa ser justificada.

**Métricas propostas pela empresa:** erro assinado = espera real − previsão inicial; erro absoluto médio; proporção dos atendimentos dentro da faixa prevista. A espera termina no início do atendimento. O horário final permite medir a duração e alimentar futuras estimativas. Método estatístico e janela de atualização continuam pendentes.

### 2.2 F2 — Geolocalização e chamada

Corresponde ao ponto **“geolocalização”** do original. A distância ou o tempo de deslocamento determina quando avisar o tutor.

| ID | Requisito | Critério de aceite |
|---|---|---|
| R08 | Considerar deslocamento e antecedência na chamada. | Para esperas equivalentes, avisar antes quem precisa de mais tempo para retornar; indicar se o retorno é estimado como viável e documentar o tratamento de retorno inviável. |
| R09 | Solicitar localização em momentos-chave, com consentimento, minimização e retenção curta; operar sem GPS. | Explicar a finalidade; recusar permissão e concluir o fluxo com antecedência fixa. Registrar em ADR granularidade, retenção e trade-offs de precisão, privacidade, bateria e complexidade. |
| R10 | Registrar e acompanhar os avisos. | Mostrar envio, falha e confirmação de retorno; evitar duplicidade e prever ação da recepção quando a comunicação falhar. |

O indicador “dá tempo de chegar / não dá tempo” é uma estimativa de deslocamento. Ele complementa a decisão de quando avisar. Canal de notificação, margem de retorno e antecedência sem GPS ainda serão definidos.

### 2.3 F3 — Hierarquia de prioridade, segregação e recursos

Preserva a **“hierarquia de prioridade”** do original e incorpora a segregação exigida pelo professor.

| ID | Requisito | Critério de aceite |
|---|---|---|
| R04 | Separar por espécie e motivo, tratar isolamento e aplicar prioridade e desempate. | Demonstrar os dois eixos de separação e a precedência de emergência classificada pelo veterinário. Validar os demais níveis com a clínica. O sistema não interrompe automaticamente atendimento em andamento. |
| R05 | Administrar recursos compartilhados. | Impedir uso simultâneo incompatível do mesmo profissional ou sala; testar duas filas disputando um veterinário e uma sala de isolamento ocupada. |

A precedência entre agendados e encaixes, os demais níveis de prioridade e o desempate ainda precisam ser acordados com a clínica.

### 2.4 Agenda e operação — escopo da empresa

| ID | Requisito | Critério de aceite |
|---|---|---|
| R01 | Criar, consultar, cancelar e remarcar agendamento. | Impedir reservas incompatíveis do mesmo profissional. |
| R02 | Registrar check-in e encaixe. | Agendado entra na fila de presentes após check-in; encaixe entra sem agendamento; impedir entrada duplicada. |
| R03 | Tratar atraso e falta. | Aplicar tolerância e regra de reinserção documentadas, sem manter ausente bloqueando recurso. |
| R11 | Registrar início/fim e consultar histórico. | Liberar recursos ao encerrar e permitir consultar o histórico e os indicadores de espera. |

### 2.5 Requisitos não funcionais

| Tema | Verificação esperada |
|---|---|
| Acesso e publicação — R12 | Tutor consulta somente seu atendimento; recepção/veterinário usam autenticação e permissões; usuário externo executa o roteiro com dados de teste. |
| Rastreabilidade | Persistir eventos necessários, logs e trilha de auditoria, com acesso e retenção definidos. |
| Usabilidade | Fluxos compreensíveis para os três perfis e uso da página do tutor no celular. |
| Confiabilidade | Tratar indisponibilidade e falhas de comunicação, com mensagens claras e recuperação documentada. |
| Desempenho e disponibilidade | Definir metas quantitativas testáveis antes da homologação. Ainda não existem limites aprovados. |

<a id=equipe></a>
## 3. Equipe e autonomia dos grupos

### 3.1 Frentes e papéis

| Responsável | Foco | Como avança sem esperar outra frente |
|---|---|---|
| G1 — Backend e dados | API, persistência e regras do produto. | Usa cliente de API, testes próprios, dados mockados identificados e simulador de notificações; não depende das telas. |
| G2 — Frontend e experiência | Protótipos e interfaces dos três perfis. | Mantém API simulada conforme contrato, com cenários de sucesso, erro, fila vazia, atraso, falta e indisponibilidade; depois conecta ao backend real. |
| G3 — Qualidade, campo e infraestrutura | Coleta, qualidade, ambiente, hardware e evidências de extensão. | Trabalha com entrevista, série de campo, documentos, casos de teste, aplicação mínima para verificar o ambiente e servidor simulado para projetar hardware. |
| Gerente de projeto — GP | Planejamento, comunicação, acompanhamento e remoção de bloqueios. | Organiza compromissos com contribuições das três frentes. |
| Arquiteto | Decisões técnicas, stack, contrato e integração. | Coordena alternativas e revisão dos ADRs com os autores; não espera uma implementação pronta para definir interfaces. |

GP e arquiteto são papéis entre os nove integrantes. A atribuição de cada entregável aparece somente na seção 4. Todos documentam e testam seu trabalho, participam da coleta em escala e estudam o sistema completo. Quem conclui sua parte apoia a frente com bloqueios.

### 3.2 Contrato compartilhado

Preparar a primeira versão logo após os requisitos e congelá-la no marco de arquitetura. Deve conter:

- Campos e exemplos de dados.
- Operações da API, estados de agendamento/fila/atendimento e eventos de aviso.
- Regras de prioridade e recursos, permissões e formatos de erro.
- Exemplos comuns para testes das três frentes.

O contrato pertence às três frentes. G2 e G3 podem construí-lo com o arquiteto mesmo se G1 atrasar. Mudanças precisam de versão, impacto registrado e concordância das frentes afetadas. Cada grupo mantém suas próprias simulações; G3 não é fornecedor obrigatório de simuladores para os demais.

### 3.3 Conclusão independente e integração

**Entrega da frente:** artefato próprio documentado, demonstrado conforme contrato e verificado com testes relevantes. Dependências simuladas são permitidas e identificadas.

**Entrega integrada:** componentes reais conectados, fluxo completo validado e acesso externo verificado quando aplicável. Só esse nível conclui o marco coletivo.

Dados mockados permitem desenvolver e testar; a calibração final exige dados reais. Testes preparados não equivalem a testes executados no produto. Ambiente preparado não equivale a sistema publicado. Manual precisa ser conferido na versão real, bancada depende do sistema da outra empresa e extensão depende da atividade efetivamente realizada.

Cada conclusão deve ter responsável nominal, evidência versionada, limitações registradas e outro integrante capaz de explicar o resultado. A autonomia não altera os critérios oficiais ou a nota da empresa.

### 3.4 Quando uma frente falhar ou atrasar

1. Registrar bloqueio, impacto, contrato afetado, responsável e prazo de correção.
2. Continuar o trabalho independente com simulação compatível; manter integração como pendente.
3. A frente fornecedora corrige o componente e verifica o contrato.
4. GP e arquiteto redistribuem apoio e, se necessário, reduzem escopo adicional, preservando obrigações e prazos.
5. Retestar a integração real antes de concluir o marco.

<a id=entregaveis></a>
## 4. Entregáveis por categoria

**Checklist oficial:** categorias da seção 12 do Caderno do Aluno, páginas 8–9. Os caminhos e detalhes organizacionais são da empresa. Caminho sugerido não significa arquivo já criado. Marcar conclusão somente com evidência.

### 4.1 Gestão

**Coordenação:** GP; G3 apoia organização; cada grupo fornece tarefas, estimativas e riscos.

- [ ] **Termo de abertura:** nome, justificativa, objetivo, critérios de sucesso, prazo, patrocinador, equipe e limites. Destino: `docs/01-iniciacao/termo-de-abertura.md`.
- [ ] **Mapa de stakeholders:** interessados e matriz poder × interesse. Destino: `docs/01-iniciacao/stakeholders.md`.
- [ ] **Premissas e restrições:** hipóteses e limites de prazo, equipe, orçamento e infraestrutura. Destino: `docs/01-iniciacao/premissas-e-restricoes.md`.
- [ ] **Escopo e EAP:** contexto, problema, objetivos, justificativa, usuários, inclusões/exclusões, requisitos, critérios de aceite, marcos, pendências e decomposição das entregas. Escopo em `docs/02-planejamento/escopo.md`; EAP no mesmo diretório. G1/G2 contribuem com produto; arquiteto revisa viabilidade.
- [ ] **Cronograma:** atividades internas, responsáveis, dependências e marcos da seção 5.
- [ ] **Plano de comunicação:** canais, cadência e formato das reuniões/atas.
- [ ] **Estimativa de custos:** horas × valor-hora simulado, infraestrutura e mensagens; planilha estimado × realizado atualizada por sprint, com um representante de cada grupo.
- [ ] **Plano de riscos:** probabilidade, impacto, responsável, ação e acompanhamento; resposta de evitar, mitigar, transferir ou aceitar.
- [ ] **Atas semanais:** status, bloqueios, decisões e compromissos, em `docs/reunioes/`, commitadas no mesmo dia.

**Rotina semanal:** GP organiza a reunião de segunda; quem expõe o status é sorteado no momento, nunca o gerente. Registrar responsável e prazo de cada compromisso. A saída esperada é uma equipe que compreenda objetivos, participantes, limites e trabalho planejado.

### 4.2 Análise e arquitetura

**Coordenação:** arquiteto com um representante de cada grupo.

- [ ] **Requisitos e casos de uso:** G1/G2 elaboram; G3 revisa testabilidade. Incluir requisitos funcionais e não funcionais da seção 2.
- [ ] **Modelo de dados:** G1 entrega diagrama ER; arquiteto revisa.
- [ ] **Documento de arquitetura:** arquiteto consolida componentes, integração, stack e contrato da seção 3.2, com os três grupos.
- [ ] **ADRs:** autores de cada decisão registram contexto, alternativas, escolha e consequências; arquiteto revisa. Arquivos em `docs/adr/`, com sequência como `0001-titulo.md`. Incluir ADR-000 da divisão/frentes; commit na data da decisão.
- [ ] **Esquema de hardware — R13:** G3 lidera; G1 apoia protocolo e G2 interface. Exigir diagrama de blocos/acoplamento, componentes disponíveis no laboratório ou com orçamento e prazo, protocolo justificado, cálculo de tensão/corrente/fonte/proteção e ADR.
- [ ] **Protótipo de telas:** G2 entrega e valida com os demais; pode usar Figma, Excalidraw ou wireframe simples.

**Hardware proposto:** painel físico de chamada; escolha ainda pendente. O esquema é obrigatório; implementação física é opcional nesta versão e a implementação plena está prevista para v2. A condição do bônus está na seção 6.

A saída esperada é uma base técnica suficiente para as três frentes implementarem de forma independente e compatível.

### 4.3 Campo

**Coordenação:** G3; participação de todos em escala.

- [ ] **Fichas de observação preenchidas:** responsáveis pelas visitas registram; G3 confere método e cobertura.
- [ ] **Série de atendimentos digitada:** G3 consolida e versiona; G1 verifica formato para utilização.
- [ ] **Entrevista registrada:** G3 organiza, com perguntas dos três grupos.
- [ ] **Relatório de calibração da F1:** G1 documenta método, dados e resultados; G3 verifica rastreabilidade.

**Protocolo:** obter autorização formal antes das visitas; realizar quatro janelas de uma hora em dias e horários distintos; registrar 40 atendimentos cobrindo ao menos quatro tipos. Medir chegada, início e fim, composição por espécie/motivo, atrasos e faltas; entrevistar o responsável sobre regras operacionais. Não identificar pessoas. Distinguir observação direta e complemento retrospectivo, se necessário. Não substituir evidência de campo por dados mockados.

### 4.4 Implementação

**Coordenação técnica:** arquiteto; desenvolvimento distribuído.

- [ ] **Código no repositório único:** G1 entrega backend, G2 frontend e G3 recursos de infraestrutura/verificação, cada um com autoria própria.
- [ ] **Integração entre as três frentes:** G1/G2 conectam aplicação; G3 integra ambiente e verificações. Entregar build conjunto, ambiente de homologação acessível aos três grupos e relatórios de sprint em `docs/05-implementacao/sprints/`.
- [ ] **Sistema publicado:** G3 prepara e publica; G1/G2 garantem funcionamento da aplicação. Hospedagem pode ser gratuita ou ambiente local acessível, desde que a outra empresa consiga usar externamente.

REST ou GraphQL permanece uma escolha de arquitetura. Persistência, autenticação, logs e fluxos de interface seguem a seção 2. Preservar a versão congelada para a bancada e identificar separadamente as correções finais.

### 4.5 Qualidade

**Coordenação:** G3; autores implementam testes e respondem pelos defeitos de suas áreas.

- [ ] **Plano de testes:** G3 consolida cenários de G1/G2 em `docs/06-testes/plano-de-testes.md`.
- [ ] **Testes automatizados:** G1 cobre regras/backend; G2 interface; G3 coordena integração. Incluir testes unitários e de ponta a ponta.
- [ ] **Relatório de bancada cruzada (produzido):** G3 consolida testes dos três grupos sobre o sistema da outra empresa.
- [ ] **Respostas aos defeitos (recebidos):** grupo da área analisa; G3 consolida aceites, contestações fundamentadas ou referências ao escopo.

**Bancada cruzada:** pelo menos 15 casos cobrindo F1/F2/F3 e três casos de borda, como entrada inválida, permissão negada e estado impossível. Registrar procedimento, esperado, obtido, evidência e severidade proposta. Corrigir defeitos acatados e retestar na versão final.

**Homologação interna proposta no ETAPAS original:** checklist assinado pelo professor. Preparar evidências conforme os critérios de aceite e o roteiro comum; não declarar aprovação antes de recebê-la.

### 4.6 Encerramento

**Coordenação:** GP.

- [ ] **Manual do usuário:** G2 redige, G1 revisa regras e G3 confere com usuário externo; curto, com imagens, em `docs/07-encerramento/manual-do-usuario.md`.
- [ ] **Relatório de extensão:** G3 consolida objetivos, atividade realizada, comunidade atendida e evidências; todos contribuem.
- [ ] **Lições aprendidas:** todos contribuem; GP consolida em `docs/07-encerramento/licoes-aprendidas.md`.
- [ ] **Apresentação final:** todos preparam slides, roteiro e ensaio; GP organiza.

**Formato da apresentação:** 12 minutos de exposição e 8 de arguição; até oito slides, pelo menos dois com indicadores próprios; demonstração ao vivo no roteiro comum. Três integrantes sorteados: um apresenta e dois respondem. Todos devem sustentar decisões, código e resultados.

O manual pertence a esta categoria, mas deve estar pronto no congelamento; os prazos estão na seção 5.

### 4.7 Processo

**Responsabilidade:** todos; GP acompanha completude.

- [ ] **Registro de IA:** uma linha por uso relevante com solicitação, retorno, alterações e justificativa; incluir um erro da ferramenta identificado pela equipe e a correção. Uso declarado é permitido em qualquer volume.
- [ ] **Histórico do repositório:** manter histórico completo, autoria correta e contribuições distribuídas. Quem não tiver commits próprios precisa comprovar contribuição por outro meio registrado em ata.

O histórico comprova execução e datas, não produtividade por quantidade de código. Código precisa ser explicável pela equipe. Regras específicas de data para atas e ADRs estão nas respectivas categorias.

<a id=calendario></a>
## 5. Sequência de execução e calendário

### 5.1 Ordem lógica

1. **Iniciação:** entender problema, participantes, premissas e restrições.
2. **Escopo:** fechar requisitos, casos de uso e critérios de aceite.
3. **Planejamento:** decompor entregas, atribuir responsáveis, definir comunicação e cronograma.
4. **Custos e riscos:** estimar esforço/recursos e preparar respostas.
5. **Análise e arquitetura:** pactuar modelo, protótipos e contrato de integração.
6. **Implementação:** frentes avançam em paralelo; integrar primeiro check-in → previsão/faixa → início/fim → erro real.
7. **Testes e homologação:** validar produto completo, executar bancada e responder defeitos.
8. **Publicação e encerramento:** apresentar, corrigir, documentar e registrar aprendizados.

Essa ordem representa dependências, não etapas isoladas: campo, testes, documentação e preparação de ambiente começam cedo. A publicação para a bancada ocorre antes da apresentação.

### 5.2 Marcos oficiais e compromissos da empresa

Datas de 2026. A escolha de F1 como primeira funcionalidade completa é da empresa; o professor exige uma funcionalidade de ponta a ponta nesse marco.

| Data | Marco | Resultado a conferir |
|---|---|---|
| 05/10 | S1 — Iniciação | Empresas constituídas, critério de divisão, ADR-000, gerente/arquiteto, repositório e termo de abertura. Verificar pendências anteriores. |
| 12/10 | S2 — Campo | Clínica confirmada, cronograma, stakeholders, premissas/restrições e primeira janela. Verificar evidências. |
| 19/10 | S3 — Escopo | Escopo/EAP, requisitos/casos de uso, duas janelas acumuladas e entrevista registrada. |
| 26/10 | S4 — Arquitetura | Contrato congelado, modelo, ADRs estruturais, hardware, riscos e custos. Cada grupo demonstra artefato independente usando exemplos comuns. |
| 02/11 | S5 — Fatia vertical | F1 completa com componentes reais; quatro janelas concluídas, série digitada e versionada. |
| 09/11 | S6 — Funcionalidades | Agenda e F1/F2/F3 integradas, plano de testes e riscos revisados. |
| 16/11 | S7 — Congelamento | Versão identificada, sistema publicado com dados de teste, manual e acessos trocados. Ato extensionista na semana, conforme parceiro. |
| 23/11 | S8 — Bancada | Relatório de testes cruzados e respostas aos defeitos recebidos. |
| 24/11 | Pacote institucional | Consolidar os entregáveis disponíveis para o Projeto Integrador. |
| 30/11 | S9 — Apresentação | Demonstração, defesa das decisões e relatório de extensão. |
| 03/12 | Entrega final | Versão com defeitos corrigidos, documentação atualizada e lições aprendidas. |

O cronograma interno deve considerar a Prova Interdisciplinar em 18/11 e a P2 de Banco de Dados em 01/12. Atrasos exigem replanejamento e redução de escopo adicional, sem presumir extensão dos prazos.

<a id=avaliacao></a>
## 6. Avaliação do professor

Categorias de entregáveis da seção 4 não equivalem a notas separadas. São oito critérios oficiais, avaliados em níveis de 0 a 4: **pontuação = nível ÷ 4 × peso**.

| Critério | Peso | O que é avaliado |
|---|---:|---|
| C1 — Dados de campo | 1,0 | Cobertura, método e rastreabilidade. |
| C2 — Gestão | 1,5 | Planejamento, acompanhamento e aderência ao previsto. |
| C3 — Arquitetura e ADRs | 1,5 | Alternativas, fundamentos e consequências das decisões. |
| C4 — Sistema | 2,0 | Funcionalidades, integração e publicação; escopo adicional assumido também é compromisso. |
| C5 — Hardware | 1,0 | Projeto, componentes, alimentação e integração. |
| C6 — Qualidade | 1,0 | Testes próprios, bancada produzida e respostas recebidas. |
| C7 — Apresentação e arguição | 1,5 | Demonstração e sustentação pelos sorteados. |
| C8 — Processo | 0,5 | Participação, histórico, ADRs datados e Registro de IA. |
| **Total** | **10,0** | |

**Bônus:** protótipo físico de hardware em operação, não simulado, até 30/11 vale +0,5, com nota total limitada a 10,0. Não implementar o protótipo não desconta pontos; o esquema continua obrigatório.

A avaliação é da empresa contra o planejamento e o mínimo comum, sem classificação entre equipes. Quem não sustentar o trabalho ao ser sorteado pode receber ajuste individual de até −2,0. Dado de campo não verificável zera C1 e exige refazer a parcela; ADR fora da data não é computado; uso de IA não declarado, havendo evidência, zera C8.

<a id=pendencias></a>
## 7. Decisões pendentes e próxima reunião

### 7.1 Pendências com responsáveis

| Decisão ou verificação | Quem conduz | Quando resolver |
|---|---|---|
| Nomes dos nove integrantes, composição das frentes, GP/arquiteto e responsáveis por artefato | GP e equipe | Reunião de escopo |
| Precedência de agendados/encaixes, tolerância a atraso, reinserção, desempate e níveis além de emergência | G1 com clínica; G2/G3 participam | Levantar no escopo; consolidar antes do contrato |
| Método da previsão, duração inicial por tipo e janela de atualização | G1 e arquiteto, com série de G3 | Definir abordagem na arquitetura; calibrar com campo |
| Canal de aviso, margem de retorno e antecedência sem GPS | G1/G2 com clínica; G3 testa viabilidade | Antes do contrato |
| Granularidade e retenção da localização e logs | Arquiteto e G1/G2 | Registrar no ADR da funcionalidade |
| Linguagens/frameworks, banco e REST ou GraphQL | Arquiteto com três grupos | Arquitetura |
| Hospedagem e condições de acesso externo | G3 com arquiteto | Arquitetura |
| Escolha do hardware e disponibilidade dos componentes | G3 com apoio de G1/G2 | Arquitetura |
| Metas mensuráveis de desempenho/disponibilidade | Arquiteto e G3 com cliente | Antes da homologação |
| Evidências dos marcos anteriores, autorização, janelas e entrevista | G3 e GP | Conferência imediata |
| Data da atividade de extensão dentro da semana prevista | G3 e GP com parceiro | Antes do congelamento |

Perfis, proposta do produto e datas oficiais já estão definidos nas seções correspondentes; não são pendências.

### 7.2 Pauta registrada para 19/10

- [x] Escolher Agenda + Fila Virtual.
- [x] Elaborar este plano com escopo, requisitos, responsáveis por grupo e critérios de aceite.
- [ ] Validar as regras e restrições com a clínica e o professor.
- [ ] Atribuir responsáveis nominais e conferir a coleta prevista para o marco.
- [ ] Registrar a ata e as decisões efetivamente tomadas.

<a id=fontes></a>
## 8. Fontes e preservação do original

- **Caderno do Aluno:** requisitos, entregáveis, calendário e avaliação do professor.
- **ETAPAS baixado novamente:** estrutura original de oito etapas, caminhos de documentos e sugestões de organização.
- **Decisões desta conversa:** escolha de Agenda + Fila, distribuição por grupo, critérios propostos e autonomia entre frentes.

O conteúdo do original foi incorporado por tema, com decisões superadas atualizadas. A redação original está preservada em [ETAPAS-original.md](docs/referencias/ETAPAS-original.md), somente para consulta histórica. O plano vigente é este arquivo; o original não deve ser usado como segunda lista de pendências.
