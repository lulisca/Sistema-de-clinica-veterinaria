from sqlalchemy import delete
from app.core.database import SessionLocal
from app.models.domain import LocationSnapshot
from datetime import datetime, timezone


def main() -> None:
    now = datetime.now(timezone.utc)
    with SessionLocal() as db:
        result = db.execute(delete(LocationSnapshot).where(
            LocationSnapshot.expires_at.is_(None) | (LocationSnapshot.expires_at <= now)
        ))
        db.commit()
        print(f"Expired location snapshots removed: {result.rowcount or 0}")


if __name__ == '__main__':
    main()
