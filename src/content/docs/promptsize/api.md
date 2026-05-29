---
title: Programmatic API
description: Use promptsize as a library — analyze, loadConfig, countTokens, and more.
---

The CLI is the primary interface, but the same machinery is exported for
embedding in custom tooling.

```ts
import { loadConfig, analyze, countTokens } from "promptsize";

const { config, dir } = await loadConfig();
const result = await analyze(config, { baseDir: dir });

console.log(result.ok); // boolean — true when every prompt is within budget
for (const entry of result.entries) {
  console.log(entry.name, entry.tokens, "/", entry.limit, entry.passed);
}
```

## Exports

### `countTokens(text, encodingOrModel?)`

```ts
function countTokens(text: string, encodingOrModel?: string): Promise<number>;
```

Count the tokens in a string. `encodingOrModel` accepts an encoding name
(`o200k_base`, `cl100k_base`, `p50k_base`, `r50k_base`) or a model name
(`gpt-4o`, `gpt-4`, `claude-*`, `gemini-*`). Defaults to `o200k_base`.

```ts
await countTokens("You are a helpful assistant.", "gpt-4o"); // → number
```

### `loadConfig(explicitPath?, cwd?)`

```ts
function loadConfig(explicitPath?: string, cwd?: string): Promise<LoadedConfig>;
// LoadedConfig = { config: PromptSizeConfig; filepath: string; dir: string }
```

Resolve and validate configuration (explicit path → `promptsize.config.*` →
`package.json#promptsize`). `dir` is what globs and the baseline resolve against.

### `analyze(config, options)`

```ts
function analyze(
  config: PromptSizeConfig,
  options: { baseDir: string; baseline?: Baseline },
): Promise<AnalysisResult>;
```

Evaluate every budget. Returns `{ entries, ok }`. Each entry reports `tokens`,
`limit`, `passed`, `overBy`, `delta` (vs baseline, or `null`), the `files` and
their per-file tokens, the `encoding` used, and an `error` if it couldn't be
evaluated. `analyze` never throws on a per-entry problem — it captures it in
`entry.error`.

### `resolveEncoding(nameOrModel?)`

```ts
function resolveEncoding(nameOrModel?: string): EncodingName;
```

Resolve a model/encoding name to a concrete encoding. Throws on an unknown name.

### Baseline helpers

```ts
import { loadBaseline, saveBaseline, BASELINE_FILE } from "promptsize";

const baseline = await loadBaseline(dir);          // Baseline | undefined
await saveBaseline(dir, result);                   // writes .promptsize.json
```

### Reporting helpers

```ts
import { renderReport, toJson, formatTokens } from "promptsize";

process.stdout.write(renderReport(result, { why: true })); // human report
const data = toJson(result);                                // plain object
formatTokens(1840);                                         // "1.84 K"
```

## Types

`PromptSizeConfig`, `PromptEntry`, `LoadedConfig`, `AnalysisResult`,
`EntryResult`, `FileResult`, `Baseline`, `EncodingName`, and `ReportOptions` are
all exported for use in your own typed code.
