---
title: API
description: passmuster's full API — passMuster, check builders, and types.
---

## `passMuster(options) → Promise<PassMusterResult<T>>`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `generate` | `(args: { attempt: number; feedback?: Feedback }) => T \| Promise<T>` | — | Produce a candidate. Called once per attempt. |
| `checks` | `Check<T>[]` | — | Verifiers every candidate must pass. |
| `maxAttempts` | `number` | `3` | Max generate attempts. |
| `stopOnFirstFailure` | `boolean` | `false` | Stop checking at the first failure each attempt. |
| `throwOnFail` | `boolean` | `false` | Throw `PassMusterError` instead of returning `{ ok: false }`. |
| `onAttempt` | `(attempt: Attempt<T>) => void` | — | Called after each attempt. |

**Returns** `PassMusterResult<T>`:

```ts
interface PassMusterResult<T> {
  ok: boolean;              // true when an attempt passed every check
  value: T;                 // the passing value, or the last attempt's value
  attempts: Attempt<T>[];   // full trail
  usedAttempts: number;
}

interface Attempt<T> {
  attempt: number;          // 1-based
  value: T;
  failures: { check: string; message: string }[];
  passed: boolean;
}
```

## Check builders

### `check(name, fn)`

```ts
function check<T>(
  name: string,
  fn: (value: T, ctx: { attempt: number }) => CheckResult | Promise<CheckResult>,
): Check<T>;

type CheckResult = true | string | { message: string; [key: string]: unknown };
```

### `schemaCheck(schema, name?)`

```ts
function schemaCheck<T>(schema: StandardSchemaLike, name?: string): Check<T>;
```

Accepts any [Standard Schema](https://standardschema.dev) (Zod, Valibot,
ArkType). Reports schema issues (with paths) as the failure reason.

### `judge(name, options)`

```ts
function judge<T>(name: string, options: {
  ask: (value: T) => string;
  complete: (prompt: string) => string | Promise<string>;
  interpret?: (response: string) => CheckResult; // default: PASS/FAIL parsing
}): Check<T>;
```

## Helpers & errors

```ts
import { buildFeedback, toMessage, PassMusterError } from "passmuster";

buildFeedback(failures); // → { failures, text } — for custom retry loops
toMessage(result);       // normalize a failing CheckResult to a string

// thrown when throwOnFail is set and no attempt passed
catch (err) {
  if (err instanceof PassMusterError) console.log(err.attempts);
}
```

## Exported types

`Check`, `CheckContext`, `CheckResult`, `Failure`, `Feedback`, `GenerateArgs`,
`Attempt`, `PassMusterResult`, `PassMusterOptions`, `JudgeOptions`, and
`StandardSchemaLike` are all exported.
