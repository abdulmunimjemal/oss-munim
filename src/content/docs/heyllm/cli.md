---
title: CLI
description: The heyllm command — every flag, stdin behavior, streaming vs --no-stream, --json, exit codes, and worked examples.
---

```bash
heyllm [options] "your prompt"
command | heyllm [options] "instruction"
```

Give `heyllm` a prompt as a positional argument, optionally pipe context into
it, and it streams the model's answer to stdout. Multiple positional words are
joined with spaces, so quoting the prompt is optional but recommended.

## Options

| Flag | Description |
| --- | --- |
| `-m, --model <name>` | Model to use. Default: `gpt-4o-mini`. |
| `--system <text>` | System prompt, prepended as a `system` message. |
| `--base-url <url>` | API base URL. Default: `https://api.openai.com/v1`. |
| `--api-key <key>` | API key. Defaults to `$OPENAI_API_KEY`. |
| `--no-stream` | Wait for the full response instead of streaming tokens. |
| `--json` | Print the raw JSON response instead of just the text. |
| `-h, --help` | Show help and exit. |
| `-v, --version` | Show the version and exit. |

Unknown flags are rejected: `heyllm` exits `2` with an error rather than passing
them through.

## How the prompt and stdin combine

`heyllm` builds a single chat request from up to three pieces:

- **System prompt** (`--system`) — added as a `system` message when present.
- **Prompt** (positional argument) — the instruction.
- **Stdin** — read in full when input is piped (i.e. stdin is not a TTY).

The prompt and stdin are merged into **one user message, prompt first**, with a
blank line between them. So this:

```bash
git diff | heyllm "write a conventional commit message"
```

sends a user message of roughly:

```text
write a conventional commit message

<the diff>
```

You can supply either piece alone:

- **Prompt only** — `heyllm "explain monads"` (nothing piped).
- **Stdin only** — `cat notes.md | heyllm` (no positional prompt); stdin becomes
  the user message on its own.

If you provide **neither** a prompt nor piped input, `heyllm` exits `2` with a
usage error.

## Streaming vs `--no-stream`

By default `heyllm` **streams**: it requests a streaming completion and prints
each token as it arrives, parsed from the API's server-sent events (`data:`
lines, ignoring the terminating `[DONE]` sentinel). Frames without a content
delta or with malformed JSON are skipped rather than crashing the stream.

Pass `--no-stream` to send a single non-streaming request and print the full
response once it's complete — useful when a provider doesn't support streaming,
or when you're capturing output into a variable and don't need progressive
display:

```bash
heyllm --no-stream "what is 2+2"
```

## `--json`

`--json` prints the raw, pretty-printed JSON response from the API instead of
just the assistant text. It implies a **non-streaming** request, since it needs
the complete response object to print it. Pipe it into a tool like `jq` to pull
out fields:

```bash
heyllm --json "ping" | jq '.usage'
```

```json
{
  "prompt_tokens": 9,
  "completion_tokens": 1,
  "total_tokens": 10
}
```

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Success. |
| `1` | API, HTTP, or network error (e.g. a non-`2xx` response from the provider). |
| `2` | Usage or configuration error (bad flags, missing API key, no prompt). |

On an HTTP error, `heyllm` includes the status code and any response body in the
message it writes to stderr, so you can see why the provider rejected the call.

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

Talk to a local Ollama (no key needed):

```bash
heyllm --base-url http://localhost:11434/v1 -m llama3 "hello"
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
