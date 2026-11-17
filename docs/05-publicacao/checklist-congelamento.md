# Checklist de congelamento

> **Conferido em 2026-11-16 pelo GP e G3.** Os estados abaixo refletem as pastas 01 a 04 e nao substituem evidencia de publicacao externa.

| Item | Estado no congelamento | Evidencia ou observacao |
|---|---|---|
| Repositorio e branch de revisao | Concluido | Trabalho consolidado em `feature/revisao-final` a partir da `development` |
| Responsabilidades da equipe | Concluido | GP, arquiteto e grupos registrados na iniciacao |
| Autoria do backend inicial | Documentada | Lucas Kather e Rafael Lindquist dividiram o desenvolvimento; os commits desse lote foram publicados por Lucas |
| Identidade de Rafael Nicolas | Documentada | Aparece no Git como Rafael Carvalho |
| Contribuicao de Pedro | Documentada | Existe em branch preservada, nao integrada a versao atual |
| Backend | Concluido | F1, F2, F3, cadastro, autoatendimento e reordenacao integrados |
| Frontend | Concluido | Integrado na `development`, com build e lint aprovados |
| Testes automatizados | Concluido | Suite backend atual com 55 testes aprovados |
| F1 no frontend | Concluido | Status publico e indicadores exibem p50/p90 ou indisponibilidade |
| C1 | Concluido como `C1-MOCKED` | 40 registros, quatro janelas e origem identificada; sem alegacao de coleta real |
| F2 | Concluido | Fluxo integrado com `SIMULATOR` e parametros 20/60/10 `MOCKED` aprovados |
| F3 | Concluido | Emergencia autorizada, segregacao, recursos e reordenacao implementados |
| Arquitetura e contrato | Concluido | Documentos conferidos contra frontend e backend |
| Hardware | Concluido como prototipo documental | Construcao fisica, inventario e cotacao fora do escopo |
| Plano e resultados de testes | Concluido | Casos, resultados e limites registrados; pasta 06 registra 55 testes, CT19 e CT20 |
| Manual | Concluido | Conferido com 12 capturas da versao local |
| Registro de IA | Concluido para os usos registrados | Manter atualizacao em novos usos relevantes |
| Empresa 02 | Concluido como simulacao `MOCKED` | Nao exige URL ou participacao externa real nesta versao |
| Publicacao Vercel + Neon | Concluida | Frontend e API publicados por HTTPS; banco Neon respondeu em rota autenticada |
| Teste ponta a ponta e smoke externo | Concluido | CT19 local aprovado com ressalvas; CT20 externo basico aprovado no commit `0fd8c67` |

## Criterio de liberacao externa

A versao somente pode ser chamada de publicada depois de registrar URL do frontend, URL da API, commit, migrations, CORS e resultado do smoke test. Ate la, a execucao local documentada e a evidencia valida da demonstracao tecnica.
