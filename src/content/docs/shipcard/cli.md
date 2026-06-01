---
title: CLI
description: The shipcard command — GitHub and local modes, every option, environment variables, exit codes, and examples.
---

```bash
shipcard <owner/repo> [options]      # GitHub mode (network)
shipcard --local [path] [options]    # local mode (offline)
```

`shipcard` has two modes. Pass an `owner/repo` slug to fetch from GitHub, or
pass `--local` to build a card from a directory on disk. In both cases it
renders a standalone SVG and writes it to a file (`-o`) or stdout.

## Modes

### GitHub mode

Give `shipcard` a repository as `owner/repo`. It calls the GitHub REST API for
the repo metadata (name, description, owner, stars, forks) and the language
breakdown, then renders the card:

```bash
shipcard abdulmunimjemal/shipcard -o card.svg
```

A malformed slug (not exactly `owner/repo`) exits with a usage error. Exactly
one positional slug is expected.

### Local mode (offline)

Pass `--local` with an optional path (default: the current directory). No
network is used. The card is assembled from:

- **`package.json`** — `name` (scope stripped) and `description`.
- **The git `origin` remote** — parsed for `owner` and repo name, from
  `.git/config`. Falls back to `package.json`'s `repository` URL, then the
  directory name; the owner falls back to `local`.
- **A file-extension scan** — bytes per language, recursively, skipping
  `node_modules`, `.git`, `dist`, `build`, `out`, `coverage`, `.next`,
  `.cache`, `.turbo`, `vendor`, and `target`.

```bash
shipcard --local .                       # current directory
shipcard --local ../my-project -o my-project.svg
```

Local mode reports no stars or forks (that data isn't available offline), so the
card omits those stats.

## Options

| Option | Description |
| --- | --- |
| `-o, --out <file>` | Write the SVG to `<file>`. Default: stdout. |
| `--theme <name>` | Card theme: `dark` (default) or `light`. |
| `--size <name>` | Card size: `og` — 1200×630 social size (default); `card` — compact 800×320. |
| `--local [path]` | Offline mode; scan `[path]` (default: current directory). |
| `--summary` | Replace the description with a one-line AI summary. Off by default. |
| `--base-url <url>` | Base URL for the `--summary` API. Default: OpenAI. |
| `-h, --help` | Show help and exit. |
| `-v, --version` | Show the version and exit. |

An invalid `--theme` (not `dark`/`light`) or `--size` (not `og`/`card`) is a
usage error.

## Environment variables

| Variable | When | Effect |
| --- | --- | --- |
| `GITHUB_TOKEN` | GitHub mode | Optional. Authenticates the API request and lifts the unauthenticated rate limit. Any token with public-repo read access works. |
| `OPENAI_API_KEY` | `--summary` only | Required when `--summary` is used. The key for the OpenAI-compatible endpoint. Never read otherwise. |

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Success — the card was rendered. |
| `1` | Fetch / network error (e.g. repo not found, rate limited, summary request failed). |
| `2` | Usage error (e.g. missing or malformed `owner/repo`, an invalid `--theme`/`--size`, an unexpected extra argument). |

These make `shipcard` scriptable: a non-zero exit fails a CI step or a shell
pipeline. A `403` from GitHub surfaces as exit `1` with a hint to set
`GITHUB_TOKEN`; a `404` reports the repo wasn't found.

## Examples

A light, compact card written to a file:

```bash
shipcard abdulmunimjemal/shipcard --theme light --size card -o card.svg
```

Authenticated fetch for a large/popular repo (avoids rate limiting):

```bash
GITHUB_TOKEN=ghp_xxx shipcard facebook/react -o react.svg
```

Pipe the SVG straight into another tool instead of a file:

```bash
shipcard vercel/next.js > next.svg
```

Build a card from the working tree of a local project:

```bash
shipcard --local . -o card.svg
```

Use an AI summary instead of the repo description, via a custom gateway:

```bash
OPENAI_API_KEY=sk-xxx \
  shipcard owner/repo --summary --base-url https://my-gateway.example/v1 -o card.svg
```
