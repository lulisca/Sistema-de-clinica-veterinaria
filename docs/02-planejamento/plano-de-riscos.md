# Plano de riscos

> **Linha de base planejada:** 2026-10-26. **Revisao real:** 2026-11-15. Escala: baixa, media ou alta.

| ID | Risco | Prob. | Impacto | Resposta | Acao concreta | Responsavel | Status |
|---|---|---|---|---|---|---|---|
| R01 | Frontend nao integrar a tempo | Alta | Alta | Mitigar | Congelar fluxo minimo, integrar endpoint por endpoint e remover extras | G2 + arquiteto | Aberto |
| R02 | Sistema nao ser publicado para teste externo | Alta | Alta | Mitigar | Plataforma escolhida no ADR-003 (Vercel + Neon); publicar API primeiro e executar smoke test externo | G3 + arquiteto | Aberto |
| R03 | C1 nao ser aceito sem coleta real verificavel | Alta | Alta | Aceitar/mitigar | Manter C1 a validar, separar dados mockados e pedir orientacao formal | GP + G3 | Aberto |
| R04 | Dependencias impedirem os testes | Media | Alta | Mitigar | Reproduzir ambiente limpo, registrar versoes e usar Docker | G1 + G3 | Aberto |
| R05 | Regra F3 permanecer ambigua | Media | Alta | Mitigar | Aprovar e testar emergencia, prioridade, check-in e ID | Arquiteto + G1 | Aberto |
| R06 | Parametros F2 parecerem regra validada | Media | Media | Evitar | Marcar 20/60/10 min como valores de demonstracao | Arquiteto + G3 | Em controle |
| R07 | Faltar evidencia de teste e demo | Media | Alta | Mitigar | Salvar resultado, versao, data, ambiente e capturas | G3 | Aberto |
| R08 | ADR retroativo nao ser computado | Alta | Media | Evitar | Criar ADR apenas na data real e nao fingir aprovacao historica | Arquiteto + GP | Em controle |
| R09 | Uso de IA nao declarado zerar C8 | Media | Alta | Evitar | Atualizar o Registro de IA em todo uso relevante | Todos | Em controle |
| R10 | Autoria individual insuficiente | Media | Alta | Mitigar | Configurar autoria, dividir trabalho e usar merge sem squash | GP | Aberto |
| R11 | Segredo ou dado pessoal entrar no Git | Baixa | Alta | Evitar | Revisar diff, ignorar `.env` e usar apenas dados mockados | Todos | Em controle |
| R12 | Localizacao violar minimizacao/LGPD | Baixa | Alta | Evitar | Nao enviar coordenadas, exigir consentimento e expiracao | G1 + G2 | Em controle |
| R13 | Falha de aviso ficar sem tratamento | Media | Media | Mitigar | Demonstrar simulador, acao da recepcao e alternativa operacional | G1 + G2 | Parcial |
| R14 | Empresa 02 ficar indisponivel | Media | Alta | Transferir/aceitar | Registrar tentativas, acionar professor e preparar casos antes | GP + G3 | Aberto |
| R15 | Hardware sem cotacao ou calculo | Media | Media | Mitigar | Fechar esquema, inventario/cotacao e consumo | G3 | Aberto |
| R16 | Equipe nao sustentar na arguicao | Media | Alta | Mitigar | Rodizio de apresentacao e ensaios por feature | Todos | Aberto |
| R17 | Mudanca tardia quebrar a versao | Media | Alta | Mitigar | PR, revisao, regressao e identificacao da versao publicada | Arquiteto + G3 | Aberto |
| R18 | Escopo extra consumir o prazo | Alta | Alta | Evitar | Suspender extras ate piso funcional, publicacao, testes e manual | GP | Ativo |

## Contingencias

- **Sem frontend em 16/11:** reduzir telas ao fluxo demonstravel; Swagger e apenas apoio.
- **Sem hospedagem ate o fechamento:** entregar instrucao local e registrar a limitacao.
- **Sem testes nesta maquina:** executar por Docker ou na maquina de outro integrante e registrar ambiente.
- **Sem decisao do C1:** manter a massa somente como mockada e o criterio pendente.
- **Defeito critico apos congelamento:** corrigir em branch, executar regressao e identificar nova versao.

## Historico

| Marco | Data | Revisao | Mudanca |
|---|---|---|---|
| Recuperacao G3 | 2026-11-15 | Alisson (GP), com apoio de IA declarado | Modelo vazio substituido por riscos e contingencias concretas |
