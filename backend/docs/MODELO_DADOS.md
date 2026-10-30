# Modelo de dados — Backend Fila Virtual

```mermaid
erDiagram
    TUTOR ||--o{ ANIMAL : possui
    TUTOR ||--o{ APPOINTMENT : agenda
    ANIMAL ||--o{ APPOINTMENT : participa
    APPOINTMENT ||--o| QUEUE_ENTRY : gera
    ANIMAL ||--o{ QUEUE_ENTRY : entra
    RESOURCE ||--o{ APPOINTMENT : profissional_agendado
    RESOURCE ||--o{ RESOURCE_ALLOCATION : alocado
    QUEUE_ENTRY ||--o{ RESOURCE_ALLOCATION : usa
    QUEUE_ENTRY ||--o{ WAIT_ESTIMATE : recebe
    QUEUE_ENTRY ||--o{ LOCATION_SNAPSHOT : informa
    QUEUE_ENTRY ||--o{ NOTIFICATION : recebe
    USER ||--o{ AUDIT_EVENT : executa

    TUTOR {
      int id PK
      string name
      string contact
    }
    ANIMAL {
      int id PK
      int tutor_id FK
      string code UK
      string species
      string name
    }
    APPOINTMENT {
      int id PK
      int tutor_id FK
      int animal_id FK
      int veterinarian_resource_id FK
      datetime scheduled_at
      int expected_duration_minutes
      string appointment_type
      string status
    }
    QUEUE_ENTRY {
      int id PK
      string public_token UK
      int appointment_id FK
      int animal_id FK
      string appointment_type
      string species
      string status
      int priority_level
      bool emergency
      bool reactive
      bool infectious_risk
      bool isolation_required
      int veterinarian_resource_id FK
      datetime checked_in_at
      datetime started_at
      datetime finished_at
    }
    RESOURCE {
      int id PK
      string name UK
      string resource_type
      bool active
    }
    RESOURCE_ALLOCATION {
      int id PK
      int queue_entry_id FK
      int resource_id FK
      datetime started_at
      datetime ended_at
    }
    SERVICE_DURATION_SAMPLE {
      int id PK
      string appointment_type
      float duration_minutes
      string source
      datetime observed_at
    }
    WAIT_ESTIMATE {
      int id PK
      int queue_entry_id FK
      float p50_minutes
      float p90_minutes
      int sample_size
      bool is_initial
      int revision_number
      string trigger_event
      datetime calculated_at
      float actual_wait_minutes
      float signed_error_minutes
      float absolute_error_minutes
      bool inside_range
    }
    LOCATION_SNAPSHOT {
      int id PK
      int queue_entry_id FK
      string moment
      bool consent_given
      int travel_minutes
      string distance_range
      datetime expires_at
    }
    NOTIFICATION {
      int id PK
      int queue_entry_id FK
      string channel
      string status
      string message
      datetime sent_at
      datetime confirmed_at
    }
    USER {
      int id PK
      string email UK
      string role
      bool active
    }
    AUDIT_EVENT {
      int id PK
      int actor_user_id FK
      string entity_type
      int entity_id
      string action
      string details
      datetime created_at
    }
```

## Decisões importantes

1. **Fila não é uma tabela por espécie/motivo.** `QueueEntry` armazena os eixos e a API pode agrupar/filtrar sem perder a disputa por recursos compartilhados.
2. **Emergência não é calculada pelo sistema.** O campo só pode ser alterado por perfil veterinário/admin.
3. **Localização precisa não é persistida.** O backend persiste apenas consentimento, tempo/faixa de deslocamento e expiração.
4. **Previsões são versionadas.** Isso permite comparar previsão inicial, revisões e espera real.
5. **Amostras de campo ficam separadas da fila operacional.** Assim observação direta/retrospectiva pode calibrar a F1 antes de existirem atendimentos reais no sistema.
