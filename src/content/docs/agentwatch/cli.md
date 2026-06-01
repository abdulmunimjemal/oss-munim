---
title: CLI
description: The agentwatch command — arguments, the --follow live view, --json output, exit codes, and examples.
---

The `agentwatch` CLI is the **read side** of agentwatch: it takes a recorded
session file and renders it as a dashboard. Give it a `.jsonl` file and it
prints a header of aggregate stats followed by a timeline of every event.

```bash
agentwatch <session.jsonl> [options]
```

The session file is a positional argument. Record one with the
[library](/agentwatch/recording/), or try the bundled `examples/session.jsonl`.

## Options

| Flag | Description |
| --- | --- |
| `-f, --follow` | Live-tail the session file and re-render as new events are appended. |
| `--json` | Output the parsed events plus a computed summary as JSON, instead of the dashboard. |
| `-h, --help` | Show help and exit. |
| `-v, --version` | Show the version and exit. |

## The dashboard

With no flags, agentwatch reads the file, renders the dashboard once, and exits:

```bash
agentwatch session.jsonl
```

```ansi
agentwatch session.jsonl
steps 3  tools getWeather,getForecast  tokens 1996  cost $0.02  dur 3.0s

▍ user What's the weather in Tokyo and should I bring an umbrella?
◆ gpt-4o system + user: weather question for Tokyo (820ms)
→ getWeather {"city":"Tokyo","units":"metric"}
← getWeather {"tempC":18,"condition":"light rain",...} (260ms)
∑ usage 412 in / 86 out (gpt-4o)
```

The **header** is a one-line summary of the whole run: number of steps (model
calls), the distinct tools called, total tokens, estimated cost, total wall-clock
duration, and — only when there are any — an error count.

Each **row** is one event. The glyph and color tell you the type at a glance:

| Glyph | Event | Shows |
| --- | --- | --- |
| `▍` | `message` | the role and the message text (assistant messages are highlighted) |
| `◆` | `model` | the model name, a short prompt summary, and the call duration |
| `→` | `tool-call` | the tool name and its arguments |
| `←` | `tool-result` | the tool name, its result, and the tool's duration |
| `∑` | `usage` | input/output tokens and the model |
| `✖` | `error` | the error message |

Long arguments, results, and messages are compacted to a single line and
truncated so the timeline stays readable.

## Live view (`--follow`)

This is the live demo. Point agentwatch at the file your agent is writing and
watch it think in real time:

```bash
agentwatch session.jsonl --follow
```

It tails the file and re-renders the dashboard every time a new event is
appended — the header shows a `● live` badge and a `watching <file> — press
Ctrl+C to stop` footer. The reader is resilient: a partially-written tail line
mid-append is simply skipped until it's complete, and a file that's briefly
unreadable during a write keeps the last good frame on screen.

The typical workflow is two terminals:

```bash
# terminal 1 — run your agent, which appends to session.jsonl
node my-agent.js

# terminal 2 — watch it live
agentwatch session.jsonl --follow
```

## JSON output (`--json`)

For piping into other tools, `--json` prints the parsed events alongside a
computed summary instead of rendering the dashboard:

```bash
agentwatch session.jsonl --json
```

```json
{
  "summary": {
    "events": 12,
    "steps": 3,
    "tools": ["getWeather", "getForecast"],
    "toolCalls": 2,
    "errors": 0,
    "inputTokens": 1632,
    "outputTokens": 264,
    "costUsd": 0.0177,
    "durationMs": 2990
  },
  "events": [
    { "type": "message", "ts": 1717200000000, "role": "user", "text": "..." }
  ]
}
```

The `summary` object is the same `SessionSummary` shape the dashboard header is
built from — see the [API](/agentwatch/api/) for every field.

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Success — dashboard rendered, or `--json`/`--help`/`--version` printed. |
| `2` | Error — no file argument given, the file doesn't exist or isn't a regular file, or the arguments couldn't be parsed. |

On error, agentwatch writes a message to stderr (prefixed `agentwatch:`) and,
when the file argument is missing, prints the help text.

## Examples

Render the bundled example session:

```bash
agentwatch examples/session.jsonl
```

Follow a session live as your agent writes it:

```bash
agentwatch session.jsonl --follow
```

Get machine-readable output for a custom report:

```bash
agentwatch session.jsonl --json > run-summary.json
```

Print the help or the version:

```bash
agentwatch --help
agentwatch --version
```
