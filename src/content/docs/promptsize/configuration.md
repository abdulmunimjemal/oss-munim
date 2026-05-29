---
title: Configuration
description: The promptsize config file — formats, fields, and tokenizer selection.
---

## Where config lives

`promptsize` looks for configuration in this order:

1. The path passed to `--config`.
2. `promptsize.config.{ts,mjs,js,cjs,json}` in the current directory.
3. A `"promptsize"` key in `package.json`.

Globs and the baseline file are resolved relative to the config file's location.

## Shape

```json
{
  "tokenizer": "o200k_base",
  "limits": [
    { "name": "system prompt", "path": "prompts/system.md", "limit": "2k" },
    { "name": "few-shot examples", "path": "prompts/examples/*.md", "limit": 8000 },
    { "name": "rag template", "path": "src/rag/*.txt", "limit": "1.5k", "tokenizer": "gpt-4" }
  ]
}
```

A JavaScript/TypeScript config works too — export the object as `default`:

```ts
// promptsize.config.ts
import type { PromptSizeConfig } from "promptsize";

export default {
  tokenizer: "o200k_base",
  limits: [
    { name: "system prompt", path: "prompts/system.md", limit: "2k" },
  ],
} satisfies PromptSizeConfig;
```

## Fields

| Field | Type | Notes |
| --- | --- | --- |
| `tokenizer` | `string` | Default encoding/model for all entries. Default `o200k_base`. |
| `limits[]` | `array` | One budget per logical prompt. Must be non-empty. |
| `limits[].name` | `string?` | Display name and baseline key. Defaults to the joined glob(s). |
| `limits[].path` | `string \| string[]` | File path(s) / glob(s), relative to the config file. |
| `limits[].limit` | `number \| string` | Token budget. `2000`, `"2k"`, `"1.5k"`, `"2 k tokens"` all parse. |
| `limits[].tokenizer` | `string?` | Per-entry override of the tokenizer/model. |

When an entry's `path` matches multiple files, their tokens are **summed** into a
single number and compared to one budget.

## Limit syntax

A budget is a token count. You can write it as:

- a number — `8000`
- a string with a `k`/`m` suffix — `"2k"`, `"1.5k"`, `"1m"`
- with an optional trailing word — `"2k tokens"`

## Tokenizer & model names

Set `tokenizer` to an encoding name or a model name. Model names map to an
encoding by longest-prefix match:

| You write | Encoding used |
| --- | --- |
| `o200k_base`, `gpt-4o`, `gpt-4.1`, `gpt-5`, `o1`/`o3`/`o4` | `o200k_base` |
| `cl100k_base`, `gpt-4`, `gpt-3.5`, `text-embedding-3-*` | `cl100k_base` |
| `claude-*`, `gemini-*` | `o200k_base` *(approximation — see [Why](/promptsize/why/))* |
| `text-davinci-003`, `code-davinci-*` | `p50k_base` |
| `davinci`, `gpt2` | `r50k_base` |

The encoding actually used is printed next to each result, so the number is
always traceable.

## Baseline file

Running `promptsize --save` writes `.promptsize.json` next to your config:

```json
{
  "version": 1,
  "entries": {
    "system prompt": 1840,
    "few-shot examples": 8880
  }
}
```

Commit it. On later runs, `promptsize` shows the delta for each entry
(`+120 vs baseline`), giving you regression visibility even when you're still
within budget.
