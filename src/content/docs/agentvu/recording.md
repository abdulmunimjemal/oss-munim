---
title: Recording
description: The agentvu recording library in depth — the event model, createRecorder and its methods, the Vercel AI SDK adapter, and approximate cost estimation.
---

The recording side of agentvu is a small, pure library. You create a
recorder, call a method per thing that happens, and out comes a stream of
JSON-serializable events — optionally appended, one per line, to a JSONL file.
There are no classes with behaviour, no network, and no dependency on any
AI SDK. This page covers the whole write side.

## The event model

An agent run is recorded as a **flat, ordered stream of events**. Every event is
JSON-serializable and carries two common fields:

- `ts` — epoch milliseconds when the event was recorded.
- `type` — a discriminator naming the kind of event.

Because everything is plain data, a stream round-trips losslessly through JSONL:
write it out, read it back, and you have the same events.

### Event types

| `type`        | Fields | Meaning |
| ------------- | ------ | ------- |
| `message`     | `role`, `text` | A chat message produced or consumed by the agent. `role` is `system`, `user`, `assistant`, or `tool`. |
| `model`       | `model`, `prompt`, `durationMs?` | One model invocation (an LLM call / step). `prompt` is a short, human-readable summary of what was sent. |
| `tool-call`   | `name`, `args` | The agent decided to call a tool. `args` is arbitrary JSON. |
| `tool-result` | `name`, `result`, `durationMs?` | A tool finished and returned. `result` is arbitrary JSON. |
| `usage`       | `inputTokens`, `outputTokens`, `model?` | Token usage reported for a model call. |
| `error`       | `message` | Something went wrong. |

The union of all of these is the `AgentEvent` type. Here's the same run from the
example session, as raw JSONL:

```jsonl
{"type":"message","ts":1717200000000,"role":"user","text":"What's the weather in Tokyo and should I bring an umbrella?"}
{"type":"model","ts":1717200000100,"model":"gpt-4o","prompt":"system + user: weather question for Tokyo","durationMs":820}
{"type":"tool-call","ts":1717200000950,"name":"getWeather","args":{"city":"Tokyo","units":"metric"}}
{"type":"tool-result","ts":1717200001210,"name":"getWeather","result":{"tempC":18,"condition":"light rain"},"durationMs":260}
{"type":"usage","ts":1717200001220,"inputTokens":412,"outputTokens":86,"model":"gpt-4o"}
```

### Reading and writing events

A few small helpers move events to and from JSONL. These are the same functions
the CLI uses, and they're exported for your own tooling:

```ts
import { encodeEvent, parseJsonl, isAgentEvent } from "agentvu";

encodeEvent(event);          // → one JSONL line (no trailing newline)
parseJsonl(fileContents);    // → AgentEvent[]
isAgentEvent(value);         // → structural type guard
```

`parseJsonl` is deliberately forgiving: it skips blank lines and silently
ignores any line that doesn't parse or doesn't look like an event. That's what
makes `--follow` safe — a half-written tail line during a live append never
crashes the reader.

## `createRecorder`

`createRecorder(options?)` returns a `Recorder`. Each method records exactly one
event: it builds the full event (stamping `type` and `ts` for you), pushes it
onto an in-memory array, and — when `out` is set — appends one JSONL line to
that file.

```ts
import { createRecorder } from "agentvu";

const rec = createRecorder({ out: "session.jsonl" });
```

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `out` | `string` | *(none)* | If set, every recorded event is appended as one JSONL line to this path. Omit it to record in memory only. |
| `now` | `() => number` | `Date.now` | Clock used to stamp `ts`. Injectable, mainly for deterministic tests. |

### Methods

Each method takes the event's fields **minus** `type` and `ts` (those are filled
in for you), records the event, and returns the fully-formed event object.

```ts
rec.message({ role: "user", text: "Find me a flight." });
rec.model({ model: "gpt-4o", prompt: "plan the search", durationMs: 740 });
rec.toolCall({ name: "searchFlights", args: { from: "ADD", to: "NRT" } });
rec.toolResult({ name: "searchFlights", result: { count: 12 }, durationMs: 310 });
rec.usage({ inputTokens: 540, outputTokens: 120, model: "gpt-4o" });
rec.error({ message: "rate limited" });
```

| Method | Records | Returns |
| --- | --- | --- |
| `message(input)` | a `message` event | `MessageEvent` |
| `model(input)` | a `model` event | `ModelEvent` |
| `toolCall(input)` | a `tool-call` event | `ToolCallEvent` |
| `toolResult(input)` | a `tool-result` event | `ToolResultEvent` |
| `usage(input)` | a `usage` event | `UsageEvent` |
| `error(input)` | an `error` event | `ErrorEvent` |

### Properties and `close()`

```ts
rec.events;   // readonly AgentEvent[] — every event recorded so far, in order
rec.close();  // flush / finish
```

`rec.events` is the in-memory event array, reflecting the same stream that was
written to `out`. `rec.close()` is part of the contract for symmetry; today it's
a no-op because writes are synchronous, but you should still call it when you're
done so your code keeps working if flushing ever becomes asynchronous.

### Side-effect model

Recording is **pure and synchronous**. The only side effect is an isolated,
append-only write to `out` (via `appendFileSync`). There is no buffering to
flush, no background thread, and no network — which is exactly why a partially
written file is safe to tail with `--follow`.

## The Vercel AI SDK adapter

`recordStep(recorder, step)` is the one-line bridge from the
[Vercel AI SDK](https://sdk.vercel.dev/) to agentvu. Pass it as the SDK's
`onStepFinish` callback and every step is recorded:

```ts
import { generateText } from "ai";
import { createRecorder, recordStep } from "agentvu";

const rec = createRecorder({ out: "session.jsonl" });

await generateText({
  model,
  prompt,
  tools,
  maxSteps: 5,
  onStepFinish: (step) => recordStep(rec, step),
});

rec.close();
```

### What it records

For each step, `recordStep` emits events **in order**:

1. **Assistant text** — a `message` event with `role: "assistant"`, but only
   when the step has non-empty text.
2. **Tool calls** — one `tool-call` event per entry in `step.toolCalls`, using
   the call's `toolName` and `args`.
3. **Tool results** — one `tool-result` event per entry in `step.toolResults`,
   using the result's `toolName` and `result`.
4. **Usage** — one `usage` event when the step reports usage.

### Why it doesn't import `ai`

The adapter deliberately does **not** import the `ai` package. It only models
the *shape* of the step object the SDK hands to `onStepFinish`, so agentvu
carries no runtime dependency on `ai` and works across SDK versions. Every field
on the modeled step is optional, so a partial or future-version step degrades
gracefully rather than throwing.

It even smooths over a naming change between SDK versions: usage tokens are read
from `inputTokens`/`outputTokens` if present, otherwise from the older
`promptTokens`/`completionTokens`, defaulting to `0`.

The modeled step looks like this:

```ts
interface AiSdkStep {
  text?: string;
  toolCalls?: { toolName: string; args?: unknown }[];
  toolResults?: { toolName: string; result?: unknown }[];
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    inputTokens?: number;
    outputTokens?: number;
  };
  model?: string;     // some versions surface the resolved model id here
  durationMs?: number;
}
```

## Cost estimation

`costOf(usage)` turns a usage event into an approximate USD figure:

```ts
import { costOf } from "agentvu";

costOf({ inputTokens: 540, outputTokens: 120, model: "gpt-4o" }); // ≈ USD
```

It looks up the model in a small, built-in price table (USD per 1,000,000
tokens), computes `input/1M × inputPrice + output/1M × outputPrice`, and returns
the total. **Unknown models cost `0`** — so a session's totals never become
`NaN` just because one model isn't in the table.

### The price table

`PRICES` is the exported, built-in snapshot. As of the last review (2026-05) it
covers:

| Model | Input ($/1M) | Output ($/1M) |
| --- | --- | --- |
| `gpt-4o` | 2.5 | 10 |
| `gpt-4o-mini` | 0.15 | 0.6 |
| `gpt-4.1` | 2 | 8 |
| `gpt-4.1-mini` | 0.4 | 1.6 |
| `o3-mini` | 1.1 | 4.4 |
| `claude-3.5-sonnet` | 3 | 15 |
| `claude-3.5-haiku` | 0.8 | 4 |
| `claude-3-opus` | 15 | 75 |

### Model-name matching

`priceOf(model)` returns the `ModelPrice` for a model name (or `undefined` if
it's unknown). Matching is case-insensitive and tolerant of common prefixes and
suffixes — it picks the **longest known key** the model name contains. So
`gpt-4o-2024-08-06` and `anthropic/claude-3.5-sonnet` both resolve correctly.

```ts
import { priceOf } from "agentvu";

priceOf("gpt-4o-2024-08-06");            // → { input: 2.5, output: 10 }
priceOf("anthropic/claude-3.5-sonnet");  // → { input: 3, output: 15 }
priceOf("some-unknown-model");           // → undefined
```

:::caution[These numbers are a ballpark, not a bill]
Vendor prices drift, and the table is a hand-maintained snapshot. Use `costOf`
to gauge relative cost across a run, not for billing or chargeback. If you need
to detect an unpriced model explicitly, call `priceOf` and check for
`undefined`.
:::
