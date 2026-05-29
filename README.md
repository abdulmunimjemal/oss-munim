# oss.munim.io

Documentation hub for [Abdulmunim Jemal](https://github.com/abdulmunimjemal)'s
open-source projects. Built with [Astro](https://astro.build) +
[Starlight](https://starlight.astro.build).

First project documented here: **[promptsize](https://github.com/abdulmunimjemal/promptsize)**.

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # static site → dist/
pnpm preview    # preview the built site
```

## Structure

```
src/
  content/docs/
    index.mdx              # landing page (the OSS hub)
    promptsize/            # one folder per project
      index.mdx
      quick-start.md
      ...
  styles/theme.css         # violet accent over Starlight defaults
  assets/logo.svg
astro.config.mjs           # site URL + sidebar navigation
```

### Adding another project

1. Create `src/content/docs/<project>/` and add Markdown/MDX pages.
2. Add a sidebar group in `astro.config.mjs`.
3. Add a `<LinkCard>` for it on the landing page (`src/content/docs/index.mdx`).

## Deploy (to `oss.munim.io`)

The site is static (`dist/`), so any static host works. The canonical URL is
already set to `https://oss.munim.io` in `astro.config.mjs`.

- **Vercel / Netlify / Cloudflare Pages** — connect the repo, build command
  `pnpm build`, output directory `dist`, then point the `oss` subdomain at it.
- **GitHub Pages** — build and publish `dist/`, and add a `CNAME` with
  `oss.munim.io`.

No deploy config is committed yet — wire up whichever host you prefer.
