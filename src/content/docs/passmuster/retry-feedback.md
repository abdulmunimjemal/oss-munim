---
title: Retry with feedback
description: How passmuster feeds failures back into the next attempt so the model self-corrects.
---

The point of passmuster isn't just to *reject* bad output — it's to help the
model produce good output. When an attempt fails, every failure is collected and
handed to the next `generate` call as `feedback`.

## The flow

```ts
generate: async ({ attempt, feedback }) => {
  const prompt = feedback
    ? `${basePrompt}\n\n${feedback.text}`   // splice the failures back in
    : basePrompt;                            // first attempt: no feedback
  return parse(await model.complete(prompt));
};
```

- On **attempt 1**, `feedback` is `undefined`.
- On every later attempt, `feedback` describes what failed last time.

## What `feedback` contains

```ts
interface Feedback {
  failures: { check: string; message: string }[];
  text: string; // pre-formatted, ready to splice into a prompt
}
```

`feedback.text` reads like:

```
The previous output failed these checks:
- [no-todos] remove TODO placeholders
- [actionable] FAIL: step 2 is vague
Fix every issue above and produce a corrected output.
```

Use `feedback.text` for the quick path, or build your own message from
`feedback.failures` if you want full control over how corrections are phrased.

## Tuning the loop

- **`maxAttempts`** (default `3`) — the ceiling on tries. The loop stops early the
  moment an attempt passes.
- **`stopOnFirstFailure`** — only report the first failing check each attempt.
  Cheaper, but the model gets narrower feedback.
- **`onAttempt`** — observe each attempt as it happens (logging, metrics).
- **`throwOnFail`** — throw `PassMusterError` (with the full `attempts` trail)
  instead of returning `{ ok: false }`.

```ts
const { ok, value, attempts } = await passMuster({
  generate,
  checks,
  maxAttempts: 4,
  onAttempt: (a) => logger.info(`attempt ${a.attempt}: ${a.passed ? "pass" : a.failures.length + " failed"}`),
});
```

## A note on cost

Each retry is another model call (plus any judge calls). Keep `maxAttempts`
modest, put cheap checks first, and reach for `stopOnFirstFailure` when a later
LLM-judge check is pointless once a structural check has already failed.
