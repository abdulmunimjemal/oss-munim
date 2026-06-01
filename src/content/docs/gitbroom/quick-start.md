---
title: Quick start
description: From a cluttered branch list to a clean one — install, dry-run, then confirm and delete.
---

## 1. Run it

You don't have to install anything to try `gitbroom` — run it straight from
`npx` inside any repository:

```bash
npx gitbroom
```

Requires Node.js ≥ 18 and `git` on your `PATH`. To keep it around, install
globally instead:

```bash
npm i -g gitbroom
# or: pnpm add -g gitbroom
```

## 2. Preview with a dry run

Before deleting anything, see exactly what `gitbroom` would remove. A dry run
changes nothing — it's the recommended first run:

```bash
gitbroom --dry-run
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
[How it works](/gitbroom/how-it-works/) for what that means.

:::tip[Prune first for accurate "gone" detection]
Gone-branch detection reflects what your local repo already knows. Run
`git fetch --prune` first so branches deleted on the remote are actually marked
`gone`:

```bash
git fetch --prune && gitbroom --dry-run
```
:::

## 3. Confirm and delete

Happy with the list? Run `gitbroom` with no flags. It prints the same grouped
list and then asks before removing anything:

```bash
gitbroom
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

- Sweep only one kind of branch: `gitbroom --merged` or `gitbroom --gone`.
- Skip the prompt in scripts: `gitbroom -y`.
- Point at a non-standard default branch: `gitbroom --main develop`.

See the full [CLI reference](/gitbroom/cli/) for every flag and exit code.
