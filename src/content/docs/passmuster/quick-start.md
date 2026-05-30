---
title: Quick start
description: From install to a self-correcting LLM call in three steps.
---

## 1. Install

```bash
npm install passmuster
# or: pnpm add passmuster · yarn add passmuster
```

Zero runtime dependencies. Requires Node ≥ 18. Schema checks work with any
[Standard Schema](https://standardschema.dev) library (Zod, Valibot, ArkType) —
install whichever you already use.

## 2. Declare what "good" means

```ts
import { passMuster, schemaCheck, check, judge } from "passmuster";
import { z } from "zod";

const Plan = z.object({
  title: z.string().min(1),
  steps: z.array(z.string()).min(1),
});
```

## 3. Generate, verify, retry

```ts
const result = await passMuster({
  // Called once per attempt. After the first, `feedback` carries the failures.
  generate: async ({ feedback }) => {
    const raw = await myModel.complete(buildPrompt(task, feedback?.text));
    return JSON.parse(raw);
  },
  checks: [
    schemaCheck(Plan),
    check("no-todos", (p) => !JSON.stringify(p).includes("TODO") || "remove TODO placeholders"),
    judge("actionable", {
      ask: (p) => `Are these steps concrete and actionable? Reply PASS or FAIL: reason.\n${JSON.stringify(p)}`,
      complete: (prompt) => myModel.complete(prompt),
    }),
  ],
  maxAttempts: 3,
});

if (result.ok) {
  use(result.value);
} else {
  console.warn("gave up after", result.usedAttempts, "attempts:", result.attempts.at(-1)?.failures);
}
```

`passMuster` runs your `generate`, checks the result, and — if anything fails —
calls `generate` again with the failures as feedback, up to `maxAttempts`. It
returns `{ ok, value, attempts, usedAttempts }`.

That's the whole idea. Next: the [three kinds of check](/passmuster/checks/).
