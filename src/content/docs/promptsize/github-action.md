---
title: GitHub Action
description: Gate pull requests on prompt budgets with the promptsize GitHub Action.
---

The `promptsize` Action runs your budget check on every pull request. It's
**self-contained** — a bundled `node20` action with no install step — and it
fails the job, posts a job-summary table, and annotates each over-budget prompt
inline.

## Usage

```yaml
# .github/workflows/promptsize.yml
name: promptsize
on: [pull_request]

jobs:
  budget:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: abdulmunimjemal/promptsize@v1
        with:
          why: "true"               # optional: per-file breakdown in the log
          # config: custom/path.json # optional: non-default config location
```

Your repo needs a [config file](/promptsize/configuration/) and the prompt files
it points at. Nothing else.

## Inputs

| Input | Default | Description |
| --- | --- | --- |
| `config` | *(auto-detect)* | Path to the promptsize config file. |
| `why` | `false` | Show the per-file token breakdown in the log. |

## What it produces

- **Step status** — the job fails when any prompt is over budget (exit `1`).
- **Job summary** — a table of every prompt with tokens, limit, and status,
  rendered on the workflow run page.
- **Annotations** — an inline `::error::` for each over-budget prompt.

## Pinning a version

- `@v1` — the moving major tag. Gets non-breaking updates automatically.
- `@v0.1.0` — pin an exact release for full reproducibility.

```yaml
- uses: abdulmunimjemal/promptsize@v0.1.0   # exact
- uses: abdulmunimjemal/promptsize@v1        # latest v1.x
```

## Prefer the CLI?

If you'd rather not use the Action, run the CLI in any workflow:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
- run: npx promptsize --why
```
