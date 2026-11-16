# Plano de riscos

> **Linha de base planejada:** 2026-10-26. **Revisao real:** 2026-11-16. Escala: baixa, media ou alta. Os estados refletem o fechamento tecnico e as decisoes aprovadas na pasta `01-iniciacao`.

| ID | Risco | Prob. | Impacto | Resposta | Acao concreta | Responsavel | Status |
|---|---|---|---|---|---|---|---|
| R01 | Frontend nao integrar a tempo | Baixa | Alta | Mitigar | Manter regressao dos fluxos integrados na `development` | G2 + arquiteto | Controlado |
| R02 | Publicacao Vercel + Neon ou smoke test externo falhar | Alta | Alta | Mitigar | Publicar API e banco, aplicar migrations, configurar CORS e registrar smoke test | G3 + arquiteto | Ativo |
| R03 | Avaliacao exigir evidencia de campo real alem do C1-MOCKED | Media | Alta | Aceitar/mitigar | Declarar a limitacao e solicitar orientacao formal antes de qualquer substituicao | GP + G3 | Ativo |
| R04 | Dependencias impedirem os testes | Baixa | Alta | Mitigar | Preservar versoes, requisitos, Docker e comando de execucao | G1 + G3 | Controlado |
| R05 | Regra F3 permanecer ambigua | Baixa | Alta | Mitigar | Manter testes de emergencia, prioridade, check-in, recurso e reordenacao | Arquiteto + G1 | Controlado |
| R06 | Parametros F2 parecerem regra clinica validada | Media | Media | Evitar | Identificar 20/60/10 como configuracao de demonstracao `MOCKED` | Arquiteto + G3 | Controlado |
| R07 | Faltar evidencia de teste e demonstracao | Baixa | Alta | Mitigar | Preservar resultados, versao, ambiente, 12 capturas e roteiro | G3 | Controlado |
| R08 | ADR retroativo comprometer a rastreabilidade | Baixa | Media | Evitar | Registrar ADR somente na data real | Arquiteto + GP | Controlado |
| R09 | Uso de IA nao declarado comprometer o C8 | Media | Alta | Evitar | Atualizar o Registro de IA em todo uso relevante | Todos | Ativo |
| R10 | Autoria individual ficar insuficiente | Baixa | Alta | Mitigar | Preservar commits, PRs e merges sem squash | GP | Controlado |
| R11 | Segredo ou dado pessoal entrar no Git | Baixa | Alta | Evitar | Revisar diff, ignorar `.env` e usar somente dados mockados | Todos | Controlado |
| R12 | Localizacao violar minimizacao ou LGPD | Baixa | Alta | Evitar | Nao enviar coordenadas, exigir consentimento e aplicar expiracao | G1 + G2 | Controlado |
| R13 | Falha de aviso ficar sem tratamento | Baixa | Media | Mitigar | Demonstrar simulador, acao da recepcao e alternativa operacional | G1 + G2 | Controlado |
| R14 | Bancada cruzada ser interpretada como participacao externa real | Media | Alta | Evitar | Identificar Empresa 02 e resultados como simulacao `MOCKED` | GP + G3 | Controlado |
| R15 | Hardware documental ser interpretado como prototipo fisico | Media | Media | Evitar | Declarar construcao fisica fora do escopo e manter calculos e protecoes documentados | Arquiteto + G3 | Controlado |
| R16 | Equipe nao sustentar o trabalho na arguicao | Media | Alta | Mitigar | Fazer rodizio, ensaio por feature e revisao dos fluxos | Todos | Ativo |
| R17 | Mudanca tardia quebrar a versao | Media | Alta | Mitigar | Exigir PR, revisao, regressao e identificacao da versao publicada | Arquiteto + G3 | Ativo |
| R18 | Escopo extra consumir o prazo | Baixa | Alta | Evitar | Manter congelamento tecnico e exigir aprovacao do GP para ampliacoes | GP | Controlado |
| R19 | Concentracao do trabalho de qualidade e documentacao no G3 | Alta | Alta | Mitigar | GP consolida prioridades; arquiteto revisa tecnica; G1/G2 fornecem evidencias das proprias frentes | GP + arquiteto | Ativo |
| R20 | Simulacao extensionista ficar sem responsavel ou ser confundida com acao real | Baixa | Alta | Evitar | Manter o relatorio `MOCKED` congelado em 16/11 sob responsabilidade nominal do GP e G3 | GP + G3 | Controlado |
| R21 | Teste ponta a ponta revelar incompatibilidade entre frontend, API e banco | Media | Alta | Mitigar | Executar jornada completa, registrar defeito, corrigir em branch e repetir regressao | G1 + G2 + G3 | Ativo |

## Contingencias de fechamento

- **Falha na publicacao:** manter execucao local documentada, corrigir a configuracao e nao declarar URL antes do smoke test.
- **Falha no teste ponta a ponta:** registrar o passo, resposta, ambiente e versao; corrigir em branch e repetir a regressao.
- **Professor exigir evidencia real:** preservar os documentos `MOCKED` como simulacao e criar nova etapa somente apos orientacao formal.
- **Defeito critico apos congelamento:** corrigir em branch, executar regressao e identificar uma nova versao.
- **Mudanca de escopo:** executar somente com aprovacao do GP e analise do arquiteto sobre impacto tecnico.

## Historico

| Marco | Data | Revisao | Mudanca |
|---|---|---|---|
| Recuperacao documental | 2026-11-15 | Alisson (GP), com apoio de IA declarado | Modelo inicial substituido por riscos e contingencias concretas |
| Fechamento da linha de base | 2026-11-16 | Alisson (GP) | Estados alinhados ao frontend integrado, 43 testes, cenarios `MOCKED`, hardware documental e publicacao em execucao |
