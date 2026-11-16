# Janelas com dados mockados

> Estas janelas sao ficticias e compoem o C1-MOCKED aprovado pelo GP para desenvolvimento, testes e demonstracao. Nao representam observacao em clinica real.

| Janela | Data ficticia de referencia | Horario | Profissionais | Salas | Contexto simulado |
|---|---|---|---:|---:|---|
| MOCK-J1 | 2026-10-06 | 08:00-09:00 | 2 | 2 | movimento matinal moderado |
| MOCK-J2 | 2026-10-13 | 13:00-14:00 | 2 | 2 | movimento apos o almoco |
| MOCK-J3 | 2026-10-20 | 17:00-18:00 | 2 | 2 | maior concentracao no fim do dia |
| MOCK-J4 | 2026-10-27 | 09:00-10:00 | 2 | 2 | movimento matinal com exames |

As datas sao referencias ficticias do cronograma planejado e nao datas de visitas ou coleta. Cada janela possui 10 registros com origem `MOCKED`. Horarios de termino podem ultrapassar a hora de referencia quando a chegada simulada ocorreu dentro da janela.
