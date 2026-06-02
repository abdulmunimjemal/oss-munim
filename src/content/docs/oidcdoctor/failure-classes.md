---
title: Failure classes
description: The 8 reconciler findings — what each means, when it fires, and the exact fix on both the app side and the Keycloak side.
---

The reconciler detects every classic OIDC failure class that only shows up at
runtime in a browser. Both the static `analyze` command and the live `verify`
handshake emit findings from the same single vocabulary — same `code`, same
two-sided fix — so a problem linted ahead of time reads identically to one caught
by a real failed handshake.

Each finding has:
- **`code`** — the machine-readable identifier.
- **`severity`** — `error` (login will fail) or `warning` (degraded behavior).
- **`message`** — the human explanation, often with the exact conflicting values.
- **`appFix`** — what to change on the app side.
- **`keycloakFix`** — what to change in the Keycloak admin console (or let `sync` do it).

---

## `redirect_uri_mismatch`

**Severity:** error

The app's `redirect_uri` is not matched by any Valid Redirect URI registered on
the Keycloak client. This is the #1 Keycloak pain — and the most common false
start for any OIDC integration.

Keycloak matches redirect URIs **literally** (case-sensitive, exact match) except
for a single trailing `*` wildcard, which matches any suffix. It does **not** do
glob or regex matching anywhere except that one trailing position.

The reconciler pinpoints *which* component differs when no registered pattern
matches:

| Mismatch | Example |
|----------|---------|
| Trailing slash | app sends `.../callback`, registered is `.../callback/` |
| Scheme | app sends `http://…`, registered is `https://…` |
| Port | app sends `…:3000/…`, registered is `…:3001/…` |
| Host | app sends `localhost:3000`, registered is `127.0.0.1:3000` |
| Path | app sends `.../callback`, registered is `.../oauth/callback` |
| Nothing registered | the client has no Valid Redirect URIs at all |

**App fix:** Make the app's `redirect_uri` exactly match a registered URI — or change
it to one that does. Watch for trailing-slash, scheme, host, and port differences.
Keycloak matches paths exactly.

**Keycloak fix:** Add the app's URI to the client's Valid Redirect URIs
(Clients → your client → Settings → Valid redirect URIs). Prefer the exact URI or
a narrow `https://example.com/callback*` suffix wildcard over a bare `*`.

---

## `client_type_mismatch`

**Severity:** error

The app's client type (public or confidential) doesn't match the Keycloak client's
`publicClient` setting.

- A **public** client (browser SPA, native app) should send **no** `client_secret`
  and should rely on PKCE for proof of possession.
- A **confidential** client (server-side app) should send a `client_secret` on the
  token request.

Mixing these fails at the token endpoint: Keycloak will reject a secret from a
public client, and reject a confidential client that arrives without one.

**App fix:** Decide one type. A browser or SPA should be public (no secret, use
PKCE). A server-rendered app should be confidential (send `client_secret`).

**Keycloak fix:** Set the client's access type to match — toggle "Client
authentication" (Off = public, On = confidential) under
Clients → your client → Settings.

---

## `pkce_required_missing`

**Severity:** error

Keycloak is configured to **require** PKCE on this client
(Advanced → Proof Key for Code Exchange Code Challenge Method is set), but the app
does not send a `code_challenge` on the authorization request.

**App fix:** Enable PKCE in the app — generate a `code_verifier`, send
`code_challenge` + `code_challenge_method` on the authorize request, and send
`code_verifier` on the token exchange. Use `S256` (SHA-256 hashed); `plain` is
discouraged.

**Keycloak fix:** Either keep requiring PKCE and fix the app, or clear the PKCE
Code Challenge Method setting to make PKCE optional on this client.

---

## `pkce_method_mismatch`

**Severity:** error

The app sends a `code_challenge_method` that differs from what Keycloak requires
on this client. For example, the app sends `plain` but the client is configured
to require `S256`.

**App fix:** Change the app's PKCE method to match the required one (`S256` is
strongly recommended over `plain`).

**Keycloak fix:** Or update Advanced → PKCE Code Challenge Method to match what
the app sends — but prefer setting the app to `S256`.

---

## `standard_flow_disabled`

**Severity:** error

The authorization-code (Standard) flow is disabled on the Keycloak client. This
is the flow oidcdoctor verifies — and the one most web apps use. Without it,
the authorize endpoint will reject the `response_type=code` request.

**App fix:** There is no app-side workaround. Standard Flow must be enabled on the
server.

**Keycloak fix:** Enable "Standard flow" on the client
(Clients → your client → Settings → Authentication flow → Standard flow Enabled).

---

## `web_origins_missing`

**Severity:** warning

The origin derived from the app's `redirect_uri` is not listed in the Keycloak
client's Web Origins. For browser (public) clients, CORS preflight requests from
the origin to the token and userinfo endpoints will fail when this is missing.

This is a `warning` rather than `error` because server-side confidential clients
don't hit this path — but for any SPA or browser-rendered app it will cause subtle
CORS failures after login.

**App fix:** Browser clients call the token/userinfo endpoints with CORS preflight;
the app cannot fix this server-side restriction itself.

**Keycloak fix:** Add the origin (e.g. `http://localhost:3000`) to the client's
Web Origins, or use `+` to automatically allow all origins of registered redirect
URIs (Clients → your client → Settings → Web origins).

---

## `missing_openid_scope`

**Severity:** error

The app's requested scopes do not include `openid`. Without `openid`, Keycloak
will issue an OAuth 2.0 access token but no `id_token` — making this OAuth, not
OpenID Connect. Most app-side OIDC libraries require the `id_token`.

**App fix:** Add `openid` to the app's requested scopes. It must be present for
OpenID Connect.

**Keycloak fix:** No Keycloak-side change needed — `openid` is a request-time
scope the app must send.

---

## `post_logout_mismatch`

**Severity:** warning

The `post_logout_redirect_uri` the app sends on logout is not registered on the
Keycloak client's Valid post logout redirect URIs. Keycloak will redirect to a
generic logout confirmation page instead of back to the app.

**App fix:** Use a URI that is already registered, or register the current one on
the client.

**Keycloak fix:** Add the URI to the client's Valid post logout redirect URIs
(Clients → your client → Settings → Logout settings).
