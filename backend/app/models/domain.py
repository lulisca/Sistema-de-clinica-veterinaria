from __future__ import annotations
import secrets
from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(300))
    role: Mapped[str] = mapped_column(String(30), default='RECEPTION')
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

class Tutor(Base):
    __tablename__ = 'tutors'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    contact: Mapped[str | None] = mapped_column(String(120), nullable=True)
    animals: Mapped[list[Animal]] = relationship(back_populates='tutor')

class Animal(Base):
    __tablename__ = 'animals'
    id: Mapped[int] = mapped_column(primary_key=True)
    tutor_id: Mapped[int] = mapped_column(ForeignKey('tutors.id'))
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    species: Mapped[str] = mapped_column(String(40), index=True)
    name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    tutor: Mapped[Tutor] = relationship(back_populates='animals')

class Resource(Base):
    __tablename__ = 'resources'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    resource_type: Mapped[str] = mapped_column(String(40), index=True)  # VETERINARIAN, ROOM, ISOLATION_ROOM, EQUIPMENT
    active: Mapped[bool] = mapped_column(Boolean, default=True)

class Appointment(Base):
    __tablename__ = 'appointments'
    id: Mapped[int] = mapped_column(primary_key=True)
    tutor_id: Mapped[int] = mapped_column(ForeignKey('tutors.id'))
    animal_id: Mapped[int] = mapped_column(ForeignKey('animals.id'))
    veterinarian_resource_id: Mapped[int | None] = mapped_column(ForeignKey('resources.id'), nullable=True)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    expected_duration_minutes: Mapped[int] = mapped_column(Integer, default=30)
    appointment_type: Mapped[str] = mapped_column(String(50), index=True)
    status: Mapped[str] = mapped_column(String(30), default='SCHEDULED', index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

class QueueEntry(Base):
    __tablename__ = 'queue_entries'
    id: Mapped[int] = mapped_column(primary_key=True)
    public_token: Mapped[str] = mapped_column(String(64), unique=True, default=lambda: secrets.token_urlsafe(24), index=True)
    appointment_id: Mapped[int | None] = mapped_column(ForeignKey('appointments.id'), nullable=True, unique=True)
    animal_id: Mapped[int] = mapped_column(ForeignKey('animals.id'))
    appointment_type: Mapped[str] = mapped_column(String(50), index=True)
    species: Mapped[str] = mapped_column(String(40), index=True)
    status: Mapped[str] = mapped_column(String(30), default='WAITING', index=True)
    priority_level: Mapped[int] = mapped_column(Integer, default=0)
    emergency: Mapped[bool] = mapped_column(Boolean, default=False)
    reactive: Mapped[bool] = mapped_column(Boolean, default=False)
    infectious_risk: Mapped[bool] = mapped_column(Boolean, default=False)
    isolation_required: Mapped[bool] = mapped_column(Boolean, default=False)
    veterinarian_resource_id: Mapped[int | None] = mapped_column(ForeignKey('resources.id'), nullable=True)
    checked_in_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    called_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

class ServiceDurationSample(Base):
    __tablename__ = 'service_duration_samples'
    id: Mapped[int] = mapped_column(primary_key=True)
    appointment_type: Mapped[str] = mapped_column(String(50), index=True)
    duration_minutes: Mapped[float] = mapped_column(Float)
    source: Mapped[str] = mapped_column(String(40), default='DIRECT_OBSERVATION')  # DIRECT_OBSERVATION, RETROSPECTIVE, SYSTEM, SYNTHETIC
    observed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

class WaitEstimate(Base):
    __tablename__ = 'wait_estimates'
    id: Mapped[int] = mapped_column(primary_key=True)
    queue_entry_id: Mapped[int] = mapped_column(ForeignKey('queue_entries.id'), index=True)
    p50_minutes: Mapped[float] = mapped_column(Float)
    p90_minutes: Mapped[float] = mapped_column(Float)
    sample_size: Mapped[int] = mapped_column(Integer)
    method: Mapped[str] = mapped_column(String(80), default='historical_percentiles_queue_simulation')
    is_initial: Mapped[bool] = mapped_column(Boolean, default=False)
    revision_number: Mapped[int] = mapped_column(Integer, default=1)
    trigger_event: Mapped[str] = mapped_column(String(80), default='MANUAL')
    calculated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    actual_wait_minutes: Mapped[float | None] = mapped_column(Float, nullable=True)
    signed_error_minutes: Mapped[float | None] = mapped_column(Float, nullable=True)
    absolute_error_minutes: Mapped[float | None] = mapped_column(Float, nullable=True)
    inside_range: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

class LocationSnapshot(Base):
    __tablename__ = 'location_snapshots'
    id: Mapped[int] = mapped_column(primary_key=True)
    queue_entry_id: Mapped[int] = mapped_column(ForeignKey('queue_entries.id'), index=True)
    moment: Mapped[str] = mapped_column(String(40))  # CHECK_IN, NOTIFICATION, RETURN_CONFIRMATION
    consent_given: Mapped[bool] = mapped_column(Boolean)
    travel_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    distance_range: Mapped[str | None] = mapped_column(String(40), nullable=True)
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

class Notification(Base):
    __tablename__ = 'notifications'
    id: Mapped[int] = mapped_column(primary_key=True)
    queue_entry_id: Mapped[int] = mapped_column(ForeignKey('queue_entries.id'), index=True)
    channel: Mapped[str] = mapped_column(String(40), default='SIMULATOR')
    status: Mapped[str] = mapped_column(String(30), default='SENT')
    message: Mapped[str] = mapped_column(Text)
    sent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

class ResourceAllocation(Base):
    __tablename__ = 'resource_allocations'
    id: Mapped[int] = mapped_column(primary_key=True)
    queue_entry_id: Mapped[int] = mapped_column(ForeignKey('queue_entries.id'), index=True)
    resource_id: Mapped[int] = mapped_column(ForeignKey('resources.id'), index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

class AuditEvent(Base):
    __tablename__ = 'audit_events'
    id: Mapped[int] = mapped_column(primary_key=True)
    actor_user_id: Mapped[int | None] = mapped_column(ForeignKey('users.id'), nullable=True)
    entity_type: Mapped[str] = mapped_column(String(60))
    entity_id: Mapped[int] = mapped_column(Integer)
    action: Mapped[str] = mapped_column(String(80))
    details: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
