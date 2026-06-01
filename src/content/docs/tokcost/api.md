---
title: Library API
description: Use tokcost as a library — countTokens, estimateCost, resolveEncoding, lookupInputPrice, and the exported types.
---

`tokcost` ships its core as an importable library. The CLI is a thin wrapper over
these same functions, so you can count tokens and estimate cost directly from
your own code — offline and deterministically, with no network and no API key.

```ts
import {
  countTokens,
  estimateCost,
  resolveEncoding,
  lookupInputPrice,
  INPUT_PRICE_PER_MTOK,
  DEFAULT_MODEL,
} from "tokcost";
```

The package is ESM-only (`"type": "module"`) and ships TypeScript types.

## `countTokens(text, model?)`

```ts
function countTokens(text: string, model?: string): number;
```

Counts the tokens in `text`. The optional `model` selects the encoding (see
[`resolveEncoding`](#resolveencodingmodel)) and defaults to `DEFAULT_MODEL`
(`"gpt-4o"`). Empty input returns `0`. Counting is deterministic and offline.

```ts
countTokens("hello world");            // => number (uses gpt-4o → o200k_base)
countTokens("hello world", "gpt-4");   // => number (uses cl100k_base)
countTokens("");                       // => 0
```

## `resolveEncoding(model)`

```ts
function resolveEncoding(model: string): EncodingName;
// EncodingName = "o200k_base" | "cl100k_base"
```

Resolves a model name to the tiktoken encoding `tokcost` will use for it. The
match is prefix-based and case-insensitive, so versioned names resolve
correctly. Unknown models default to `o200k_base` (it never throws).

```ts
resolveEncoding("gpt-4o");                  // => "o200k_base"
resolveEncoding("gpt-4");                   // => "cl100k_base"
resolveEncoding("claude-3.5-sonnet");       // => "o200k_base" (approximation)
resolveEncoding("gpt-4o-2024-08-06");       // => "o200k_base"
```

See [Models & pricing](/tokcost/models/) for the full mapping and the
Claude/Gemini approximation caveat.

## `estimateCost(tokens, model)`

```ts
function estimateCost(tokens: number, model: string): CostEstimate;

interface CostEstimate {
  usd: number | undefined;          // estimate, or undefined if unpriced
  available: boolean;               // whether a price was found
  pricePerMTok: number | undefined; // input price (USD per 1M tokens) used
}
```

Estimates the input cost for a token count using the built-in approximate price
table. When the model isn't in the table, `available` is `false` and `usd` /
`pricePerMTok` are `undefined`.

```ts
const tokens = countTokens(text, "gpt-4o");
const cost = estimateCost(tokens, "gpt-4o");
// => { usd: 0.000105, available: true, pricePerMTok: 2.5 }

estimateCost(1000, "davinci");
// => { usd: undefined, available: false, pricePerMTok: undefined }
```

The prices are approximate **input** figures (USD per 1M tokens) — a gut-check,
not billing. See [Models & pricing](/tokcost/models/#pricing-table) for the list
of priced models.

## `lookupInputPrice(model)`

```ts
function lookupInputPrice(model: string): number | undefined;
```

Returns the approximate input price (USD per 1M tokens) for a model, or
`undefined` if it isn't in the table. Tries an exact match first, then a
normalized/prefix match so versioned names still resolve. This is the lookup that
backs `estimateCost`.

```ts
lookupInputPrice("gpt-4o");                     // => 2.5
lookupInputPrice("claude-3.5-sonnet-20241022"); // => 3.0 (prefix match)
lookupInputPrice("unknown-model");              // => undefined
```

## `INPUT_PRICE_PER_MTOK`

```ts
const INPUT_PRICE_PER_MTOK: Readonly<Record<string, number>>;
```

The raw price table — model name → input price in USD per 1M tokens. Exported so
you can read or extend it in your own tooling.

```ts
INPUT_PRICE_PER_MTOK["gpt-4o"]; // => 2.5
```

## `DEFAULT_MODEL`

```ts
const DEFAULT_MODEL = "gpt-4o";
```

The model used when none is supplied to `countTokens`.

## Types

The following are exported for use in your own typed code:

| Type | Shape |
| --- | --- |
| `EncodingName` | `"o200k_base" \| "cl100k_base"` |
| `CostEstimate` | `{ usd?: number; available: boolean; pricePerMTok?: number }` |

## Putting it together

```ts
import { countTokens, estimateCost, resolveEncoding } from "tokcost";

function report(text: string, model = "gpt-4o") {
  const tokens = countTokens(text, model);
  const { usd, available } = estimateCost(tokens, model);
  return {
    encoding: resolveEncoding(model),
    tokens,
    usd: available ? usd : null,
  };
}
```
