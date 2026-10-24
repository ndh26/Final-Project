"""Site content for the API: the product list.

Content lives in plain JSON under data/ so it can be updated without touching
code. Files are re-read on every request, so edits show up on the next page
load with no server restart.
"""

from __future__ import annotations

from pathlib import Path

from pydantic import TypeAdapter

from models import Product

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
IMAGES_DIR = DATA_DIR / "images"
PRODUCTS_PATH = DATA_DIR / "products.json"

_products = TypeAdapter(list[Product])


def _read(path: Path) -> bytes:
    return path.read_bytes() if path.exists() else b"[]"


def load_products() -> list[Product]:
    products = _products.validate_json(_read(PRODUCTS_PATH))
    # Image fields hold a bare file name; the web URL is that file under /media/images/.
    for p in products:
        if p.image and not p.image.startswith("/"):
            p.image = f"/media/images/{p.image}"
    return products


def validate_all() -> None:
    """Fail fast at startup if hand-edited products.json has a typo."""
    load_products()
