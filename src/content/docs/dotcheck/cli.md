---
title: CLI
description: The dotcheck command — install, flags, exit codes, and examples.
---

```bash
dotcheck [options]
```

Run with no arguments, `dotcheck` auto-detects `.env` and `.env.example` in the
current directory, compares them, prints a report, and exits non-zero if
anything has drifted.

## Install

Add `dotcheck` as a dev dependency:

```bash
npm install --save-dev dotcheck
# or: pnpm add -D dotcheck  ·  yarn add -D dotcheck
```

Install it globally to run it anywhere:

```bash
npm install -g dotcheck
```

Or run it without installing:

```bash
npx dotcheck
```

## Run it

From a project root containing `.env` and `.env.example`:

```bash
dotcheck
```

```ansi
Missing (1)
  • LOG_LEVEL

Empty (1)
  • API_KEY

Extra (1)
  • EXTRA_THING
```

On success:

```ansi
All environment variables present.
```

## Options

| Flag | Default | Description |
| --- | --- | --- |
| `--env <path>` | `.env` | Path to the env file to check. |
| `--example <path>` | `.env.example` | Path to the contract file. |
| `--allow-extra` | `false` | Don't fail on keys present in `.env` but not in the example. |
| `--json` | `false` | Emit machine-readable JSON instead of the report. |
| `-h`, `--help` | | Show help. |
| `-v`, `--version` | | Show the version. |

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | All environment variables present. |
| `1` | Problems found (missing / empty, or extra when not allowed). |
| `2` | Runtime error (e.g. the example file could not be read). |

A missing `.env` is **not** a runtime error — every key is simply reported as
missing, and the command exits `1`. Only an unreadable **example** file (it's
the contract; without it there's nothing to check against) produces exit code
`2`. An unknown flag also exits `2`. These codes make `dotcheck` a drop-in CI
step: a non-zero exit fails the job.

## Examples

Check non-standard paths:

```bash
dotcheck --env config/.env.local --example config/.env.example
```

Allow extra keys in `.env` (only fail on missing or empty):

```bash
dotcheck --allow-extra
```

Machine-readable output for custom tooling:

```bash
dotcheck --json
```

```json
{
  "missing": ["LOG_LEVEL"],
  "extra": ["EXTRA_THING"],
  "empty": ["API_KEY"],
  "ok": false
}
```

The JSON object is the same `CompareResult` returned by the
[library API](/dotcheck/api/), so the CLI and the library report drift
identically. `--json` always exits with the normal exit code (`0` / `1`), so you
can both branch on the output and rely on the status.

## Library API

`dotcheck` ships a small library alongside the CLI, so you can wire env
validation into your own scripts and tooling. See the
[API reference](/dotcheck/api/) for `parseEnv`, `compareEnv`, and their types.
