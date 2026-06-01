---
title: CLI
description: The tokcost command — every flag, multi-file totals, the JSON shape, exit codes, and examples.
---

```bash
tokcost [options] [files...]
cat file.md | tokcost [options]
```

`tokcost` counts the tokens in one or more files, or in text piped on stdin,
prints the count along with the model and encoding it used, and (with `--cost`)
estimates the input dollars. With no input it prints an error and exits non-zero.

## Inputs

`tokcost` gathers its input in one of two ways:

- **Files** — every positional argument is read as a file path. Pass one file
  for a single count, or several for per-file counts plus a combined total.
- **Stdin** — when no files are given and stdin is piped (not a TTY), `tokcost`
  reads all of stdin and counts it as `<stdin>`.

If you pass no files and stdin is a terminal, `tokcost` exits with an error
telling you to pass a file or pipe text in.

## Options

| Flag | Description |
| --- | --- |
| `-m, --model <name>` | Model to count for (default `gpt-4o`). Selects the tiktoken encoding. |
| `--cost` | Estimate input `$` using the built-in approximate price table. |
| `--json` | Output machine-readable JSON. |
| `-h, --help` | Show help and exit. |
| `-v, --version` | Show the version and exit. |

The model name selects the encoding — see [Models & pricing](/tokcost/models/)
for the full mapping. The encoding actually used is always printed, so the
number is traceable.

## Single file

```bash
tokcost prompt.md
```

```ansi
[1m42[0m tokens [2m(prompt.md)[0m
[2mmodel: gpt-4o  encoding: o200k_base[0m
```

## Multiple files & totals

Pass several files to get a tab-separated count per file plus a `total` line:

```bash
tokcost system.md examples.md tools.md
```

```ansi
[1m214[0m	system.md
[1m1840[0m	examples.md
[1m96[0m	tools.md
[1m2150[0m	total
[2mmodel: gpt-4o  encoding: o200k_base[0m
```

The `total` is the sum of every file's tokens. When you add `--cost`, the
estimate is computed against that combined total.

## Estimating cost

```bash
tokcost --cost -m gpt-4o prompt.md
```

```ansi
[1m42[0m tokens [2m(prompt.md)[0m
[2mmodel: gpt-4o  encoding: o200k_base[0m
[2m≈[0m [1m$0.0001[0m (input)[2m  — approximate, editable pricing[0m
```

When the model isn't in the pricing table, the cost line instead reads:

```ansi
[2mcost unavailable — model 'davinci' is not in the pricing table[0m
```

## JSON output

`--json` emits a structured object and suppresses the colored human output:

```bash
tokcost --json prompt.md
```

```json
{
  "model": "gpt-4o",
  "encoding": "o200k_base",
  "files": [{ "name": "prompt.md", "tokens": 42 }],
  "total": 42
}
```

With `--cost`, a `cost` object is added. `usd` and `pricePerMTokUsd` are `null`
when the model isn't priced:

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

| Field | Type | Notes |
| --- | --- | --- |
| `model` | `string` | The model name that was requested. |
| `encoding` | `string` | The tiktoken encoding actually used. |
| `files[]` | `array` | One `{ name, tokens }` per input (or a single `<stdin>` entry). |
| `total` | `number` | Sum of every file's tokens. |
| `cost` | `object?` | Present only with `--cost`. See above. |

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Success. |
| `2` | Error — e.g. an unreadable file, an invalid flag, or no input. |

A `0` / `2` split makes `tokcost` easy to wire into scripts: any non-zero exit is
a hard failure (bad model name, missing file, empty stdin), not an over-budget
signal.

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

Count for an older OpenAI model that uses `cl100k_base`:

```bash
tokcost -m gpt-4 prompt.md
```
