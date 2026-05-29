---
title: Quick start
description: From zero to a working prompt-budget check in four steps.
---

## 1. Install

```bash
npm install --save-dev promptsize
# or: pnpm add -D promptsize  ·  yarn add -D promptsize
```

Requires Node ≥ 18.3. You can also run it without installing via `npx promptsize`.

## 2. Add a config

Create `promptsize.config.json` in your project root:

```json
{
  "tokenizer": "o200k_base",
  "limits": [
    { "name": "system prompt", "path": "prompts/system.md", "limit": "2k" },
    { "name": "few-shot examples", "path": "prompts/examples/*.md", "limit": 8000 }
  ]
}
```

Each entry points at a file or glob and sets a token budget. See
[Configuration](/promptsize/configuration/) for every option.

## 3. Run it

```bash
npx promptsize
```

```ansi
  promptsize

  system prompt
  Limit:  2 K tokens
  Size:   1.84 K tokens  (o200k_base)
  ✔ within budget

  few-shot examples
  Limit:  8 K tokens
  Size:   9.2 K tokens  (o200k_base)
  ✘ over budget by 1.2 K tokens

  1 prompt over budget.
```

The command exits `1` when any prompt is over budget — so it fails CI without
any extra wiring.

## 4. Gate your PRs

Drop in the GitHub Action and every pull request gets a budget check:

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
          why: "true"
```

That's it. The Action posts a job-summary table and an inline annotation on any
prompt that's over budget. See [GitHub Action](/promptsize/github-action/) for
the details.

## Optional: track regressions

Commit a baseline once and every run shows the delta vs the last snapshot:

```bash
npx promptsize --save && git add .promptsize.json
```
