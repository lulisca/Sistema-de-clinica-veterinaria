# ADR-002 - Painel de chamada com ESP32

- **Data:** 2026-11-15
- **Status:** proposta

## Contexto

O projeto exige esquema de hardware integrado. As alternativas consideradas foram totem RFID, sensor de presenca e painel de chamada.

## Proposta

Adotar painel de chamada com ESP32, display, LED e buzzer, consultando por HTTPS um endpoint anonimizado da API.

## Motivos

- ligacao direta com o fluxo de fila;
- menor complexidade mecanica e de cadastro que RFID;
- demonstracao clara de comunicacao hardware-software;
- possibilidade de usar componentes do campus.

## Consequencias

Exige endpoint dedicado, token de dispositivo, Wi-Fi e cuidado com dados exibidos. O prototipo fisico nao e obrigatorio; sem aprovacao, o documento permanece proposta.
