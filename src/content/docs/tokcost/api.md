---
title: Library API
description: Import tokcost into your own code — countTokens, estimateCost, and resolveEncoding.
---

`tokcost` ships its core as an importable library. The CLI is a thin wrapper
over the same functions, so you can count tokens and estimate cost directly from
your own code.

```ts
import { countTokens, estimateCost, resolveEncoding } from "tokcost";
```

## `countTokens(text, model?)`

Counts the tokens in `text`. The optional `model` selects the encoding; it
defaults to `gpt-4o`.

```ts
countTokens("hello world");            // => number (uses gpt-4o by default)
countTokens("hello world", "gpt-4");   // => number (uses cl100k_base)
```

Returns the token count as a `number`.

## `resolveEncoding(model)`

Resolves a model name to the tiktoken encoding `tokcost` will use for it.

```ts
resolveEncoding("claude-3.5-sonnet");  // => "o200k_base"
```

`gpt-4o`, `gpt-4.1`, `gpt-5`, the `o`-series, and (as an approximation)
`claude-*` and `gemini-*` map to `o200k_base`; `gpt-4` and `gpt-3.5` map to
`cl100k_base`.

## `estimateCost(tokens, model)`

Estimates the input cost for a token count, using the built-in approximate price
table.

```ts
const tokens = countTokens(text, "gpt-4o");
const cost = estimateCost(tokens, "gpt-4o");
// => { usd: number | undefined, available: boolean, pricePerMTok: number | undefined }
```

When the model is not in the price table, `available` is `false` and `usd` /
`pricePerMTok` are `undefined`. The prices are approximate input figures (USD
per 1M tokens) — a gut-check, not billing. See the
[pricing caveat](/tokcost/usage/#estimating-cost) for the list of priced models.
