---
title: Quick start
description: From install to a recorded and visualized agent run in a few steps.
---

agentvu has two halves: a **library** that records your agent's run to a
JSONL file, and a **CLI** that visualizes that file as a dashboard. This guide
takes you through both.

## 1. Install

```bash
# the CLI, globally
npm install -g agentvu

# or as a project dependency / library
pnpm add agentvu
# npm install agentvu · yarn add agentvu
```

Requires Node.js ≥ 18.

## 2. Visualize the bundled example

You don't need an agent to see what agentvu does. Point it at the example
session that ships with the repo:

```bash
agentvu examples/session.jsonl
```

```ansi
agentvu session.jsonl
steps 3  tools getWeather,getForecast  tokens 1996  cost $0.02  dur 3.0s

▍ user What's the weather in Tokyo and should I bring an umbrella?
◆ gpt-4o system + user: weather question for Tokyo (820ms)
→ getWeather {"city":"Tokyo","units":"metric"}
← getWeather {"tempC":18,"condition":"light rain",...} (260ms)
∑ usage 412 in / 86 out (gpt-4o)
...
```

The header line summarizes the whole run; each row below is one event in the
order it happened.

## 3. Record your own run

### The 1-line Vercel AI SDK integration

If you use the [Vercel AI SDK](https://sdk.vercel.dev/), wiring in agentvu is
a single line. Create a recorder pointed at an output file, then hand each step
to `recordStep` from the SDK's `onStepFinish` callback:

```ts
import { generateText } from "ai";
import { createRecorder, recordStep } from "agentvu";

const rec = createRecorder({ out: "session.jsonl" });

await generateText({
  model,
  prompt: "What's the weather in Tokyo?",
  tools,
  maxSteps: 5,
  onStepFinish: (step) => recordStep(rec, step), // ← that's it
});

rec.close();
```

`recordStep` translates each AI SDK step into agentvu events — assistant
text, tool calls, tool results, and usage — and appends them to
`session.jsonl`. It only depends on the *shape* of the step object, so
agentvu never imports the `ai` package and stays dependency-light.

### Or write events by hand

Not on the AI SDK? Record events directly. Each recorder method writes one
JSONL line:

```ts
import { createRecorder } from "agentvu";

const rec = createRecorder({ out: "session.jsonl" });

rec.message({ role: "user", text: "Find me a flight." });
rec.model({ model: "gpt-4o", prompt: "plan the search", durationMs: 740 });
rec.toolCall({ name: "searchFlights", args: { from: "ADD", to: "NRT" } });
rec.toolResult({ name: "searchFlights", result: { count: 12 }, durationMs: 310 });
rec.usage({ inputTokens: 540, outputTokens: 120, model: "gpt-4o" });

rec.close();
```

Either way you end up with a `session.jsonl` — a plain file you can replay,
commit, or pipe somewhere else.

## 4. Watch it live

In one terminal, run your agent (writing to `session.jsonl`). In another, follow
the file:

```bash
agentvu session.jsonl --follow
```

agentvu tails the file and re-renders the dashboard every time a new event is
appended — so you watch the agent think in real time. Press `Ctrl+C` to stop.

## What next?

- [Recording](/agentvu/recording/) — the full event model, every recorder
  method, the AI SDK adapter, and cost estimation.
- [CLI](/agentvu/cli/) — every flag, exit codes, and `--json` output.
- [API](/agentvu/api/) — the complete exported library surface.
