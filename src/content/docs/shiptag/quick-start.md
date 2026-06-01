---
title: Quick start
description: From install to a finished repository card in a few steps — GitHub mode and local offline mode.
---

## 1. Install

```bash
npm install -g shiptag
# or run it without installing:
npx shiptag <owner/repo>
```

Requires Node.js ≥ 18.

## 2. Make a card from GitHub

Point `shiptag` at any public repository as `owner/repo`. It fetches the
metadata and language breakdown from the GitHub REST API and writes a
standalone SVG:

```bash
shiptag abdulmunimjemal/shiptag -o card.svg
```

That's a complete card — name, description, a colored language bar with a
legend, and the star/fork counts — sized 1200×630 for social previews. With no
`-o`, the SVG is written to stdout, so you can pipe it:

```bash
shiptag facebook/react > react.svg
```

### Lift the rate limit (optional)

Unauthenticated GitHub requests are rate limited. If you hit a `403`, set
`GITHUB_TOKEN` to authenticate — any token with public-repo read access works:

```bash
GITHUB_TOKEN=ghp_xxx shiptag facebook/react -o react.svg
```

## 3. Or build one offline from a local repo

Local mode needs **no network and no token**. It reads `package.json` for the
name and description, parses the git `origin` remote for `owner/repo`, and
computes the language breakdown by scanning file extensions (skipping
`node_modules`, `.git`, `dist`, and similar noise):

```bash
shiptag --local .                       # current directory, SVG to stdout
shiptag --local ../my-project -o my-project.svg
```

This is handy in CI for a repo that isn't on GitHub yet, or when you want a card
built from the working tree rather than the published metadata.

## 4. Pick a theme and size

The default is a `dark` card at the `og` social size. Switch either one:

```bash
shiptag abdulmunimjemal/shiptag --theme light --size card -o card.svg
```

- `--theme dark|light` — dark is the default.
- `--size og|card` — `og` is 1200×630 (social); `card` is a compact 800×320.

See [Customization](/shiptag/customization/) for the full palette and sizing
details.

## 5. Embed it

The output is a plain SVG, so it drops straight into a README:

```markdown
![my project](./card.svg)
```

…or into a page's social-preview tags:

```html
<meta property="og:image" content="https://example.com/card.svg" />
```

## Optional: a one-line AI summary

To replace the description with a punchy generated line, add `--summary` and
supply your own `OPENAI_API_KEY`. Without the flag, no AI calls are made:

```bash
OPENAI_API_KEY=sk-xxx shiptag abdulmunimjemal/shiptag --summary -o card.svg
```

See [Customization → AI summary](/shiptag/customization/#optional-ai-summary)
for pointing it at any OpenAI-compatible gateway.
