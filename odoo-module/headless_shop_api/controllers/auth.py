# -*- coding: utf-8 -*-
"""Authentication and rate-limiting helpers for the headless REST API."""
import functools
import json
import logging
import time
from collections import defaultdict, deque

from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)

# In-memory rate-limit buckets. For multi-worker production deployments,
# swap this for Redis. Per-IP, 60-second sliding window.
_RATE_WINDOW = 60
_RATE_LIMIT = 100
_buckets: "defaultdict[str, deque]" = defaultdict(deque)


def _json_response(payload, status=200, cors_origin=None):
    headers = [
        ('Content-Type', 'application/json'),
        ('Access-Control-Allow-Origin', cors_origin or '*'),
        ('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS'),
        ('Access-Control-Allow-Headers', 'Content-Type, Authorization'),
        ('Access-Control-Max-Age', '86400'),
    ]
    return request.make_response(json.dumps(payload, default=str), headers=headers, status=status)


def success(data=None, meta=None, status=200, cors_origin=None):
    payload = {'success': True, 'data': data or {}}
    if meta is not None:
        payload['meta'] = meta
    return _json_response(payload, status=status, cors_origin=cors_origin)


def error(code, message, status=400, cors_origin=None):
    payload = {'success': False, 'error': {'code': code, 'message': message}}
    return _json_response(payload, status=status, cors_origin=cors_origin)


def get_allowed_origin():
    """Return the request origin if it is in the configured CORS allow-list."""
    origin = request.httprequest.headers.get('Origin', '')
    icp = request.env['ir.config_parameter'].sudo()
    raw = icp.get_param('headless_shop_api.cors_origins', '*')
    if raw == '*' or not origin:
        return raw if raw == '*' else None
    allowed = [o.strip() for o in raw.split(',') if o.strip()]
    return origin if origin in allowed else None


def _check_rate_limit(ip):
    now = time.time()
    bucket = _buckets[ip]
    while bucket and bucket[0] < now - _RATE_WINDOW:
        bucket.popleft()
    if len(bucket) >= _RATE_LIMIT:
        return False
    bucket.append(now)
    return True


def _check_api_key():
    """Optional bearer auth — required for write endpoints when an API key is configured."""
    icp = request.env['ir.config_parameter'].sudo()
    expected = icp.get_param('headless_shop_api.api_key', '')
    if not expected:
        return True  # no key configured -> open mode (dev)
    auth_header = request.httprequest.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return False
    return auth_header.split(' ', 1)[1].strip() == expected


def api_route(path, methods=('GET',), require_auth=False, public_read=True):
    """Decorator that wires CORS, rate limit, JSON parsing, and error envelopes."""

    def decorator(func):
        @http.route(
            path,
            type='http',
            auth='public',
            methods=list(methods) + ['OPTIONS'],
            csrf=False,
            save_session=False,
        )
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            origin = get_allowed_origin()

            if request.httprequest.method == 'OPTIONS':
                return _json_response({}, status=204, cors_origin=origin)

            ip = request.httprequest.remote_addr or 'unknown'
            if not _check_rate_limit(ip):
                _logger.warning('Rate limit hit for %s on %s', ip, path)
                return error('RATE_LIMITED', 'Too many requests', status=429, cors_origin=origin)

            if require_auth and not _check_api_key():
                return error('UNAUTHORIZED', 'Invalid or missing API key', status=401, cors_origin=origin)

            # Parse JSON body for non-GET requests.
            payload = {}
            if request.httprequest.method in ('POST', 'PATCH', 'PUT'):
                raw = request.httprequest.get_data(as_text=True)
                if raw:
                    try:
                        payload = json.loads(raw)
                    except json.JSONDecodeError:
                        return error('INVALID_JSON', 'Body must be valid JSON', status=400, cors_origin=origin)
            kwargs['_payload'] = payload
            kwargs['_origin'] = origin

            try:
                return func(*args, **kwargs)
            except Exception as exc:  # noqa: BLE001 — surface a clean envelope to clients
                _logger.exception('Headless API error on %s: %s', path, exc)
                return error('INTERNAL_ERROR', str(exc), status=500, cors_origin=origin)

        return wrapper

    return decorator
