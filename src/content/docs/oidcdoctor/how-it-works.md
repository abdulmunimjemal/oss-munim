---
title: How it works
description: The scaffold → reconcile → verify → sync → re-verify pipeline, the heal loop, and why hermetic no-browser verification is the headline.
---

## The pipeline

```
scaffold  →  analyze (reconcile)  →  verify (real handshake)  →  sync (fix Keycloak)  →  verify ✓
```

### 1. Scaffold

`oidcdoctor scaffold --framework <fw>` generates app-side login code from the
intent in `oidcdoctor.json`. The generated files — route handlers, library config,
callback logic — use exactly the same `redirectUri`, `clientId`, `clientType`,
`pkceMethod`, and `scopes` as the config. This is a consistency guarantee, not
just a convenience: a scaffolded app's intent will always reconcile cleanly against
a freshly synced Keycloak client.

Supported: **Next.js App Router**, **FastAPI + Authlib**, **Django +
mozilla-django-oidc**. The scaffold step is optional for existing apps — bring
your own code and point `oidcdoctor.json` at it.

### 2. Reconcile (analyze)

`oidcdoctor analyze` calls the **Keycloak Admin REST API** to fetch the live
client, then runs `reconcile(intent, client)`. This is a pure, synchronous
function — no network after the fetch — that walks 8 failure-class checks in
order:

1. `redirect_uri_mismatch` — mirrors Keycloak's literal matching (+ trailing `*` wildcard); on mismatch, pinpoints the differing component (scheme, host, port, path, trailing slash).
2. `client_type_mismatch` — public vs. confidential; checks both directions.
3. `pkce_required_missing` — if the client has a required PKCE method and the intent doesn't send it.
4. `pkce_method_mismatch` — if both use PKCE but on different methods.
5. `standard_flow_disabled` — the standard (auth-code) flow is off.
6. `web_origins_missing` — the app origin is not in Web Origins (CORS will fail for browser clients).
7. `missing_openid_scope` — `openid` absent from the requested scopes.
8. `post_logout_mismatch` — post-logout URI not registered.

Each finding has a `code`, a human `message`, an `appFix`, and a `keycloakFix`.
The result is `{ ok, findings }` where `ok` is true only when there are no
`error`-severity findings.

### 3. Verify (real handshake)

`oidcdoctor verify` runs the **real** authorization-code + PKCE flow using
Node's built-in `fetch` — no browser, no Playwright, no headless Chromium:

**(a)** Build the authorize URL — includes `response_type=code`, `client_id`,
`redirect_uri`, `scope`, `state`, `nonce`, and if PKCE is active:
`code_challenge` (SHA-256 of a random `code_verifier`) + `code_challenge_method=S256`.

**(b)** `GET` the authorization endpoint with `redirect: "manual"`. Keycloak
rejects an unregistered `redirect_uri` before showing the login form — a 302
with `?error=invalid_redirect_uri` in the Location. Any error here is mapped
to a `redirect_uri_mismatch` finding immediately.

**(c)** Receive the Keycloak login page HTML; extract the `<form action="…">` URL
using a lightweight regex (no DOM parser dependency). A missing form means the
request was rejected before login.

**(d)** `POST` the test user credentials (`username`, `password`) to the form
action using `application/x-www-form-urlencoded`, carrying the Keycloak session
cookies (`AUTH_SESSION_ID`, `KC_RESTART`) absorbed from the previous response.
Follows `redirect: "manual"` to catch the code on the next 302 rather than
following into the app.

**(e)** Parse the `302 Location` → `redirect_uri?code=…&state=…`. Validate that
`state` matches the sent value (CSRF guard). Any OAuth `error` parameter is mapped
to the finding vocabulary.

**(f)** Exchange the code at the token endpoint: send `grant_type=authorization_code`,
`code`, `redirect_uri`, `client_id`, and `code_verifier` (for PKCE) or
`client_secret` (for confidential clients). Parse the JSON response.

**(g)** Assert that `access_token` or `id_token` is present in the response. If
so: `{ ok: true, tokenIssued: true, step: "done", tokens }`.

On **any** failure at any step, `verify` returns the same `Finding` vocabulary
as the reconciler — `code`, `message`, `appFix`, `keycloakFix` — so there is
never an opaque "it failed" message.

### 4. Sync

`oidcdoctor sync` calls `planClientPatch(intent, client)`, which computes the
**minimal** change set — only fields that differ are included. URI lists and origin
lists are **unioned** with existing values; existing entries are never removed.
The patch is then applied via the Keycloak Admin REST API (`PUT /clients/{id}`).

If no client with `clientId` exists, `sync` creates one from scratch using
`clientFromIntent`.

After sync, re-run `verify` to confirm the heal loop closed:

```bash
oidcdoctor sync && oidcdoctor verify
```

## The heal loop

The headline property is that this loop **provably closes**: the reconciler's
fix recommendations are the same values `planClientPatch` applies, and `verify`
confirms it end to end. The test suite proves this without any network or Docker:
an in-process fake Keycloak server implements the authorize, token, and Admin REST
endpoints; the heal-loop test starts a broken client (unregistered redirect_uri +
standard flow off), runs `verifyLogin` (fails), applies the patch via the fake
Admin API, runs `verifyLogin` again — and asserts `tokenIssued: true`.

## Hermetic, no-browser

Both the reconciler and the verifier are fully hermetic:

- **Reconciler:** pure function, no I/O, unit-tested with inline fixtures.
- **Verifier:** injectable `fetchImpl` parameter; the test suite injects a handler
  that speaks Keycloak's auth, login form, token, and Admin REST protocol.

No Playwright, no headless Chromium, no Docker, no network in tests. The real-
network path is exercised by pointing at an actual Keycloak; the logic is proven
in-process.

## Keycloak Admin API

oidcdoctor uses only the Keycloak Admin REST API (`/admin/realms/{realm}/clients`):

- `GET /clients?clientId=…` — fetch the live client for `analyze`.
- `POST /clients` — create a new client on first `sync`.
- `PUT /clients/{id}` — apply the minimal patch on subsequent `sync`.

Authentication is via a short-lived admin access token, fetched once per command
run from the token endpoint using either password-grant or client-credentials
grant (configured in `keycloak.auth`).

## Honest limits

- **Keycloak-first.** The reconciler models Keycloak's exact client semantics.
  Generic OIDC providers (Auth0, Okta, Entra) are on the roadmap.
- **Password-grant test user.** `verify` submits the Keycloak login form with a
  username/password. Social/IdP-brokered logins and WebAuthn are out of scope.
- **No real-browser flows.** Verification drives the handshake with `fetch`; flows
  that require JavaScript execution in a browser are not covered.
