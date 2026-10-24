"""Rare Tastes of Texas backend.

Serves the products (content.py), product images,
and a backup log of Contact Me inquiries (inquiries.py). The inquiries
themselves are emailed by Web3Forms from the browser (frontend/src/api/site.ts).

Run from Final Project/backend:
    .venv\\Scripts\\activate
    uvicorn main:app --reload --port 8000
"""

import time
from collections import defaultdict, deque
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from content import IMAGES_DIR, load_products, validate_all
from inquiries import append_inquiry
from models import ContactLogRequest, InquiryRecord, Product

validate_all()

app = FastAPI(title="Rare Tastes of Texas API")

# The Vite dev server proxies /api and /media, but allow direct calls during development too.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

IMAGES_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/media/images", StaticFiles(directory=IMAGES_DIR), name="images")


@app.get("/api/products")
def list_products() -> list[Product]:
    return load_products()


# ---------------------------------------------------------------------------
# Contact Me backup log
#
# The browser emails each inquiry to Lisha's inbox through Web3Forms,
# then posts a copy here (with whether the email went out) so nothing is lost
# if delivery fails. A per-IP rate limit keeps bots from flooding the log.
# ---------------------------------------------------------------------------

RATE_LIMIT = 5  # submissions…
RATE_WINDOW_SECONDS = 60 * 60  # …per IP per hour
_recent: dict[str, deque[float]] = defaultdict(deque)


def _rate_limited(ip: str) -> bool:
    now = time.monotonic()
    hits = _recent[ip]
    while hits and now - hits[0] > RATE_WINDOW_SECONDS:
        hits.popleft()
    if len(hits) >= RATE_LIMIT:
        return True
    hits.append(now)
    return False


@app.post("/api/contact", status_code=204)
def log_contact(inquiry: ContactLogRequest, request: Request) -> None:
    if _rate_limited(request.client.host if request.client else "unknown"):
        raise HTTPException(status_code=429, detail="Too many messages. Please try again later.")

    append_inquiry(
        InquiryRecord(
            timestamp=datetime.now(timezone.utc).isoformat(timespec="seconds"),
            name=inquiry.name,
            email=str(inquiry.email),
            phone=inquiry.phone,
            topic=inquiry.topic,
            message=inquiry.message,
            emailed=inquiry.emailed,
        )
    )
