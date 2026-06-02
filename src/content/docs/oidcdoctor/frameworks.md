---
title: Frameworks
description: The three scaffolders (Next.js App Router, FastAPI, Django) and why the analyze/verify/sync core works for any stack.
---

oidcdoctor ships three code scaffolders. They are a convenience — the
`analyze`/`verify`/`sync` core works for **any stack** regardless of framework
or language. If your app already exists, skip scaffold and just point
`oidcdoctor.json` at its intent.

## Next.js App Router

**`--framework next`**

Generates route handlers under `app/api/auth/`:

| File | What it does |
|------|--------------|
| `app/api/auth/login/route.ts` | Builds the authorization URL (with PKCE `code_challenge`) and redirects the browser. Stores `code_verifier` and `state` in cookies. |
| `app/api/auth/callback/route.ts` | Receives `code` + `state`, validates `state`, exchanges the code at the token endpoint (with `code_verifier`), and sets a session cookie. |
| `app/api/auth/logout/route.ts` | Clears the session cookie and redirects to the Keycloak logout endpoint with `post_logout_redirect_uri`. |

The scaffold uses the intent's `redirectUri` as the callback URL, so the
generated `app/api/auth/callback/route.ts` always matches what `sync` will
register on Keycloak. Client type, PKCE method, and scopes are all derived
from `oidcdoctor.json`.

Dependencies assumed: none beyond Next.js itself. PKCE is implemented with the
Web Crypto API (`crypto.subtle`), which is available in all modern Next.js
runtimes.

## FastAPI

**`--framework fastapi`**

Generates a `auth.py` router using **Authlib** (Starlette OAuth client):

- `GET /login` — starts the OAuth flow, redirecting to Keycloak with PKCE.
- `GET /callback` — handles the code exchange, stores the token in the session.
- `GET /logout` — clears the session and redirects to Keycloak logout.

Assumes `authlib` and `starlette` (or FastAPI, which wraps Starlette) are
installed. The generated router is mounted at `/auth` by convention but can be
prefixed differently.

## Django

**`--framework django`**

Generates `settings` additions and `urls.py` entries using
**mozilla-django-oidc**:

- `settings_oidc.py` — `OIDC_*` settings derived from the intent: `OP_AUTHORIZATION_ENDPOINT`, `OP_TOKEN_ENDPOINT`, `RP_CLIENT_ID`, `RP_SIGN_ALGO`, PKCE settings.
- `urls_oidc.py` — URL patterns to include in `ROOT_URLCONF`.

Assumes `mozilla-django-oidc` is installed and `django.contrib.auth` is
configured. The generated settings are standalone and can be imported into an
existing `settings.py` with `from .settings_oidc import *`.

## Core: any stack

The scaffolders produce files; the core does the work that matters.

`reconcile(intent, keycloakClient)` and `verifyLogin(intent, opts)` take an
**`OidcIntent`** object — not a framework, not a file. Any app that can be
described by:

```json
{
  "issuer": "https://keycloak.example.com/realms/myrealm",
  "clientId": "my-app",
  "redirectUri": "https://myapp.example.com/auth/callback",
  "clientType": "public",
  "usePkce": true,
  "pkceMethod": "S256",
  "scopes": ["openid", "profile", "email"]
}
```

…can be analyzed, verified, and synced — regardless of whether it's a Go server,
a Rails app, a Vue SPA, or a mobile app. Write `oidcdoctor.json` with the correct
intent and run `analyze` + `verify` + `sync`. That's the whole flow.

The scaffold step exists so agents (and developers) have consistent, working
starter code to build from — not because the verification depends on it.
