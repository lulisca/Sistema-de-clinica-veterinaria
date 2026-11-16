// Tipos das respostas da API. Espelham backend/app/schemas/domain.py.
// Se o backend mudar um campo, este arquivo muda junto (contrato congelado).

export type Perfil = 'RECEPTION' | 'VETERINARIAN' | 'ADMIN'

export type EstadoFila =
  | 'WAITING'
  | 'CALLED'
  | 'RETURNING'
  | 'READY'
  | 'IN_SERVICE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

export type Viabilidade = 'FEASIBLE' | 'AT_RISK' | 'INFEASIBLE' | 'UNKNOWN'

export type MomentoLocalizacao = 'CHECK_IN' | 'NOTIFICATION' | 'RETURN_CONFIRMATION'

export interface Token {
  access_token: string
  token_type: string
  role: Perfil
}

export interface Tutor {
  id: number
  name: string
  contact: string | null
}

export interface Animal {
  id: number
  tutor_id: number
  code: string
  species: string
  name: string | null
}

export interface Recurso {
  id: number
  name: string
  resource_type: string // VETERINARIAN, ROOM ou ISOLATION_ROOM
  active: boolean
}

export interface Agendamento {
  id: number
  tutor_id: number
  animal_id: number
  veterinarian_resource_id: number | null
  scheduled_at: string
  expected_duration_minutes: number
  appointment_type: string
  status: string
}

export interface EntradaFila {
  id: number
  public_token: string
  appointment_id: number | null
  animal_id: number
  appointment_type: string
  species: string
  status: EstadoFila
  priority_level: number
  emergency: boolean
  reactive: boolean
  infectious_risk: boolean
  isolation_required: boolean
  veterinarian_resource_id: number | null
  checked_in_at: string
  called_at: string | null
  started_at: string | null
  finished_at: string | null
  // Ainda não existem na API. Se o backend passar a enviar, a tela já mostra.
  animal_code?: string
  animal_name?: string | null
}

// Estimativa calculada na hora (F1). status = 'ok' ou 'insufficient_data'.
export interface Estimativa {
  status: string
  p50_minutes?: number | null
  p90_minutes?: number | null
  sample_size?: number
  method?: string | null
  data_source?: string | null // MOCKED, MIXED ou ACCEPTED (só na versão nova do backend)
  missing_types?: string[]
  message?: string | null
}

// Uma revisão salva da estimativa (histórico da F1).
export interface RevisaoEstimativa {
  id: number
  queue_entry_id: number
  p50_minutes: number
  p90_minutes: number
  sample_size: number
  method: string
  is_initial: boolean
  revision_number: number
  trigger_event: string
  calculated_at: string
  actual_wait_minutes: number | null
  signed_error_minutes: number | null
  absolute_error_minutes: number | null
  inside_range: boolean | null
}

export interface StatusPublico {
  queue_entry_id: number
  status: EstadoFila
  species: string
  appointment_type: string
  contextual_position: number | null
  estimate: Estimativa
  called_at: string | null
  notification: { status: string; sent_at: string; confirmed_at: string | null } | null
}

export interface PoliticaLocalizacao {
  purpose: string
  consent_version: string
  retention_minutes: number | null
  coordinates_persisted: boolean
  continuous_tracking: boolean
  denial_supported: boolean
  moments: MomentoLocalizacao[]
}

export interface DecisaoRetorno {
  queue_entry_id: number
  estimated_wait_minutes: number | null
  travel_minutes: number | null
  safety_margin_minutes: number
  should_notify_now: boolean
  return_viable: boolean | null
  return_feasibility: Viabilidade
  arrival_slack_minutes: number | null
  mode: string
  reason: string
}

export interface Aviso {
  id: number
  queue_entry_id: number
  channel: string
  status: string // SIMULATED, SENT, CONFIRMED ou FAILED
  message: string
  sent_at: string
  confirmed_at: string | null
  reception_action_required: boolean
  reception_action_resolved_at: string | null
  reception_action_note: string | null
}

export interface ResultadoAvaliacao {
  created: boolean
  reason: string
  decision: DecisaoRetorno
  notification: Aviso | null
}

export interface Alocacao {
  id: number
  queue_entry_id: number
  resource_id: number
  started_at: string
  ended_at: string | null
}

export interface Metricas {
  evaluated_estimates: number
  mean_signed_error_minutes: number | null
  mean_absolute_error_minutes: number | null
  inside_range_rate: number | null
}

export interface MetricasPorTipo extends Metricas {
  appointment_type: string
}

export interface Prontidao {
  minimum_configured: number
  note: string
  types: {
    appointment_type: string
    sample_size: number
    minimum_configured: number
    ready_for_software_estimate: boolean
  }[]
}
