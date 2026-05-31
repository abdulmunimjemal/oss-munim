---
title: API
description: The dotcheck library API — parseEnv and compareEnv, with their types.
---

`dotcheck` ships a library alongside the CLI, so you can wire env validation
into your own scripts and tooling.

```ts
import { parseEnv, compareEnv } from "dotcheck";
import type { CompareResult } from "dotcheck";

const env = parseEnv("FOO=bar\nexport BAZ='qux'");
// → { FOO: "bar", BAZ: "qux" }

const result: CompareResult = compareEnv({
  env,
  example: { FOO: "", BAZ: "", MISSING: "" },
  allowExtra: false,
});
// → { missing: ["MISSING"], extra: [], empty: [], ok: false }
```

## `parseEnv(text: string): Record<string, string>`

A small, robust dotenv parser. Handles:

- `KEY=value` and `export KEY=value`
- single- and double-quoted values (with `\n` / `\t` / `\r` escapes inside
  double quotes)
- empty values
- `#` comments — full-line and trailing on unquoted values
- blank lines
- `=` characters inside values

## `compareEnv(options): CompareResult`

Compares a parsed env against a parsed example and reports the drift.

```ts
interface CompareOptions {
  env: Record<string, string>;
  example: Record<string, string>;
  allowExtra?: boolean;
}

interface CompareResult {
  missing: string[]; // in example, absent from env
  extra: string[];   // in env, absent from example
  empty: string[];   // in both, but empty in env
  ok: boolean;       // overall pass/fail given allowExtra
}
```

When `allowExtra` is `true`, keys in `extra` no longer count against `ok` —
only `missing` and `empty` keys fail the comparison.
