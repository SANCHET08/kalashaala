# KalaShaala Security Audit

Date: 2026-06-07

## Implemented Controls

- Added global DRF throttling for anonymous and authenticated API traffic.
- Added strict login throttling at 5 attempts per 15 minutes per IP and username.
- Moved Django secret key, debug mode, CORS origins, CSRF origins, throttle rates, request-size limits, and government API credentials to environment variables.
- Removed committed `.env` secrets and added `.env.example`.
- Added `.gitignore` rules for real `.env` and `.env.local` files.
- Added request validation middleware to reject oversized request bodies, oversized query strings, malformed JSON, and unsupported control characters.
- Sanitized public auth and artisan inquiry inputs.
- Moved government schemes API calls behind a backend proxy so the API key is not exposed in frontend code.
- Removed the hardcoded Google Generative AI key from the frontend chatbot and replaced it with database-backed static responses.
- Added security headers and cookie hardening settings.

## Scan Results

Secret scan command:

```powershell
rg -n 'api-key=|GOV_API_KEY|AIza|sk-[A-Za-z0-9]|django-insecure|SECRET_KEY\s*=|password\s*=\s*["'']|token\s*=\s*["'']' -S . -g '!node_modules/**' -g '!dist/**' -g '!backend/db.sqlite3'
```

Findings after fixes:

- No hardcoded Google API key remains.
- No hardcoded Django insecure secret remains.
- No frontend government API key remains.
- Remaining matches are expected env-variable references or false positives such as package names and CSS text.

## Verification

- `python backend\manage.py check` passed.
- `npm.cmd run build` passed.
- Targeted ESLint passed for changed frontend files, with one remaining hook warning in `Schemes.jsx`.
- Login throttle behavior check passed: five failed login attempts returned `401`, and the sixth returned `429`.

## Remaining Risks

- `DJANGO_DEBUG` defaults to `True` for local development. It must be `False` in production.
- Real production values must be provided in an ignored `.env` or hosting secret manager.
- Some older frontend files still hardcode `http://localhost:8000`; this is not a secret, but should be centralized before deployment.
- The app still uses session auth and some localStorage flags in older login code. Production auth should avoid trusting localStorage for access decisions.
- `REST_FRAMEWORK.DEFAULT_PERMISSION_CLASSES` remains `AllowAny` for backward compatibility. Sensitive views set stricter permissions, but production should default to authenticated access and explicitly opt public endpoints out.
- SQLite is suitable for local development only.
