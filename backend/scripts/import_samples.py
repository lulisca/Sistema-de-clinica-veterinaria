"""Importa CSV de durações para o banco configurado em DATABASE_URL.

Uso:
    python scripts/import_samples.py data/amostras_campo.csv

Depois da importação, pacientes em espera têm a F1 recalculada automaticamente.
"""
from __future__ import annotations

import csv
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.core.database import SessionLocal  # noqa: E402
from app.models.domain import ServiceDurationSample  # noqa: E402
from app.services.estimation import recalculate_waiting_estimates  # noqa: E402

ALLOWED_SOURCES = {'DIRECT_OBSERVATION', 'RETROSPECTIVE', 'SYSTEM', 'SYNTHETIC'}


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit('Uso: python scripts/import_samples.py <arquivo.csv>')

    path = Path(sys.argv[1])
    created = 0
    with SessionLocal() as db, path.open(encoding='utf-8-sig', newline='') as handle:
        for line_number, row in enumerate(csv.DictReader(handle), start=2):
            if not row.get('duration_minutes'):
                continue
            source = (row.get('source') or 'DIRECT_OBSERVATION').strip().upper()
            if source not in ALLOWED_SOURCES:
                raise ValueError(f'Linha {line_number}: origem inválida {source!r}')
            appointment_type = (row.get('appointment_type') or '').strip()
            if not appointment_type:
                raise ValueError(f'Linha {line_number}: appointment_type é obrigatório')
            duration = float(row['duration_minutes'])
            if duration <= 0:
                raise ValueError(f'Linha {line_number}: duration_minutes deve ser > 0')
            observed_at = datetime.fromisoformat(row['observed_at']) if row.get('observed_at') else None
            db.add(ServiceDurationSample(
                appointment_type=appointment_type,
                duration_minutes=duration,
                source=source,
                observed_at=observed_at,
                note=(row.get('note') or '').strip() or None,
            ))
            created += 1
        db.commit()
        recalc = recalculate_waiting_estimates(db, 'SAMPLES_UPDATED')

    print(f'Imported {created} samples')
    print(f"Recalculated {len(recalc['updated_queue_entries'])} waiting queue entries")


if __name__ == '__main__':
    main()
