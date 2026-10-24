"""Append-only backup log of Contact Me submissions.

Every inquiry is saved to data/inquiries.json before we try to email it, so
nothing is lost if the mail server is down or not configured yet. The file is
git-ignored because it holds visitors' contact details. Same atomic
read-append-rewrite approach as the HW 4 audit trail.
"""

from __future__ import annotations

import json
import tempfile
from pathlib import Path

from content import DATA_DIR
from models import InquiryRecord

INQUIRIES_PATH = DATA_DIR / "inquiries.json"


def append_inquiry(record: InquiryRecord) -> None:
    """Append one record. Never raises — a logging failure must not block the visitor."""
    try:
        try:
            rows = json.loads(INQUIRIES_PATH.read_text(encoding="utf-8")) if INQUIRIES_PATH.exists() else []
            if not isinstance(rows, list):
                rows = []
        except (OSError, json.JSONDecodeError):
            rows = []

        rows.append(record.model_dump())

        with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=DATA_DIR, delete=False) as handle:
            json.dump(rows, handle, indent=2, ensure_ascii=False)
            temp_path = Path(handle.name)
        temp_path.replace(INQUIRIES_PATH)
    except Exception as exc:  # noqa: BLE001 — logging is best-effort
        print(f"[inquiries] failed to save: {exc!r}")
