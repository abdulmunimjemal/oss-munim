---
title: Usage
description: Install tokcost and use the CLI — count files, pipe stdin, pick a model, estimate cost, and read the flags and exit codes.
---

## Install

```bash
# global CLI
npm install -g tokcost

# or as a project dependency / library
pnpm add tokcost
```

Requires Node.js ≥ 18.

## Counting tokens

Pass a file to count its tokens:

```bash
tokcost prompt.md
```

Pipe text in over stdin — handy for quick one-offs or composing with other
tools:

```bash
cat prompt.md | tokcost
echo "hello world" | tokcost
```

Pass multiple files to get a per-file count plus a combined total:

```bash
tokcost a.md b.md
```

## Picking a model

The `-m, --model` flag selects which model `tokcost` counts for, which in turn
selects the tiktoken encoding. The default is `gpt-4o`.

```bash
tokcost -m gpt-4 prompt.md
```

`tokcost` always prints which encoding it used. Model names map to an encoding:

- **`o200k_base`** — `gpt-4o`, `gpt-4.1`, `gpt-5`, the `o`-series (`o1`/`o3`/`o4`),
  and — **as an approximation** — `claude-*` and `gemini-*`.
- **`cl100k_base`** — `gpt-4` and `gpt-3.5`.

Counts are exact for OpenAI models. There is no public local tokenizer for
Claude or Gemini, so `tokcost` approximates with the closest OpenAI encoding
(`o200k_base`). Treat those counts as estimates, not ground truth.

## Estimating cost

Add `--cost` to estimate the input dollars for the counted tokens:

```bash
tokcost --cost -m gpt-4o prompt.md
```

The estimate comes from a small, hand-maintained table of **approximate** input
prices (USD per 1M tokens) for common models:

`gpt-4o`, `gpt-4o-mini`, `gpt-4.1`, `o3`, `claude-3.5-sonnet`,
`claude-3.5-haiku`, and `gemini-2.0-flash`.

These figures are a rough gut-check, not billing — providers change prices
often. Edit `src/models.ts` to suit your needs. If a model is not in the table,
`tokcost` reports cost as unavailable.

## Machine-readable output

Use `--json` to emit structured output for custom tooling:

```bash
tokcost --json prompt.md
```

```json
{
  "model": "gpt-4o",
  "encoding": "o200k_base",
  "files": [{ "name": "prompt.md", "tokens": 42 }],
  "total": 42,
  "cost": {
    "available": true,
    "usd": 0.000105,
    "pricePerMTokUsd": 2.5,
    "note": "approximate input pricing; edit the table to suit your needs"
  }
}
```

## Flags

| Flag | Description |
| --- | --- |
| `-m, --model <name>` | Model to count for (default `gpt-4o`). Selects the tiktoken encoding. |
| `--cost` | Estimate input `$` using the built-in approximate price table. |
| `--json` | Output machine-readable JSON. |
| `-h, --help` | Show help. |
| `-v, --version` | Show version. |

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Success. |
| `2` | Error — e.g. an unknown model or no input. |

## Examples

Count a file with the default model:

```bash
tokcost prompt.md
```

Count several files at once and read the total:

```bash
tokcost system.md examples.md tools.md
```

Estimate the input cost for a Claude prompt (approximate encoding):

```bash
tokcost --cost -m claude-3.5-sonnet prompt.md
```

Pipe stdin and parse the result with `jq`:

```bash
echo "hello world" | tokcost --json | jq .total
```

## Using it as a library

The CLI is a thin wrapper over an exported API — import `countTokens`,
`estimateCost`, and `resolveEncoding` into your own code. See the
[Library API](/tokcost/api/) page for details.
