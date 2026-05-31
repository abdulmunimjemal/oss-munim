---
title: Usage
description: Install heyllm, then learn every flag, the exit codes, and how to pipe stdin in as context.
---

## Install

```bash
npm install -g heyllm
# or: pnpm add -g heyllm
```

Requires Node.js ≥ 18 — `heyllm` uses the built-in global `fetch`.

Set your API key once and you're ready (see [Configuration](/heyllm/configuration/)
for the details):

```bash
export OPENAI_API_KEY="sk-..."
```

## Synopsis

```text
heyllm [options] "your prompt"
command | heyllm [options] "instruction"
```

You give `heyllm` a prompt as a positional argument. If you also pipe something
into it, the prompt is treated as the instruction and the piped stdin as the
context — they are combined into a single user message, prompt first. You can
also pipe input with no prompt at all and let stdin stand on its own.

## Options

| Flag | Description |
| --- | --- |
| `-m, --model <name>` | Model to use. Default: `gpt-4o-mini`. |
| `--system <text>` | System prompt to prepend to the conversation. |
| `--base-url <url>` | API base URL. Default: `https://api.openai.com/v1`. |
| `--api-key <key>` | API key. Defaults to `$OPENAI_API_KEY`. |
| `--no-stream` | Wait for the full response instead of streaming tokens. |
| `--json` | Print the raw JSON response instead of just the text. |
| `-h, --help` | Show help. |
| `-v, --version` | Show the version. |

By default `heyllm` streams: tokens are printed as they arrive, parsed from the
API's server-sent events. `--json` implies a non-streaming request, since it
needs the complete response to print it.

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Success. |
| `1` | API, HTTP, or network error. |
| `2` | Usage or configuration error (bad flags, missing API key, no prompt). |

If no API key is found and `--api-key` isn't passed, `heyllm` prints a clear
error to stderr and exits `2`. The same applies when you provide neither a
prompt nor piped input.

## Examples

Stream an answer:

```bash
heyllm "explain monads simply"
```

Pipe context in — the prompt is the instruction, stdin is the context:

```bash
git diff | heyllm "write a conventional commit message"
```

Pick a model and add a system prompt:

```bash
heyllm -m gpt-4o --system "You are terse" "summarize REST in 3 bullets"
```

Get the raw API response for scripting:

```bash
heyllm --json "ping" | jq '.usage'
```

Disable streaming — one request, the full response at once:

```bash
heyllm --no-stream "what is 2+2"
```

Print the version or the help text:

```bash
heyllm --version
heyllm --help
```
