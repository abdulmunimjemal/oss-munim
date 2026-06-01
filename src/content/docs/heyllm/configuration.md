---
title: Configuration
description: Authenticate heyllm with an API key, point it at any OpenAI-compatible provider with --base-url, and pick a model.
---

`heyllm` has no config files. Everything it needs comes from a couple of flags
and one environment variable — which is the whole point of a tiny, auditable
tool. There's nothing to discover on disk, nothing to migrate, and nothing
hidden.

## Authentication

`heyllm` needs an API key. It looks in two places, in order:

1. The `--api-key <key>` flag.
2. The `OPENAI_API_KEY` environment variable.

The usual setup is to export the variable once (e.g. in your shell profile):

```bash
export OPENAI_API_KEY="sk-..."
heyllm "hello"
```

Pass `--api-key` to override it for a single call — handy when talking to a
provider other than OpenAI without changing your environment:

```bash
heyllm --api-key "$OPENROUTER_API_KEY" "hello"
```

If no key is found by either route, `heyllm` prints a clear error to stderr and
exits with code `2`. The key is sent as a standard `Authorization: Bearer
<key>` header.

## Choosing a model

The default model is `gpt-4o-mini`. Use `-m` / `--model` to pick another:

```bash
heyllm -m gpt-4o "summarize REST in 3 bullets"
```

The model name is passed straight through to the API, so the valid values are
whatever your chosen provider accepts. With OpenRouter, for example, names are
namespaced like `openai/gpt-4o-mini` or `anthropic/claude-3.5-sonnet`; with a
local Ollama they're whatever you've pulled (`llama3`, `mistral`, …).

## OpenAI-compatible providers

`heyllm` speaks the OpenAI Chat Completions wire format and posts to
`<base-url>/chat/completions`. The default base URL is
`https://api.openai.com/v1`, but `--base-url` lets it talk to anything that
implements the same API. Any trailing slashes on the base URL are normalized
before `/chat/completions` is appended.

### OpenRouter

A single gateway in front of many providers — pass its base URL, your OpenRouter
key, and a namespaced model name:

```bash
heyllm --base-url https://openrouter.ai/api/v1 \
    --api-key "$OPENROUTER_API_KEY" \
    -m openai/gpt-4o-mini "hi"
```

### Local Ollama

A local Ollama server exposes an OpenAI-compatible endpoint on `/v1`. It doesn't
check the key, but `heyllm` still requires *some* value to be present — so set a
placeholder if you don't already have `OPENAI_API_KEY` exported:

```bash
export OPENAI_API_KEY="ollama"   # any non-empty value
heyllm --base-url http://localhost:11434/v1 -m llama3 "hi"
```

### Anything else

The same pattern works for any OpenAI-compatible endpoint — Azure OpenAI,
Together, Groq, a self-hosted vLLM, and so on. Point `--base-url` at the
provider's `/v1` root, supply the matching `--api-key`, and pick a model name it
recognizes.

## Streaming behavior

By default `heyllm` streams tokens as they arrive, parsed from the provider's
server-sent events (`data:` lines, ignoring the final `[DONE]` sentinel). If a
provider doesn't support streaming — or you simply prefer to wait for the whole
answer — pass `--no-stream`:

```bash
heyllm --no-stream --base-url https://some-provider/v1 "hello"
```

## Raw output for scripting

When you need the full API payload — for example to read token usage — use
`--json` to print the raw response instead of just the text. `--json` implies a
non-streaming request:

```bash
heyllm --json "ping" | jq '.usage'
```

## Configuration at a glance

| What | How | Default |
| --- | --- | --- |
| API key | `--api-key` or `$OPENAI_API_KEY` | *(none — required)* |
| Model | `-m` / `--model` | `gpt-4o-mini` |
| Endpoint | `--base-url` | `https://api.openai.com/v1` |
| System prompt | `--system` | *(none)* |
| Streaming | on by default; `--no-stream` to disable | on |
