---
title: Models & pricing
description: How tokcost maps model names to tiktoken encodings, the approximate input-pricing table, and the Claude/Gemini approximation caveats.
---

`tokcost` never asks you for an encoding directly — you pass a **model name** and
it resolves the encoding for you. Whatever encoding it lands on is printed next
to every result, so the number is always traceable.

## Model → encoding mapping

The match is **prefix-based and case-insensitive**, so versioned names like
`gpt-4o-2024-08-06` or `claude-3.5-sonnet-latest` resolve to the same encoding as
their base name.

| Model names | Encoding | Exact? |
| --- | --- | --- |
| `gpt-4o`, `gpt-4.1`, `gpt-5`, the `o`-series (`o1` / `o3` / `o4`), `chatgpt-4o` | `o200k_base` | Yes |
| `gpt-4` and `gpt-4-*`, `gpt-3.5` | `cl100k_base` | Yes |
| `claude-*` | `o200k_base` | Approximate |
| `gemini-*` | `o200k_base` | Approximate |
| anything unrecognized | `o200k_base` | Best-effort |

The older OpenAI families (`gpt-4`, `gpt-3.5`) are checked **before** the broad
`gpt-4o` / `gpt-4.1` prefixes, so `gpt-4` lands on `cl100k_base` while `gpt-4o`
lands on `o200k_base`. Anything `tokcost` doesn't recognize falls back to the
modern `o200k_base` encoding rather than failing.

## The approximation caveat

Token counts are **exact for OpenAI models** — `gpt-tokenizer` ships the same
BPE merges OpenAI uses.

Anthropic and Google do **not** publish a JavaScript tokenizer. For `claude-*`
and `gemini-*` model names, `tokcost` approximates with OpenAI's `o200k_base`
encoding. The counts will be close but are **not ground truth** — treat them as
estimates for budgeting and gut-checks, not as the exact number those providers
will bill you for.

The default model is `gpt-4o` (`o200k_base`) when you don't pass `-m`.

## Pricing table

The `--cost` flag multiplies your token count by an **approximate input price**
(USD per 1,000,000 tokens) from a small, hand-maintained table:

| Model | Input price (USD / 1M tokens) |
| --- | --- |
| `gpt-4o` | $2.50 |
| `gpt-4o-mini` | $0.15 |
| `gpt-4.1` | $2.00 |
| `o3` | $2.00 |
| `claude-3.5-sonnet` | $3.00 |
| `claude-3.5-haiku` | $0.80 |
| `gemini-2.0-flash` | $0.10 |

Price lookup tries an exact match first, then a normalized/prefix match — so a
versioned name like `claude-3.5-sonnet-20241022` still resolves to the
`claude-3.5-sonnet` row.

### Pricing caveats

- **Input only.** The table prices input tokens. Output tokens, cached tokens,
  and other line items are not modeled.
- **Approximate, not billing.** Providers change prices often. These figures are
  a rough gut-check — never reconcile a bill against them.
- **Unknown models report unavailable.** If a model isn't in the table, the CLI
  prints `cost unavailable` (and the JSON `cost.available` is `false`).

### Editing the table

The prices live in `src/models.ts` as the `INPUT_PRICE_PER_MTOK` record. Edit
that table to add models or update figures to match your contract, then rebuild.
The same table backs both the CLI's `--cost` flag and the library's
[`estimateCost`](/tokcost/api/#estimatecosttokens-model).

## See also

- [CLI reference](/tokcost/cli/) — using `-m` and `--cost`.
- [Library API](/tokcost/api/) — `resolveEncoding`, `estimateCost`, and `INPUT_PRICE_PER_MTOK`.
