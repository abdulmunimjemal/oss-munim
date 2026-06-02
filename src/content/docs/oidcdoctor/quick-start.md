---
title: Quick start
description: Install oidcdoctor, write oidcdoctor.json, scaffold login code, and run a real PKCE handshake against Keycloak in five minutes.
---

## 1. Install

```bash
npm install -g oidcdoctor      # or use npx -y oidcdoctor <command>
```

Requires Node ≥ 18. Nothing to configure globally — `npx` runs on demand.

## 2. Write `oidcdoctor.json`

Run `init` to drop a starter config in the current directory:

```bash
oidcdoctor init
```

Edit the generated `oidcdoctor.json`:

```json
{
  "framework": "next",
  "intent": {
    "issuer": "https://keycloak.example.com/realms/myrealm",
    "clientId": "my-app",
    "redirectUri": "http://localhost:3000/api/auth/callback",
    "postLogoutRedirectUri": "http://localhost:3000/",
    "clientType": "public",
    "usePkce": true,
    "pkceMethod": "S256",
    "scopes": ["openid", "profile", "email"]
  },
  "keycloak": {
    "auth": { "grant": "password", "username": "admin", "password": "admin", "clientId": "admin-cli" }
  },
  "testUser": { "username": "testuser", "password": "testpassword" }
}
```

- **`intent`** — your app's OIDC parameters: issuer, client ID, redirect URI, client type, PKCE settings, requested scopes.
- **`keycloak.auth`** — admin credentials used by `analyze`, `sync`, and `verify` to call the Keycloak Admin REST API.
- **`testUser`** — a Keycloak user oidcdoctor will actually log in as during `verify`.
- **`framework`** — optional; used by `scaffold` as the default when `--framework` is omitted.

The Keycloak issuer is `{baseUrl}/realms/{realm}`. oidcdoctor derives the OIDC
endpoints (`/protocol/openid-connect/{authorization,token,logout}`) and the
Admin REST base (`/admin/realms/{realm}/clients`) from it automatically.

## 3. Scaffold login code

```bash
oidcdoctor scaffold --framework next --out .
```

Writes consistent, intent-aligned login code for the chosen framework. The
generated files use exactly the same `redirectUri`, `clientId`, `pkceMethod`, and
`clientType` as `oidcdoctor.json` — so the scaffold and the reconciler agree.

Supported values for `--framework`: `next`, `fastapi`, `django`.  
Omit `--out` to print to stdout for review before writing.

## 4. Analyze (static reconcile)

```bash
oidcdoctor analyze
```

Reads the live Keycloak client via the Admin API and compares it against your
intent. Reports every mismatch with the exact fix on both sides — no guessing
which side to change. Run this before `verify` to catch the easy ones cheaply.

## 5. Verify (real handshake)

```bash
oidcdoctor verify
```

Runs a real authorization-code + PKCE handshake against your Keycloak server
using `fetch` — no browser:

1. Builds the authorize URL and GETs the Keycloak login page.
2. Scrapes the form action, POSTs `testUser` credentials (carrying session cookies).
3. Catches the `302` to `redirect_uri?code=…&state=…`, validates `state`.
4. Exchanges the code at the token endpoint (with `code_verifier`).
5. Asserts a token was issued.

On any failure it maps the symptom to the same finding vocabulary as `analyze` —
same `code`, same two-sided fix.

## 6. Sync (patch Keycloak)

```bash
oidcdoctor sync
```

Creates the Keycloak client if it doesn't exist, or applies the **minimal patch**
that makes it consistent with your intent — unions redirect URIs, web origins, and
post-logout URIs rather than replacing them. Re-run `verify` after to confirm.

## 7. Wire it into your agent — the easy way

```bash
npx oidcdoctor install
```

```ansi
  ✓ added oidcdoctor for claude → .mcp.json
  ✓ added oidcdoctor for cursor → .cursor/mcp.json

  Restart your agent, then ask it to analyze + verify your OIDC login.
```

Target one agent with `--agent claude` or `--agent cursor`, or write to your home
directory with `--global`. Supports Claude Code and Cursor.

## 8. Or wire it by hand

oidcdoctor speaks MCP over stdio. The server command is `npx -y oidcdoctor mcp`.

**Claude Code** — add to `.mcp.json`:

```json
{
  "mcpServers": {
    "oidcdoctor": { "command": "npx", "args": ["-y", "oidcdoctor", "mcp"] }
  }
}
```

**Codex** — add to `~/.codex/config.toml`:

```toml
[mcp_servers.oidcdoctor]
command = "npx"
args = ["-y", "oidcdoctor", "mcp"]
```

**Cursor / any MCP client:** use the same stdio command — `npx -y oidcdoctor mcp`.

Once wired, your agent has four tools: `analyze`, `verify_login`, `sync_client`,
and `scaffold` — and the loop to use them.

## Next steps

- [Commands](/oidcdoctor/commands/) — full CLI reference with all flags.
- [Failure classes](/oidcdoctor/failure-classes/) — every finding code explained.
- [How it works](/oidcdoctor/how-it-works/) — the pipeline in detail.
