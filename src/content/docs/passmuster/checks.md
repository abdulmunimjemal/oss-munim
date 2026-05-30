---
title: Checks
description: The three kinds of check — schema, predicate, and LLM-as-judge — and how to compose them.
---

A **check** inspects a candidate value and returns `true` to pass, or a *reason*
(a string, or an object with a `message`) to fail. All three builders below
produce the same `Check<T>` shape, so they mix freely in the `checks` array and
all drive the same retry loop.

## `schemaCheck(schema, name?)`

Validate against any [Standard Schema](https://standardschema.dev) — Zod,
Valibot, ArkType. No schema library is bundled; passmuster only reads the
standard interface. Failures are reported as schema issues, with paths.

```ts
import { schemaCheck } from "passmuster";
import { z } from "zod";

schemaCheck(z.object({ title: z.string(), tags: z.array(z.string()) }));
// fail → "title: Expected string, received number; tags: Required"
```

## `check(name, fn)`

Any predicate over the value — sync or async. Return `true`, or a reason to fail.

```ts
import { check } from "passmuster";

check("under-budget", (text) => text.length <= 2000 || `too long: ${text.length} chars`);
check("valid-json", (s) => { try { JSON.parse(s); return true; } catch { return "not valid JSON"; } });
check("grounded", async (answer) => (await isGrounded(answer)) || "not grounded in sources");
```

## `judge(name, options)`

An LLM-as-judge check — grade the output with a model. You bring the `complete`
function, so passmuster stays model-agnostic.

```ts
import { judge } from "passmuster";

judge("answers-question", {
  ask: (out) => `Does this fully answer "${question}"? Reply PASS or FAIL: reason.\n\n${out}`,
  complete: (prompt) => anthropic.messages.create(...).then(toText),
});
```

By default the verdict is read as **PASS** when the response contains `PASS`
(and not `FAIL`); anything else fails with the judge's text as the reason.
Override with `interpret` for custom scoring:

```ts
judge("quality", {
  ask: (out) => `Rate 0–1 how well this answers the question:\n${out}`,
  complete,
  interpret: (resp) => (Number(resp.match(/[\d.]+/)?.[0]) >= 0.8 ? true : `too low: ${resp}`),
});
```

## Composing

Order doesn't matter for correctness, but by default **all** checks run each
attempt so the feedback is complete:

```ts
checks: [
  schemaCheck(Plan),                  // structural
  check("no-todos", noTodos),         // cheap predicate
  judge("actionable", actionable),    // expensive, model-graded
]
```

Set `stopOnFirstFailure: true` to short-circuit — useful when a later check is
expensive (an LLM judge) and pointless if an earlier one already failed.
