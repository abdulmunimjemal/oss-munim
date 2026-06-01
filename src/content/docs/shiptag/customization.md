---
title: Customization
description: Themes and sizes, the built-in language color map, and the optional bring-your-own-key AI summary.
---

A `shiptag` card is shaped by three things: the **theme** (its color scheme),
the **size** (its dimensions), and the **language colors** in the bar. There's
no config file — everything is a flag or a built-in default.

## Themes

Two themes ship in the box, selected with `--theme`:

```bash
shiptag owner/repo --theme dark    # default
shiptag owner/repo --theme light
```

Each theme is a fixed palette tuned to match GitHub's own UI colors:

| Token | `dark` | `light` | Used for |
| --- | --- | --- | --- |
| background (gradient from → to) | `#0d1117` → `#161b22` | `#ffffff` → `#f6f8fa` | The card's diagonal background. |
| text | `#f0f6fc` | `#1f2328` | Repo name, stat values, legend names. |
| muted | `#8b949e` | `#636c76` | Description, stat glyphs, legend percentages. |
| accent | `#58a6ff` | `#0969da` | The top bar and the `owner/` line. |
| track | `#21262d` | `#eaeef2` | The empty language-bar track behind the segments. |

The background is rendered as a diagonal gradient, with a thin accent strip
along the top edge.

## Sizes

`--size` controls the card's dimensions:

| Size | Dimensions | Best for |
| --- | --- | --- |
| `og` (default) | 1200 × 630 | Open Graph / social previews — the standard `og:image` ratio. |
| `card` | 800 × 320 | A compact banner for a README header or a tighter layout. |

```bash
shiptag owner/repo --size og      # default, social
shiptag owner/repo --size card    # compact
```

The `card` size scales every element (padding, font sizes, the language bar)
down proportionally, and shows up to **four** legend entries instead of six, so
the compact card stays uncluttered.

## The language bar

The primary languages render as a single rounded, color-coded bar with a legend
of `name percent%` underneath. Up to **six** languages are shown (the rest fold
into the proportions), sorted largest first. Each segment's width is its share
of the total, and the bar always fills its full width even when the percentages
don't sum to exactly 100.

### The color map

Colors come from a built-in table that mirrors the canonical palette GitHub uses
for its language bars. Any language not in the table falls back to a neutral
grey (`#8b949e`) so the card always renders sensibly.

| Language | Color | Language | Color |
| --- | --- | --- | --- |
| TypeScript | `#3178c6` | JavaScript | `#f1e05a` |
| Python | `#3572a5` | Rust | `#dea584` |
| Go | `#00add8` | Java | `#b07219` |
| C | `#555555` | C++ | `#f34b7d` |
| C# | `#178600` | Ruby | `#701516` |
| PHP | `#4f5d95` | Swift | `#f05138` |
| Kotlin | `#a97bff` | Dart | `#00b4ab` |
| Scala | `#c22d40` | Shell | `#89e051` |
| HTML | `#e34c26` | CSS | `#563d7c` |
| SCSS | `#c6538c` | Vue | `#41b883` |
| Svelte | `#ff3e00` | Elixir | `#6e4a7e` |
| Haskell | `#5e5086` | Lua | `#000080` |
| Perl | `#0298c3` | Objective-C | `#438eff` |
| R | `#198ce7` | Julia | `#a270ba` |
| Clojure | `#db5855` | Zig | `#ec915c` |
| Markdown | `#083fa1` | JSON | `#292929` |
| YAML | `#cb171e` | Dockerfile | `#384d54` |
| Makefile | `#427819` | *(unknown)* | `#8b949e` |

The full map (and the neutral fallback) is exported as `LANGUAGE_COLORS`,
`NEUTRAL_COLOR`, and `colorForLanguage()` — see the
[Programmatic API](/shiptag/api/#color-helpers) if you want to reuse or extend
it.

### How languages are measured

- **GitHub mode** uses the repo's GitHub languages API — bytes per language as
  GitHub classifies them.
- **Local mode** scans file extensions and accumulates file sizes per language,
  using a built-in extension → language map (`.ts`/`.tsx` → TypeScript,
  `.py` → Python, `.rs` → Rust, and so on). Files whose extension isn't a known
  code type are ignored so they don't pollute the breakdown.

Either way the raw `{ language: bytes }` map is normalized the same way, so the
two modes produce visually consistent bars.

## Optional: AI summary

By default the card uses the repository's own description and makes **no**
network calls beyond fetching repo metadata. With `--summary`, shiptag instead
asks an OpenAI-compatible chat-completions endpoint for a single punchy line
(max ~80 characters) describing the repo, and uses that as the card's
description.

It's strictly bring-your-own-key: the request only happens when you pass
`--summary`, and it needs `OPENAI_API_KEY`.

```bash
OPENAI_API_KEY=sk-xxx shiptag abdulmunimjemal/shiptag --summary -o card.svg
```

### Point it at any compatible API

The endpoint defaults to OpenAI (`https://api.openai.com/v1`) with the
`gpt-4o-mini` model. Use `--base-url` to target any OpenAI-compatible gateway —
a self-hosted proxy, Azure OpenAI, or a local server:

```bash
shiptag owner/repo --summary --base-url https://my-gateway.example/v1 -o card.svg
```

If no key is set, or the request fails, shiptag exits `1` with an error rather
than silently falling back — so a broken summary never produces a misleading
card. (The library function `generateSummary` also lets you override the
`model` and `apiKey` directly; see the
[Programmatic API](/shiptag/api/#generatesummarydata-options).)
