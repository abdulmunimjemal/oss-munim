---
title: Commands
description: Every oidcdoctor command — init, scaffold, analyze, verify, sync, mcp, install — with all flags.
---

```bash
oidcdoctor <command> [options]
```

Run via `npx oidcdoctor <command>` or install globally with
`npm i -g oidcdoctor` (the installed binary is `oidcdoctor`).

## Commands

| Command | What it does |
|---------|--------------|
| `init` | Write a starter `oidcdoctor.json` in the current directory. |
| `scaffold` | Generate app-side login code for a framework. |
| `analyze` | Reconcile `oidcdoctor.json` intent against the live Keycloak client. |
| `verify` | Run the real auth-code + PKCE handshake and assert a token is issued. |
| `sync` | Create or patch the Keycloak client to match the app intent. |
| `mcp` | Serve oidcdoctor's tools over MCP (stdio). Wire this into your agent. |
| `install` | Wire oidcdoctor into your agents (Claude Code, Cursor) automatically. |

## `oidcdoctor init`

Write a starter `oidcdoctor.json` in the current directory and print the next steps.

```bash
oidcdoctor init
```

Edit the generated file — at minimum set `intent.issuer`, `intent.clientId`,
`intent.redirectUri`, and `keycloak.auth` — then run `analyze` or `verify`.

## `oidcdoctor scaffold`

Generate app-side OIDC login code for a framework. The generated files are
guaranteed consistent with the intent in `oidcdoctor.json` — same `redirectUri`,
`clientId`, `clientType`, `pkceMethod`, and `scopes`.

| Option | Meaning |
|--------|---------|
| `--framework <name>` | `next` \| `fastapi` \| `django` (required if not set in config). |
| `--out <dir>` | Write files into this directory. Omit to print to stdout. |
| `--config <path>` | Path to `oidcdoctor.json` (file or directory; default `./oidcdoctor.json`). |

```bash
oidcdoctor scaffold --framework next --out .
oidcdoctor scaffold --framework fastapi             # prints to stdout
oidcdoctor scaffold --framework django --out src/
```

## `oidcdoctor analyze`

Fetch the live Keycloak client via the Admin REST API and reconcile it against the
app intent. Reports every mismatch with a precise two-sided fix.

| Option | Meaning |
|--------|---------|
| `--config <path>` | `oidcdoctor.json` to use (default: `./oidcdoctor.json`). |

```bash
oidcdoctor analyze
```

Requires `keycloak.auth` in `oidcdoctor.json`. Prints each finding code, the
human message, the app-side fix, and the Keycloak-side fix. Exits 1 if any
`error`-severity finding is found. See [Failure classes](/oidcdoctor/failure-classes/).

## `oidcdoctor verify`

Run the **real** authorization-code + PKCE handshake against Keycloak using
`fetch` — no browser, no Playwright. Asserts a token is issued; exits 1 with a
precise finding if it fails.

| Option | Meaning |
|--------|---------|
| `--config <path>` | `oidcdoctor.json` to use (default: `./oidcdoctor.json`). |

```bash
oidcdoctor verify
```

Requires `testUser.username` and `testUser.password` in `oidcdoctor.json`. The
handshake: authorize URL → login form POST → code on the 302 → token exchange →
assert token. On any failure it prints the step, the finding code, and the fix.

## `oidcdoctor sync`

Create the Keycloak client if it doesn't exist; otherwise apply the **minimal patch**
to bring it into agreement with the app intent. Unions URI lists and origin lists
rather than replacing them — existing entries are preserved.

| Option | Meaning |
|--------|---------|
| `--config <path>` | `oidcdoctor.json` to use (default: `./oidcdoctor.json`). |

```bash
oidcdoctor sync
```

Requires `keycloak.auth` in `oidcdoctor.json`. Re-run `verify` after `sync` to
confirm the login works end to end.

## `oidcdoctor mcp`

Start oidcdoctor as an MCP server over stdio. Exposes four agent-facing tools:
`analyze`, `verify_login`, `sync_client`, and `scaffold`. Reads `oidcdoctor.json`
from the current directory (or `--config`).

```bash
oidcdoctor mcp
oidcdoctor mcp --config /path/to/oidcdoctor.json
```

This is the command you put in your MCP client config:

```json
{ "command": "npx", "args": ["-y", "oidcdoctor", "mcp"] }
```

## `oidcdoctor install`

Non-destructively write an oidcdoctor MCP entry into your agents' config files,
then print the paths that were written.

| Option | Meaning |
|--------|---------|
| `--agent <name>` | Target `claude` \| `cursor` \| `all` (default `all`). |
| `--global` | Write to your home directory instead of the project. |

```bash
npx oidcdoctor install                  # Claude Code + Cursor, project-local
npx oidcdoctor install --agent claude   # Claude Code only
npx oidcdoctor install --global         # home-dir config
```

Codex uses a TOML format not supported by `install`. The command prints the
`~/.codex/config.toml` snippet after writing so you can add it manually.

## Global options

| Option | Meaning |
|--------|---------|
| `--config <path>` | Path to `oidcdoctor.json` (commands that read config). |
| `-h, --help` | Print help. |
| `-v, --version` | Print version. |
