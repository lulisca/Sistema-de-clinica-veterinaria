import json
from sqlalchemy.orm import Session
from app.models.domain import AuditEvent

def audit(db: Session, entity_type: str, entity_id: int, action: str, actor_user_id: int | None = None, details=None):
    event = AuditEvent(
        actor_user_id=actor_user_id,
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        details=json.dumps(details, ensure_ascii=False, default=str) if details is not None else None,
    )
    db.add(event)
    return event
