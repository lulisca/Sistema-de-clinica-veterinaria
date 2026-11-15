"""Generate a Markdown F1 calibration/evaluation report from the current database.

Usage:
    python scripts/generate_f1_report.py
    python scripts/generate_f1_report.py docs/RELATORIO_CALIBRACAO_F1.md

The report never claims academic calibration when clinic data are absent. It reports
what the database actually contains and leaves the field-data conclusion explicit.
"""
from __future__ import annotations

import sys
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from sqlalchemy import select  # noqa: E402
from app.core.config import settings  # noqa: E402
from app.core.database import SessionLocal  # noqa: E402
from app.models.domain import QueueEntry, ServiceDurationSample, WaitEstimate  # noqa: E402
from app.services.estimation import sample_readiness  # noqa: E402


def fmt(value):
    return '—' if value is None else f'{value:.2f}'


def main() -> None:
    output = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'docs' / 'RELATORIO_CALIBRACAO_F1.md'

    with SessionLocal() as db:
        samples = list(db.scalars(select(ServiceDurationSample)).all())
        field_samples = [s for s in samples if s.source in {'DIRECT_OBSERVATION', 'RETROSPECTIVE'}]
        system_samples = [s for s in samples if s.source == 'SYSTEM']
        synthetic_samples = [s for s in samples if s.source == 'SYNTHETIC']
        readiness = sample_readiness(db)

        initial_rows = list(db.scalars(
            select(WaitEstimate).where(
                WaitEstimate.is_initial.is_(True),
                WaitEstimate.actual_wait_minutes.is_not(None),
            )
        ).all())

        def metrics(rows):
            if not rows:
                return (0, None, None, None)
            n = len(rows)
            mse = sum(r.signed_error_minutes for r in rows) / n
            mae = sum(r.absolute_error_minutes for r in rows) / n
            inside = sum(1 for r in rows if r.inside_range) / n
            return (n, mse, mae, inside)

        n, mse, mae, inside = metrics(initial_rows)
        by_type = defaultdict(list)
        for row in initial_rows:
            entry = db.get(QueueEntry, row.queue_entry_id)
            if entry:
                by_type[entry.appointment_type].append(row)

    has_field_data = bool(field_samples)
    status = 'PENDENTE DE DADOS DE CAMPO' if not has_field_data else 'DADOS DE CAMPO PRESENTES — revisar cobertura antes de declarar calibração concluída'

    lines = [
        '# Relatório de calibração e avaliação — F1',
        '',
        f'**Status:** {status}',
        '',
        'Este relatório é gerado a partir do banco atual. Ele não substitui a verificação acadêmica da coleta exigida pelo projeto.',
        '',
        '## 1. Método implementado',
        '',
        '- Segmentação por tipo de atendimento.',
        '- Percentis históricos p50 e p90.',
        '- Simulação da fila considerando capacidade de veterinários e atendimentos em andamento.',
        '- Persistência da previsão inicial e de revisões automáticas com horário, número da revisão e evento disparador.',
        '- Comparação entre previsão inicial e espera real até o início do atendimento.',
        '- Indicadores: erro assinado médio, erro absoluto médio (MAE) e proporção dentro da faixa p50–p90.',
        '',
        '## 2. Base disponível',
        '',
        f'- Amostras de observação direta/retrospectiva: **{len(field_samples)}**',
        f'- Amostras produzidas pelo sistema em operação: **{len(system_samples)}**',
        f'- Amostras sintéticas, excluídas da calibração: **{len(synthetic_samples)}**',
        f'- Limiar técnico configurado por tipo: **{settings.min_samples_for_estimate}** amostras não sintéticas.',
        '',
        '| Tipo | Amostras não sintéticas | Limiar técnico | Backend pode estimar? |',
        '|---|---:|---:|---|',
    ]

    if readiness:
        for row in readiness:
            lines.append(
                f"| {row['appointment_type']} | {row['sample_size']} | {row['minimum_configured']} | "
                f"{'Sim' if row['ready_for_software_estimate'] else 'Não'} |"
            )
    else:
        lines.append('| — | 0 | ' + str(settings.min_samples_for_estimate) + ' | Não |')

    lines.extend([
        '',
        '## 3. Erro observado da previsão inicial',
        '',
        f'- Estimativas iniciais já avaliadas: **{n}**',
        f'- Erro assinado médio: **{fmt(mse)} min**',
        f'- MAE: **{fmt(mae)} min**',
        f"- Proporção dentro da faixa: **{'—' if inside is None else f'{inside * 100:.2f}%'}**",
        '',
        '| Tipo | N avaliado | Erro assinado médio (min) | MAE (min) | Dentro da faixa |',
        '|---|---:|---:|---:|---:|',
    ])

    if by_type:
        for kind, rows in sorted(by_type.items()):
            tn, tmse, tmae, tinside = metrics(rows)
            lines.append(
                f"| {kind} | {tn} | {fmt(tmse)} | {fmt(tmae)} | "
                f"{'—' if tinside is None else f'{tinside * 100:.2f}%'} |"
            )
    else:
        lines.append('| — | 0 | — | — | — |')

    lines.extend([
        '',
        '## 4. Critério para encerramento da calibração',
        '',
        'Antes de declarar a F1 calibrada para a entrega, a equipe deve substituir/ complementar os dados de desenvolvimento pela série real da clínica, verificar a cobertura exigida no Caderno do Aluno e então regenerar este relatório.',
        '',
        'O valor de `MIN_SAMPLES_FOR_ESTIMATE` é uma trava técnica do software, não uma afirmação de suficiência estatística nem substitui o mínimo acadêmico de coleta.',
        '',
        '## 5. Evidência de revisões',
        '',
        'As revisões de cada paciente podem ser auditadas por `GET /api/queue/{id}/estimates`. Eventos relevantes como check-in, entrada de encaixe, mudança de prioridade, início/fim de atendimento e atualização das amostras geram novas revisões automaticamente quando houver dados suficientes.',
        '',
    ])

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text('\n'.join(lines), encoding='utf-8')
    print(f'Report written to {output}')


if __name__ == '__main__':
    main()
