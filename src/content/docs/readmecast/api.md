---
title: Programmatic API
description: Use readmecast as a library — parseMarkdown, renderSvg, markdownToSvg, escapeXml, THEMES, and the exported types.
---

The CLI is the primary interface, but readmecast is also a small library. Every
exported function is **pure**: parsing and SVG generation do no I/O and never
execute the documented commands, so the same input always produces the same SVG.

```ts
import { parseMarkdown, renderSvg, markdownToSvg } from "readmecast";

const steps = parseMarkdown("```bash\n$ echo hi\nhi\n```");
// → [{ command: "echo hi", output: "hi" }]

const svg = renderSvg(steps, { theme: "dark", title: "demo" });

// or in one shot:
const svg2 = markdownToSvg(myMarkdown, { theme: "light" });
```

## Exports

### `parseMarkdown(markdown)`

```ts
function parseMarkdown(markdown: string): Step[];
```

Scan Markdown source and return an ordered list of shell steps, one per command.
It recognizes fenced blocks tagged `bash`, `sh`, `shell`, `console`, `zsh`, or
`shell-session`; treats `$ `/`> ` lines as commands and following lines as their
output; and concatenates steps across all matching blocks in document order. See
[Markdown format](/readmecast/markdown-format/) for the full extraction rules.
Returns an empty array if no castable steps are found.

```ts
parseMarkdown("```sh\n$ ls\na\nb\n$ pwd\n/tmp\n```");
// → [
//     { command: "ls", output: "a\nb" },
//     { command: "pwd", output: "/tmp" },
//   ]
```

### `renderSvg(steps, options?)`

```ts
function renderSvg(steps: Step[], options?: RenderOptions): string;
```

Render an array of steps to a standalone animated SVG string. The output is a
complete `<svg>` document with an embedded `<style>` block of CSS `@keyframes` —
no external assets, no JavaScript. Deterministic for a given input.

### `markdownToSvg(markdown, options?)`

```ts
function markdownToSvg(markdown: string, options?: RenderOptions): string;
```

Convenience one-shot that composes `parseMarkdown` and `renderSvg` — parse the
Markdown and render the SVG in a single call.

```ts
const svg = markdownToSvg("```bash\n$ echo hi\nhi\n```", { theme: "light" });
```

### `escapeXml(text)`

```ts
function escapeXml(s: string): string;
```

Escape a string for safe inclusion in XML text or attribute content (`&`, `<`,
`>`, `"`, `'`). Exported because readmecast uses it internally to escape command
and output text; useful if you're assembling SVG fragments yourself.

### `THEMES`

```ts
const THEMES: Record<ThemeName, Theme>;
```

The built-in color themes, keyed by name (`dark`, `light`). Each `Theme` is a flat
record of the colors used to paint the window — background, title bar, border,
title text, prompt glyph, command text, output text, cursor, and the three
traffic-light `dots`. Read it to inspect a palette, or as a starting point for your
own.

## Options

`RenderOptions` controls how steps are laid out and timed:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `theme` | `ThemeName` | `"dark"` | Color theme: `"dark"` or `"light"`. |
| `width` | `number` | `80` | Terminal width in columns (clamped to a minimum of 20). |
| `speed` | `number` | `0.06` | Typing speed in seconds per character. |
| `title` | `string` | none | Window title shown in the title bar. |
| `loop` | `boolean` | `true` | Loop the animation forever; `false` plays once and holds. |
| `outputDelay` | `number` | `0.6` | Pause (seconds) after a command finishes typing, before its output appears. |
| `endPause` | `number` | `1.4` | Pause (seconds) at the end before the animation loops. |

The last two (`outputDelay`, `endPause`) are library-only knobs for fine-tuning
pacing; the CLI doesn't expose them.

## Types

The following types are exported for use in your own typed code:

| Type | Shape |
| --- | --- |
| `Step` | `{ command: string; output: string }` — one command and the output it produced (output joined with `\n`, empty string if none). |
| `ThemeName` | `"dark" \| "light"`. |
| `Theme` | The per-theme color record consumed by `renderSvg`. |
| `RenderOptions` | The options object documented above. |

```ts
import type { Step, ThemeName, Theme, RenderOptions } from "readmecast";
```
