---
title: API
description: The exported agentvu library surface — recording, event encoding, cost, summarization, formatting, and the key types.
---

agentvu is a library first and a CLI second. Everything the CLI uses is
exported, so you can record, parse, summarize, price, and format events from
your own code. This page is the full exported surface.

```ts
import {
  createRecorder, recordStep,        // record
  parseJsonl, encodeEvent, isAgentEvent,
  summarize, costOf, priceOf, PRICES,
  formatDuration, formatCost, compactValue,
} from "agentvu";
import type {
  AgentEvent, Recorder, AiSdkStep, SessionSummary,
} from "agentvu";
```

## Recording

### `createRecorder(options?)`

```ts
function createRecorder(options?: RecorderOptions): Recorder;
// RecorderOptions = { out?: string; now?: () => number }
```

Create a `Recorder`. Pass `out` to stream events to a JSONL file (created /
appended); pass `now` to inject a clock for deterministic tests. The returned
recorder exposes `message`, `model`, `toolCall`, `toolResult`, `usage`, and
`error` methods, a readonly `events` array, and `close()`. See
[Recording](/agentvu/recording/) for the methods in detail.

### `recordStep(recorder, step)`

```ts
function recordStep(recorder: Recorder, step: AiSdkStep): void;
```

Map a single Vercel AI SDK `onStepFinish` step into agentvu events, recording
them in order: assistant text (if any) → tool calls → tool results → usage. Does
not import the `ai` package — it matches the step's *shape* — and every field on
the step is optional, so partial steps degrade gracefully.

## Events

### `encodeEvent(event)`

```ts
function encodeEvent(event: AgentEvent): string;
```

Serialize a single event to one JSONL line (no trailing newline).

### `parseJsonl(text)`

```ts
function parseJsonl(text: string): AgentEvent[];
```

Parse a JSONL string into events. Blank lines are skipped; lines that don't
parse or don't look like an `AgentEvent` are ignored — so a partially-written
tail line never crashes the reader.

### `isAgentEvent(value)`

```ts
function isAgentEvent(value: unknown): value is AgentEvent;
```

Structural type guard: returns `true` when `value` is an object with a known
`type` discriminator and a numeric `ts`.

## Summarization

### `summarize(events)`

```ts
function summarize(events: AgentEvent[]): SessionSummary;
```

Compute aggregate numbers for a list of events — steps, distinct tools, token
totals, estimated cost, and wall-clock duration. This is what the dashboard
header and `--json` output are built from.

## Cost

### `costOf(usage)`

```ts
function costOf(
  usage: Pick<UsageEvent, "inputTokens" | "outputTokens" | "model">,
): number;
```

Estimate the USD cost of a single usage event using the built-in price table.
Returns `0` for an unknown model so totals never become `NaN`.

### `priceOf(model)`

```ts
function priceOf(model: string | undefined): ModelPrice | undefined;
```

Look up a model's `ModelPrice` (USD per 1M input/output tokens). Matching is
case-insensitive and tolerant of prefixes/suffixes via longest-known-key match.
Returns `undefined` for an unknown model — use this to detect an unpriced model
explicitly.

### `PRICES`

```ts
const PRICES: Record<string, ModelPrice>;
```

The built-in, approximate price table (USD per 1M tokens). See
[Recording → Cost estimation](/agentvu/recording/#cost-estimation) for the
covered models and the caveats.

## Formatting

These are the same helpers the dashboard uses to render values.

```ts
formatDuration(820);        // "820ms"  ·  formatDuration(3400) → "3.4s"
formatCost(0.0042);         // "$0.0042"  ·  formatCost(1.2) → "$1.20"
compactValue({ a: 1 }, 60); // one-line JSON, whitespace-collapsed, truncated to max
```

| Function | Signature | Description |
| --- | --- | --- |
| `formatDuration` | `(ms: number) => string` | Compact duration, e.g. `820ms`, `3.4s`, `1m12s`. |
| `formatCost` | `(usd: number) => string` | USD cost, e.g. `$0`, `$0.0042`, `$1.20`. |
| `compactValue` | `(value: unknown, max?: number) => string` | One-line, whitespace-collapsed, truncated string for arbitrary JSON. Default `max` is `60`. |

## Types

All of these are exported for use in your own typed code.

### `AgentEvent`

The discriminated union of every recordable event:

```ts
type AgentEvent =
  | MessageEvent      // { type: "message"; ts; role; text }
  | ModelEvent        // { type: "model"; ts; model; prompt; durationMs? }
  | ToolCallEvent     // { type: "tool-call"; ts; name; args }
  | ToolResultEvent   // { type: "tool-result"; ts; name; result; durationMs? }
  | UsageEvent        // { type: "usage"; ts; inputTokens; outputTokens; model? }
  | ErrorEvent;       // { type: "error"; ts; message }

type AgentEventType = AgentEvent["type"];
```

Each member interface (`MessageEvent`, `ModelEvent`, `ToolCallEvent`,
`ToolResultEvent`, `UsageEvent`, `ErrorEvent`) is exported individually too.

### `Recorder` and `RecorderOptions`

```ts
interface Recorder {
  message(input): MessageEvent;
  model(input): ModelEvent;
  toolCall(input): ToolCallEvent;
  toolResult(input): ToolResultEvent;
  usage(input): UsageEvent;
  error(input): ErrorEvent;
  readonly events: AgentEvent[];
  close(): void;
}

interface RecorderOptions {
  out?: string;
  now?: () => number;
}
```

### `AiSdkStep` (and friends)

The minimal structural model of a Vercel AI SDK step. `AiSdkToolCall`,
`AiSdkToolResult`, and `AiSdkUsage` are exported alongside it. See
[Recording → The Vercel AI SDK adapter](/agentvu/recording/#the-vercel-ai-sdk-adapter).

### `SessionSummary`

The aggregate returned by `summarize` (and emitted under `summary` in `--json`):

```ts
interface SessionSummary {
  events: number;        // total events
  steps: number;         // model events (≈ reasoning steps)
  tools: string[];       // distinct tool names called
  toolCalls: number;     // tool-call events
  errors: number;        // error events
  inputTokens: number;   // summed input tokens
  outputTokens: number;  // summed output tokens
  costUsd: number;       // estimated total USD cost
  durationMs: number;    // span from first to last event
}
```

### `ModelPrice`

```ts
interface ModelPrice {
  input: number;   // USD per 1M input (prompt) tokens
  output: number;  // USD per 1M output (completion) tokens
}
```
