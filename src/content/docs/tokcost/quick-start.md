---
title: Quick start
description: Install tokcost, count a file, pipe stdin, add --cost, and read JSON — in a few clear steps.
---

## 1. Install

```bash
# global CLI
npm install -g tokcost

# or as a project dependency / library
pnpm add tokcost
```

Requires Node.js ≥ 18. You can also run it without installing via
`npx tokcost`.

## 2. Count a file

Pass a file and `tokcost` prints its token count, the model, and the encoding it
used:

```bash
tokcost prompt.md
```

```ansi
[1m42[0m tokens [2m(prompt.md)[0m
[2mmodel: gpt-4o  encoding: o200k_base[0m
```

The default model is `gpt-4o`, which maps to the `o200k_base` encoding.

## 3. Pipe text in over stdin

Handy for quick one-offs or composing with other tools — pipe text in and
`tokcost` counts it as `<stdin>`:

```bash
cat prompt.md | tokcost
echo "hello world" | tokcost
```

```ansi
[1m2[0m tokens [2m(<stdin>)[0m
[2mmodel: gpt-4o  encoding: o200k_base[0m
```

## 4. Estimate cost with `--cost`

Add `--cost` to estimate the input dollars for the counted tokens, using the
built-in approximate price table:

```bash
tokcost --cost -m gpt-4o prompt.md
```

```ansi
[1m42[0m tokens [2m(prompt.md)[0m
[2mmodel: gpt-4o  encoding: o200k_base[0m
[2m≈[0m [1m$0.0001[0m (input)[2m  — approximate, editable pricing[0m
```

These figures are a rough gut-check, not billing. If the model isn't in the
table, `tokcost` reports cost as unavailable. See
[Models & pricing](/tokcost/models/) for the priced models and the caveats.

## 5. Get machine-readable JSON

Add `--json` to emit a structured object you can pipe into other tooling:

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

With `--cost`, the JSON also carries a `cost` object. Parse it with `jq`:

```bash
echo "hello world" | tokcost --json | jq .total
```

## Next steps

- [CLI reference](/tokcost/cli/) — every flag, multi-file totals, and exit codes.
- [Models & pricing](/tokcost/models/) — the model → encoding mapping and price table.
- [Library API](/tokcost/api/) — import `countTokens` and `estimateCost` into your own code.
