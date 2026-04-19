import os

import requests
from dotenv import load_dotenv

load_dotenv()

PIXAZO_GENERATE_URL = (
    os.getenv("PIXAZO_IMAGE_URL") or "https://api.pixazo.ai/v1/images/generate"
).strip()


def _require_pixazo_key() -> str:
    key = (os.getenv("PIXAZO_API_KEY") or "").strip()
    if not key:
        raise ValueError("PIXAZO_API_KEY is not configured")
    return key


def generate_image(
    prompt: str,
    *,
    width: int = 1024,
    height: int = 1024,
) -> dict:
    api_key = _require_pixazo_key()
    response = requests.post(
        PIXAZO_GENERATE_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={"prompt": prompt, "width": width, "height": height},
        timeout=300,
    )
    try:
        data = response.json()
    except Exception:
        data = {}
    if not response.ok:
        detail = (
            data.get("detail")
            or data.get("message")
            or data.get("error")
            or response.text
        )
        raise RuntimeError(f"Pixazo API error ({response.status_code}): {detail}")
    return data if isinstance(data, dict) else {}


def _find_http_url(obj: object, depth: int = 0) -> str | None:
    if depth > 8:
        return None
    if isinstance(obj, str) and obj.startswith(("http://", "https://", "data:image/")):
        return obj
    if isinstance(obj, dict):
        for v in obj.values():
            u = _find_http_url(v, depth + 1)
            if u:
                return u
    if isinstance(obj, list):
        for item in obj:
            u = _find_http_url(item, depth + 1)
            if u:
                return u
    return None


def image_url_from_response(data: dict) -> str:
    """Resolve a displayable image URL from Pixazo JSON (exact shape may vary)."""
    if not data:
        raise ValueError("Empty Pixazo response")
    u = _find_http_url(data)
    if u:
        return u
    raise ValueError(
        f"Could not find an image URL in Pixazo response (keys: {list(data.keys())!r})"
    )


def generate_image_url(prompt: str) -> str:
    raw = generate_image(prompt)
    return image_url_from_response(raw)
