---
title: Programmatic API
description: Use shiptag as a library — renderCard, computeLanguages, the data sources, the color helpers, and the exported types.
---

The CLI is one entry point, but the same machinery is exported as a library. The
renderer and the language computation are **pure** — no I/O, no network, no
globals — so they're trivial to embed, test, and run anywhere. The GitHub,
local, and summary data sources are kept in separate modules so network access
stays isolated.

```ts
import { renderCard, computeLanguages } from "shiptag";

const svg = renderCard({
  name: "shiptag",
  owner: "abdulmunimjemal",
  description: "Generate a beautiful, shareable SVG card for any repository.",
  languages: computeLanguages({ TypeScript: 9200, JavaScript: 600 }),
  stars: 1280,
  forks: 47,
});
```

`renderCard` returns a complete, standalone `<svg>…</svg>` string — write it to
a file, embed it in a README, or serve it as a social image.

## The renderer

### `renderCard(data, options?)`

```ts
function renderCard(data: CardData, options?: RenderOptions): string;
```

Render a polished, self-contained SVG from normalized repo `data`. Pure — same
input, same output, no side effects.

- `options.theme` — `"dark"` (default) or `"light"`.
- `options.size` — `"og"` (1200×630, default) or `"card"` (compact 800×320).

Stars and forks are only drawn when present on `data`. The language bar shows up
to six languages with a legend; the description and long names are truncated to
fit.

## Building card data

You can hand-build `CardData`, or use one of the two data sources.

### `computeLanguages(bytesByLanguage, limit?)`

```ts
function computeLanguages(
  bytesByLanguage: Record<string, number>,
  limit?: number, // default 6
): CardLanguage[];
```

Turn a raw `{ language: bytes }` map into ranked, color-tagged
[`CardLanguage`](#types) slices: sorted largest first, percentages computed
against the **full** total (so a long tail reads as a smaller top bar rather than
being inflated), rounded to one decimal, and capped at `limit` slices. Languages
with zero bytes are dropped; an empty or all-zero map returns `[]`.

```ts
computeLanguages({ TypeScript: 9200, JavaScript: 600 });
// → [
//     { name: "TypeScript", percent: 93.9, color: "#3178c6" },
//     { name: "JavaScript", percent: 6.1,  color: "#f1e05a" },
//   ]
```

### `fetchGitHubCard(slug, token?)`

```ts
function fetchGitHubCard(slug: string, token?: string): Promise<CardData>;
```

Fetch and normalize a repository into `CardData` from the GitHub REST API.
`slug` is `owner/repo`. An optional `token` (otherwise `process.env.GITHUB_TOKEN`)
lifts the unauthenticated rate limit. Throws [`GitHubError`](#errors) on a
malformed slug or a non-OK response (with `404`/`403` hints).

### `buildLocalCard(dir?)`

```ts
function buildLocalCard(dir?: string): CardData; // default: process.cwd()
```

Build `CardData` for a local directory with no network access — name and
description from `package.json`, owner/name from the git `origin` remote (falling
back to the `repository` URL, then the directory name), and a language breakdown
computed by scanning file extensions (skipping `node_modules`, `.git`, build
output, etc.). Stars and forks are left unset.

### `parseSlug(slug)` / `parseRemote(url)`

```ts
function parseSlug(slug: string): { owner: string; repo: string };
function parseRemote(url: string): { owner: string; name: string } | null;
```

`parseSlug` splits an `owner/repo` string (throwing `GitHubError` if malformed).
`parseRemote` extracts `owner` and `name` from a git remote URL in either the
`git@github.com:owner/repo` or `https://github.com/owner/repo` form (with or
without a `.git` suffix), returning `null` if it can't.

## AI summary

### `generateSummary(data, options?)`

```ts
function generateSummary(
  data: CardData,
  options?: SummaryOptions,
): Promise<string>;

interface SummaryOptions {
  baseUrl?: string; // OpenAI-compatible base URL (default OpenAI)
  apiKey?: string;  // defaults to process.env.OPENAI_API_KEY
  model?: string;   // default "gpt-4o-mini"
}
```

Ask an OpenAI-compatible chat-completions endpoint for a single punchy line
describing the repo, and return the trimmed result (surrounding quotes and a
trailing period are stripped). Throws [`SummaryError`](#errors) if no key is
configured, the response is empty, or the request fails — so callers can fall
back to the repo description. This is the only function that calls a third-party
AI endpoint, and only when you invoke it.

## Color helpers

```ts
import { colorForLanguage, LANGUAGE_COLORS, NEUTRAL_COLOR, EXTENSION_LANGUAGES } from "shiptag";
```

- **`colorForLanguage(name)`** → `string` — the canonical hex color for a
  language name, or `NEUTRAL_COLOR` for anything unknown.
- **`LANGUAGE_COLORS`** — the `Record<string, string>` map of language → hex
  color (see [Customization](/shiptag/customization/#the-color-map)).
- **`NEUTRAL_COLOR`** — `"#8b949e"`, the grey fallback.
- **`EXTENSION_LANGUAGES`** — the `Record<string, string>` map of lowercased
  file extension (no leading dot) → language name used by local-mode scanning.

## Formatting helpers

```ts
import { escapeXml, formatCount } from "shiptag";
```

- **`escapeXml(value)`** → `string` — escape a string for safe inclusion in SVG
  text/attribute content (`&`, `<`, `>`, `"`, `'`).
- **`formatCount(n)`** → `string` — compact a number for the stats line:
  `1234` → `"1.2k"`, `1_500_000` → `"1.5M"`.

## Errors

```ts
import { GitHubError, SummaryError } from "shiptag";
```

- **`GitHubError`** — thrown by `fetchGitHubCard` / `parseSlug` on a malformed
  slug or a failed GitHub request.
- **`SummaryError`** — thrown by `generateSummary` when the endpoint is
  misconfigured (no key), unreachable, or returns an empty/non-OK response.

Both extend `Error` and set a matching `name`, so they're easy to catch and
branch on.

## Types

The following are all exported for use in your own typed code:

| Type | Shape |
| --- | --- |
| `CardData` | `{ name; owner; description; languages: CardLanguage[]; stars?; forks? }` — normalized repo data the card renders from. |
| `CardLanguage` | `{ name: string; percent: number; color: string }` — one slice of the language bar. |
| `RenderOptions` | `{ theme?: Theme; size?: Size }`. |
| `Theme` | `"dark" \| "light"`. |
| `Size` | `"og" \| "card"`. |
| `SummaryOptions` | `{ baseUrl?; apiKey?; model? }`. |
