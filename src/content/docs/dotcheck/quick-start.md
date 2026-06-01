---
title: Quick start
description: From install to a working .env contract check, then a CI gate, in a few steps.
---

## 1. Install

```bash
npm install --save-dev dotcheck
# or: pnpm add -D dotcheck  ·  yarn add -D dotcheck
```

You can also run it without installing via `npx dotcheck`.

## 2. Commit a contract

`dotcheck` checks your real `.env` against an `.env.example` — the contract that
lists every variable the app needs. If you don't have one yet, create it next to
your `.env` and commit it:

```bash
# .env.example  (committed)
API_KEY=
LOG_LEVEL=
```

Leave the values blank — the example documents the *keys*, not the secrets. Your
`.env` stays gitignored.

## 3. Run it

From the project root, with no arguments:

```bash
npx dotcheck
```

`dotcheck` auto-detects `.env` and `.env.example` in the current directory,
compares them, prints a report, and exits non-zero if anything has drifted.

```ansi
Missing (1)
  • LOG_LEVEL

Empty (1)
  • API_KEY

Extra (1)
  • EXTRA_THING
```

## 4. Read the report

Each section maps to a kind of drift:

- **Missing** — the example expects the key, your `.env` doesn't set it. Add it.
- **Empty** — the key is present but its value is blank. Fill it in.
- **Extra** — your `.env` has a key the example doesn't list. Add it to the
  example, or pass `--allow-extra` if it's intentionally local.

Fix the drift and run again until you get the clean line and an exit code of `0`:

```ansi
All environment variables present.
```

## 5. Gate your PRs

Drop a step into your pipeline so a drifted contract fails the build. Since
`.env` is usually gitignored, check the example against itself (or against an
`.env` you materialise from secrets — see [CI](/dotcheck/ci/)):

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
      - run: npx dotcheck --env .env.example --example .env.example
```

That's it — a non-zero exit fails the job with no extra wiring. See the
[CLI reference](/dotcheck/cli/) for every flag and exit code.
