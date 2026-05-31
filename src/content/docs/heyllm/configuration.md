---
title: Configuration
description: Authenticate heyllm with an API key, point it at any OpenAI-compatible provider with --base-url, and pick a model.
---

`heyllm` has no config files. Everything it needs comes from a couple of flags
and one environment variable — which is the whole point of a tiny, auditable
tool.

## Authentication

`heyllm` needs an API key. It looks in two places, in order:

1. The `--api-key <key>` flag.
2. The `OPENAI_API_KEY` environment variable.

The usual setup is to export the variable once:

```bash
export OPENAI_API_KEY="sk-..."
heyllm "hello"
```

Pass `--api-key` to override it for a single call — handy when talking to a
provider other than OpenAI:

```bash
heyllm --api-key "$OPENROUTER_API_KEY" "hello"
```

If no key is found by either route, `heyllm` prints a clear error to stderr and
exits with code `2`.

## Choosing a model

The default model is `gpt-4o-mini`. Use `-m` / `--model` to pick another:

```bash
heyllm -m gpt-4o "summarize REST in 3 bullets"
```

The model name is passed straight through to the API, so the valid values are
whatever your chosen provider accepts (for OpenRouter, for example, names look
like `openai/gpt-4o-mini`).

## OpenAI-compatible providers

`heyllm` speaks the OpenAI Chat Completions wire format and posts to
`<base-url>/chat/completions`. The default base URL is
`https://api.openai.com/v1`, but `--base-url` lets it talk to anything that
implements the same API.

### OpenRouter

```bash
heyllm --base-url https://openrouter.ai/api/v1 \
    --api-key "$OPENROUTER_API_KEY" \
    -m openai/gpt-4o-mini "hi"
```

### Local Ollama

A local Ollama server exposes an OpenAI-compatible endpoint, so no key is
needed:

```bash
heyllm --base-url http://localhost:11434/v1 -m llama3 "hi"
```

Streaming is parsed from server-sent events (`data:` lines, ignoring the final
`[DONE]` sentinel), and tokens are printed as they arrive. Pass `--no-stream` if
your provider doesn't stream or you'd rather wait for the whole response.

## Raw output for scripting

When you need the full API payload — for example to read token usage — use
`--json` to print the raw response instead of just the text:

```bash
heyllm --json "ping" | jq '.usage'
```
