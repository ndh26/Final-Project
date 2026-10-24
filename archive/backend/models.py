"""Typed API shapes for Rare Tastes of Texas.

These are the contracts shared by the content loader (content.py), the inquiry
log (inquiries.py), and the FastAPI endpoints (main.py). Field names are
camelCase so they match the frontend's TypeScript types one-to-one.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, EmailStr, Field

# --- Site content (read from data/products.json) ---------------------------


class Flavor(BaseModel):
    name: str
    note: str = ""  # short aside such as "with a kick"


class Product(BaseModel):
    """One item on the Products page. There is no cart: availability depends on
    the prickly pear harvest, so customers ask through the Contact Me page."""

    productId: str
    name: str
    tagline: str = ""
    description: str = ""
    # File name under data/images/, or null to show the placeholder illustration.
    image: str | None = None
    # Display text such as "$8 / jar"; null hides the price entirely.
    price: str | None = None
    availability: str = ""
    flavors: list[Flavor] = Field(default_factory=list)
    # Sold only at Goliad Market Days, so there's no "Ask about availability" button.
    marketOnly: bool = False


# --- Contact form -------------------------------------------------------------

Topic = Literal["Product availability", "Deliveries", "Gift packaging", "Goliad Market Days", "Other"]


class ContactLogRequest(BaseModel):
    """Backup copy of one inquiry. The browser emails it via Web3Forms first,
    then posts it here with `emailed` saying whether that delivery succeeded."""

    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(default="", max_length=30)
    topic: Topic = "Other"
    message: str = Field(min_length=1, max_length=4000)
    emailed: bool = False


class InquiryRecord(BaseModel):
    """What gets appended to data/inquiries.json for every real submission."""

    timestamp: str
    name: str
    email: str
    phone: str
    topic: str
    message: str
    emailed: bool
