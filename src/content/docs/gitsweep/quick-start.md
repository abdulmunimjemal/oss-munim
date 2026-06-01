---
title: Quick start
description: From a cluttered branch list to a clean one — install, dry-run, then confirm and delete.
---

## 1. Run it

You don't have to install anything to try `gitsweep` — run it straight from
`npx` inside any repository:

```bash
npx gitsweep
```

Requires Node.js ≥ 18 and `git` on your `PATH`. To keep it around, install
globally instead:

```bash
npm i -g gitsweep
# or: pnpm add -g gitsweep
```

## 2. Preview with a dry run

Before deleting anything, see exactly what `gitsweep` would remove. A dry run
changes nothing — it's the recommended first run:

```bash
gitsweep --dry-run
```

```ansi
  Default branch: main · current: feature-y

  Merged into default branch:
    ✓ feature-x (merged)
    ✓ hotfix-123 (merged)

  Upstream gone:
    ⚠ old-spike (upstream gone) — force delete

  Dry run: 3 branch(es) would be deleted.
```

Candidates are grouped by **why** they're stale. A `force delete` label means
the branch isn't merged and would need `git branch -D` — see
[How it works](/gitsweep/how-it-works/) for what that means.

:::tip[Prune first for accurate "gone" detection]
Gone-branch detection reflects what your local repo already knows. Run
`git fetch --prune` first so branches deleted on the remote are actually marked
`gone`:

```bash
git fetch --prune && gitsweep --dry-run
```
:::

## 3. Confirm and delete

Happy with the list? Run `gitsweep` with no flags. It prints the same grouped
list and then asks before removing anything:

```bash
gitsweep
```

```ansi
  Delete 3 branch(es)? [y/N]
```

Type `y` (or `yes`) to proceed; anything else aborts without deleting. On
success you'll see each branch confirmed:

```ansi
  deleted feature-x
  deleted hotfix-123
  deleted old-spike

  Swept 3 branch(es).
```

## Going further

- Sweep only one kind of branch: `gitsweep --merged` or `gitsweep --gone`.
- Skip the prompt in scripts: `gitsweep -y`.
- Point at a non-standard default branch: `gitsweep --main develop`.

See the full [CLI reference](/gitsweep/cli/) for every flag and exit code.
