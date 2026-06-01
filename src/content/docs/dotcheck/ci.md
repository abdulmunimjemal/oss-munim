---
title: CI
description: Use dotcheck as a CI gate so a drifted .env contract fails the build.
---

`dotcheck` exits non-zero when your env contract has drifted, so it works as a
CI gate with no extra wiring — a failing check stops the build before a missing
or empty variable reaches production. There's no Action to install: it's just
the CLI, run in any workflow.

## GitHub Actions

```yaml
# .github/workflows/dotcheck.yml
name: env
on: [push, pull_request]

jobs:
  dotcheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      # In CI you usually only commit .env.example, so check the example
      # against itself, or against an .env you materialise from secrets.
      - run: npx dotcheck --env .env.example --example .env.example
```

The step fails the moment `dotcheck` exits non-zero, and the report is printed
to the job log so you can see exactly which keys drifted.

## What to check against

In most repos `.env` is gitignored and only `.env.example` is committed, so
there's no real `.env` for the job to read. Two common patterns:

- **Self-check the example.** Run `dotcheck --env .env.example --example
  .env.example` to confirm the contract has no empty required keys and parses
  cleanly. This catches a malformed or half-finished example before it lands —
  every key compares against itself, so the only way it fails is a blank value
  or an unreadable file.
- **Materialise an `.env` from secrets.** Write the values your deploy actually
  uses (from GitHub Actions secrets) into an `.env`, then run `dotcheck` against
  the committed example to verify nothing required is missing or blank.

```yaml
      - run: |
          cat > .env <<EOF
          API_KEY=${{ secrets.API_KEY }}
          LOG_LEVEL=${{ vars.LOG_LEVEL }}
          EOF
      - run: npx dotcheck --allow-extra
```

Use `--allow-extra` when the materialised `.env` legitimately carries keys the
example doesn't list, so only **missing** and **empty** keys fail the job.

## Pinning a version

CI is the place you most want reproducibility. Pin `dotcheck` to an exact
version so a future release can't change the gate's behaviour under you:

```yaml
      - run: npx dotcheck@0.1.0 --env .env.example --example .env.example
```

Or add it to `devDependencies` (with a lockfile) and run the installed binary
instead of `npx`, so the version is resolved from your lockfile:

```yaml
      - run: npm ci
      - run: npx dotcheck --env .env.example --example .env.example
```

## Other CI systems

There's nothing GitHub-specific here — any runner that can execute a shell step
and read the exit code works. For example, GitLab CI:

```yaml
dotcheck:
  image: node:20
  script:
    - npx dotcheck --env .env.example --example .env.example
```

## Exit codes

The job's pass/fail follows the CLI exit code:

| Code | Result |
| --- | --- |
| `0` | All environment variables present — the step passes. |
| `1` | Missing / empty (or extra, unless `--allow-extra`) — the step fails. |
| `2` | Runtime error (e.g. the example file could not be read) — the step fails. |

See the [CLI reference](/dotcheck/cli/) for the full list of flags and exit codes.
