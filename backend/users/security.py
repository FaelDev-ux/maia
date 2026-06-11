import re
from urllib.parse import urlparse

from django.conf import settings


CONTROL_CHARS_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
HTML_TAG_RE = re.compile(r"<[a-zA-Z/!][^>]*>")


def normalize_plain_text(value, max_length, *, allow_newlines=False):
    if value is None:
        return "", None

    if not isinstance(value, str):
        return "", "Envie um texto valido."

    text = CONTROL_CHARS_RE.sub("", value)
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    if not allow_newlines:
        text = " ".join(text.split())
    else:
        text = "\n".join(" ".join(line.split()) for line in text.split("\n")).strip()

    text = text.strip()

    if HTML_TAG_RE.search(text):
        return "", "Nao envie HTML ou scripts nos campos de texto."

    if len(text) > max_length:
        return "", f"Use ate {max_length} caracteres."

    return text, None


def normalize_tag_list(value, *, max_items=10, max_length=32):
    if value is None:
        return [], None

    if not isinstance(value, list):
        return [], "Envie tags em formato de lista."

    tags = []

    for item in value[:max_items]:
        tag, error = normalize_plain_text(item, max_length)

        if error:
            return [], error

        if tag and tag not in tags:
            tags.append(tag)

    return tags, None


def normalize_int(value, *, minimum=0, maximum=10, fallback=None):
    if value in (None, ""):
        return fallback, None

    try:
        number = int(value)
    except (TypeError, ValueError):
        return fallback, "Envie um numero valido."

    if number < minimum or number > maximum:
        return fallback, f"Envie um numero entre {minimum} e {maximum}."

    return number, None


def is_allowed_https_url(value, allowed_hosts):
    if not isinstance(value, str) or not value:
        return False

    parsed = urlparse(value)
    host = (parsed.hostname or "").lower()

    return (
        parsed.scheme == "https"
        and not parsed.username
        and not parsed.password
        and host in allowed_hosts
    )


def is_firebase_storage_url(value):
    parsed = urlparse(value) if isinstance(value, str) else None

    if not parsed or parsed.scheme != "https" or parsed.hostname != "firebasestorage.googleapis.com":
        return False

    expected_prefix = f"/v0/b/{settings.FIREBASE_STORAGE_BUCKET}/o/"

    return parsed.path.startswith(expected_prefix)


def is_safe_content_image_url(value):
    return is_allowed_https_url(
        value,
        {
            "firebasestorage.googleapis.com",
            "images.unsplash.com",
        },
    )
