---
title: API
description: Use envvet as a library — parseEnv, compareEnv, and the CompareOptions / CompareResult types.
---

The CLI is the primary interface, but the same machinery is exported so you can
wire env validation into your own scripts and tooling. Two functions and two
types — no config, no side effects.

```ts
import { parseEnv, compareEnv } from "envvet";
import type { CompareOptions, CompareResult } from "envvet";

const env = parseEnv("FOO=bar\nexport BAZ='qux'");
// → { FOO: "bar", BAZ: "qux" }

const result: CompareResult = compareEnv({
  env,
  example: { FOO: "", BAZ: "", MISSING: "" },
  allowExtra: false,
});
// → { missing: ["MISSING"], extra: [], empty: [], ok: false }
```

## Exports

### `parseEnv(text)`

```ts
function parseEnv(text: string): Record<string, string>;
```

A small, robust dotenv parser. It takes the raw text of an env file and returns
a plain object of key → value. It handles:

- `KEY=value` and `export KEY=value`
- single- and double-quoted values (quotes stripped); `\n` / `\t` / `\r` escapes
  are expanded inside **double** quotes, but left literal inside single quotes
- empty values (`KEY=`)
- `#` comments — full-line, and trailing on unquoted values (after whitespace)
- blank lines, and CRLF or LF line endings
- `=` characters inside the value (only the first `=` splits key from value)

Lines without an `=`, and lines whose key isn't a valid identifier
(`[A-Za-z_][A-Za-z0-9_.]*`), are skipped rather than throwing.

```ts
parseEnv('PORT=3000\n# comment\nexport TOKEN="a\\tb"  # trailing');
// → { PORT: "3000", TOKEN: "a\tb" }
```

### `compareEnv(options)`

```ts
function compareEnv(options: CompareOptions): CompareResult;
```

Compares a parsed env against a parsed example and reports the drift. The
example is the contract: a key is "required" when the example defines it. A
required key is reported as `empty` when it exists in `env` but its value is
blank (after trimming whitespace), and as `missing` when it's absent entirely. A
key present in `env` but not in the example is `extra`.

```ts
compareEnv({
  env: { API_KEY: "", PORT: "3000", DEBUG: "1" },
  example: { API_KEY: "", PORT: "", LOG_LEVEL: "" },
});
// → {
//     missing: ["LOG_LEVEL"],  // in example, absent from env
//     extra:   ["DEBUG"],      // in env, absent from example
//     empty:   ["API_KEY"],    // present but blank
//     ok:      false,
//   }
```

`compareEnv` never reads the filesystem or throws on drift — it's a pure
function over two objects, so it's easy to test and embed.

## Types

### `CompareOptions`

```ts
interface CompareOptions {
  env: Record<string, string>;
  example: Record<string, string>;
  allowExtra?: boolean;
}
```

| Field | Type | Notes |
| --- | --- | --- |
| `env` | `Record<string, string>` | Parsed contents of the `.env` file. |
| `example` | `Record<string, string>` | Parsed contents of the `.env.example` (the contract). |
| `allowExtra` | `boolean?` | When `true`, keys in `env` but absent from the example don't count against `ok`. Default `false`. |

### `CompareResult`

```ts
interface CompareResult {
  missing: string[]; // in example, absent from env
  extra: string[];   // in env, absent from example
  empty: string[];   // in both, but empty in env
  ok: boolean;       // overall pass/fail given allowExtra
}
```

`ok` is `true` only when `missing` and `empty` are both empty **and** either
`allowExtra` is `true` or `extra` is empty. When `allowExtra` is `true`, keys in
`extra` are still listed — they just no longer fail the comparison. This is the
same object the CLI emits with `--json`.

## Putting it together

The CLI is a thin wrapper over these two functions — read the files, parse,
compare, report:

```ts
import { readFileSync } from "node:fs";
import { parseEnv, compareEnv } from "envvet";

const result = compareEnv({
  env: parseEnv(readFileSync(".env", "utf8")),
  example: parseEnv(readFileSync(".env.example", "utf8")),
});

if (!result.ok) {
  console.error("env drift:", result);
  process.exit(1);
}
```
