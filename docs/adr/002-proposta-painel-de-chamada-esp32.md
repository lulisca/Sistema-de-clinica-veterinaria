# ADR-002 - Painel de chamada com ESP32

- **Data do registro:** 2026-11-15
- **Data de aceite:** 2026-11-16
- **Status:** aceito como prototipo documental
- **Decide:** Alisson, GP

## Contexto

O projeto exige esquema de hardware integrado. As alternativas consideradas foram totem RFID, sensor de presenca e painel de chamada.

## Decisao

Adotar painel de chamada com ESP32, display, LED e buzzer, consultando por HTTPS um endpoint anonimizado da API.

## Motivos

- ligacao direta com o fluxo de fila;
- menor complexidade mecanica e de cadastro que RFID;
- demonstracao clara de comunicacao hardware-software;
- possibilidade de usar componentes do campus.

## Consequencias

O desenho exige endpoint dedicado, token de dispositivo, Wi-Fi e cuidado com dados exibidos. A entrega cobre esquema, protocolo, consumo e protecoes; construcao fisica, compra e cotacao permanecem fora do escopo congelado.
