import html
import json
import re

from django.conf import settings
from django.http import JsonResponse


CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
MAX_FIELD_LENGTH = 2_000


def clean_text(value, *, max_length=MAX_FIELD_LENGTH):
    if value is None:
        return ""
    text = str(value).strip()
    if len(text) > max_length:
        raise ValueError(f"Input exceeds {max_length} characters")
    if CONTROL_CHARS.search(text):
        raise ValueError("Input contains unsupported control characters")
    return html.escape(text, quote=False)


def clean_mapping(data, allowed_fields, *, max_length=MAX_FIELD_LENGTH):
    cleaned = {}
    for field in allowed_fields:
        if field in data:
            cleaned[field] = clean_text(data.get(field), max_length=max_length)
    return cleaned


class RequestValidationMiddleware:
    """
    Rejects oversized requests, malformed JSON, and oversized query strings before
    they reach views. View-level serializers still perform field-specific checks.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        max_body_size = getattr(settings, "MAX_REQUEST_BODY_SIZE", 1_048_576)
        content_length = request.META.get("CONTENT_LENGTH")
        try:
            content_length_value = int(content_length) if content_length else 0
        except ValueError:
            return JsonResponse({"error": "Invalid content length"}, status=400)

        if content_length_value > max_body_size:
            return JsonResponse({"error": "Request body too large"}, status=413)

        if len(request.META.get("QUERY_STRING", "")) > getattr(settings, "MAX_QUERY_STRING_LENGTH", 2_048):
            return JsonResponse({"error": "Query string too large"}, status=414)

        for key, values in request.GET.lists():
            try:
                clean_text(key, max_length=100)
                for value in values:
                    clean_text(value, max_length=500)
            except ValueError as exc:
                return JsonResponse({"error": str(exc)}, status=400)

        content_type = request.META.get("CONTENT_TYPE", "")
        if "application/json" in content_type and request.body:
            try:
                json.loads(request.body.decode(request.encoding or "utf-8"))
            except (UnicodeDecodeError, json.JSONDecodeError):
                return JsonResponse({"error": "Malformed JSON body"}, status=400)

        return self.get_response(request)
