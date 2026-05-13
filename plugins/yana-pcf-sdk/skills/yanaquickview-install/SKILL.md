---
name: yanaquickview-install
description: Used when installing, embedding, or deploying YanaQuickView into Power Platform forms or solutions, including seeding xts_pluginconfiguration records.
when_to_use: install YanaQuickView, embed QuickView, standalone QuickView, QuickView form binding, seed xts_pluginconfiguration QuickView, QuickView solution import, deploy YanaQuickView, first-time setup YanaQuickView, bind YanaQuickView.
---

# YanaQuickView Install

Answer install, embedding, and deployment questions for YanaQuickView.

> Apply shared rules in `${CLAUDE_SKILL_DIR}/../../references/_skill-rules.md`.

For YanaQuickView manifest property semantics → `yanaquickview-api`.
For YanaQuickView features / what it does → `yanaquickview-manual`.
For YanaGrid install → `yanagrid-install`.

## Decision tree

All paths resolve under `${CLAUDE_SKILL_DIR}/../../references/`. Use `Read` with `offset` / `limit` for the matching §section.

| User asks | File | §Section |
|-----------|------|----------|
| "Embed YanaQuickView standalone" / first-time setup | `yanaquickview-install.md` | §Step 2 — Embedding context |
| "Seed xts_pluginconfiguration" | `yanaquickview-install.md` | §Step 3 |
| "How do I install the plugin / what does it ship?" | `plugin-install.md` | whole doc |
