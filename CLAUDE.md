# Cafe Prana v2

## Agent skills

### Issue tracker

GitHub Issues on `Cry0nicS/cafe-prana-v2`, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical roles, each label named after its role. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Worktrees

`.worktreeinclude` copies `.env` and `node_modules/` into a new worktree. It deliberately does
not copy `.nuxt/`, so **run `npm run postinstall` first** in a fresh worktree: without it the test
suite and typecheck both fail on a missing `.nuxt/tsconfig.server.json`. It takes about two
seconds.

Parallel dev servers across worktrees are fine. The lock is `.nuxt/nuxt.lock`, one per worktree,
and the second `npm run dev` takes the next free port (3001, 3002, ...). Two dev servers in the
*same* worktree are refused by that lock, which is what it is for.
