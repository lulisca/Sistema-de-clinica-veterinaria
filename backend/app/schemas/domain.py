from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import Literal

class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class LoginIn(BaseModel):
    email: str
    password: str

class BootstrapIn(BaseModel):
    name: str = 'Admin'
    email: str
    password: str = Field(min_length=8)
    role: str = 'RECEPTION'

class TokenOut(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    role: str

class TutorCreate(BaseModel):
    name: str
    contact: str | None = None
class TutorOut(ORMModel):
    id: int
    name: str
    contact: str | None

class AnimalCreate(BaseModel):
    tutor_id: int
    code: str
    species: str
    name: str | None = None
class AnimalOut(ORMModel):
    id: int
    tutor_id: int
    code: str
    species: str
    name: str | None

class ResourceCreate(BaseModel):
    name: str
    resource_type: str
    active: bool = True
class ResourceOut(ORMModel):
    id: int
    name: str
    resource_type: str
    active: bool

class AppointmentCreate(BaseModel):
    tutor_id: int
    animal_id: int
    veterinarian_resource_id: int | None = None
    scheduled_at: datetime
    expected_duration_minutes: int = Field(default=30, ge=1, le=480)
    appointment_type: str
class AppointmentUpdate(BaseModel):
    scheduled_at: datetime | None = None
    veterinarian_resource_id: int | None = None
    expected_duration_minutes: int | None = Field(default=None, ge=1, le=480)
    status: str | None = None
class AppointmentOut(ORMModel):
    id: int
    tutor_id: int
    animal_id: int
    veterinarian_resource_id: int | None
    scheduled_at: datetime
    expected_duration_minutes: int
    appointment_type: str
    status: str

class CheckInIn(BaseModel):
    reactive: bool = False
    infectious_risk: bool = False
    isolation_required: bool = False

class WalkInCreate(BaseModel):
    animal_id: int
    appointment_type: str
    veterinarian_resource_id: int | None = None
    reactive: bool = False
    infectious_risk: bool = False
    isolation_required: bool = False

class QueueOut(ORMModel):
    id: int
    public_token: str
    appointment_id: int | None
    animal_id: int
    appointment_type: str
    species: str
    status: str
    priority_level: int
    emergency: bool
    reactive: bool
    infectious_risk: bool
    isolation_required: bool
    veterinarian_resource_id: int | None
    checked_in_at: datetime
    called_at: datetime | None
    started_at: datetime | None
    finished_at: datetime | None

class PriorityUpdate(BaseModel):
    emergency: bool | None = None
    priority_level: int | None = Field(default=None, ge=0, le=100)

class DurationSampleIn(BaseModel):
    appointment_type: str
    duration_minutes: float = Field(gt=0, le=1440)
    source: str = 'DIRECT_OBSERVATION'
    observed_at: datetime | None = None
    note: str | None = None
class DurationSamplesBulkIn(BaseModel):
    samples: list[DurationSampleIn]

class EstimateOut(BaseModel):
    queue_entry_id: int
    status: str
    p50_minutes: float | None = None
    p90_minutes: float | None = None
    sample_size: int = 0
    method: str | None = None
    missing_types: list[str] = []
    message: str | None = None
    estimate_id: int | None = None
    is_initial: bool | None = None
    revision_number: int | None = None
    trigger_event: str | None = None


class WaitEstimateOut(ORMModel):
    id: int
    queue_entry_id: int
    p50_minutes: float
    p90_minutes: float
    sample_size: int
    method: str
    is_initial: bool
    revision_number: int
    trigger_event: str
    calculated_at: datetime
    actual_wait_minutes: float | None
    signed_error_minutes: float | None
    absolute_error_minutes: float | None
    inside_range: bool | None

class F1TypeMetrics(BaseModel):
    appointment_type: str
    evaluated_estimates: int
    mean_signed_error_minutes: float | None
    mean_absolute_error_minutes: float | None
    inside_range_rate: float | None

class F1ReadinessItem(BaseModel):
    appointment_type: str
    sample_size: int
    minimum_configured: int
    ready_for_software_estimate: bool

class F1ReadinessOut(BaseModel):
    minimum_configured: int
    note: str
    types: list[F1ReadinessItem]

class LocationIn(BaseModel):
    model_config = ConfigDict(extra='forbid')
    moment: Literal['CHECK_IN','NOTIFICATION','RETURN_CONFIRMATION']
    consent_given: bool
    travel_minutes: int | None = Field(default=None, ge=0, le=1440)

class LocationConsentOut(BaseModel):
    purpose: str
    consent_version: str
    retention_minutes: int | None
    coordinates_persisted: bool = False
    continuous_tracking: bool = False
    denial_supported: bool = True
    moments: list[str]

class ReturnDecisionOut(BaseModel):
    queue_entry_id: int
    estimated_wait_minutes: float | None
    travel_minutes: int | None
    safety_margin_minutes: int
    should_notify_now: bool
    return_viable: bool | None
    return_feasibility: Literal['FEASIBLE','AT_RISK','INFEASIBLE','UNKNOWN']
    arrival_slack_minutes: float | None
    mode: str
    reason: str

class NotificationIn(BaseModel):
    model_config = ConfigDict(extra='forbid')
    message: str = Field(default='É hora de retornar à clínica.', min_length=1, max_length=500)
    channel: Literal['SIMULATOR'] = 'SIMULATOR'
class NotificationOut(ORMModel):
    id: int
    queue_entry_id: int
    channel: str
    status: str
    message: str
    sent_at: datetime
    confirmed_at: datetime | None
    reception_action_required: bool
    reception_action_resolved_at: datetime | None
    reception_action_note: str | None

class NotificationDispatchOut(BaseModel):
    created: bool
    reason: str
    decision: ReturnDecisionOut
    notification: NotificationOut | None = None

class ReceptionActionResolveIn(BaseModel):
    note: str = Field(min_length=3, max_length=1000)

class AllocationIn(BaseModel):
    resource_id: int
class AllocationOut(ORMModel):
    id: int
    queue_entry_id: int
    resource_id: int
    started_at: datetime
    ended_at: datetime | None

class MetricsOut(BaseModel):
    evaluated_estimates: int
    mean_signed_error_minutes: float | None
    mean_absolute_error_minutes: float | None
    inside_range_rate: float | None
