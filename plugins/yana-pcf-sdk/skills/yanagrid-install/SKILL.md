---
name: yanagrid-install
description: Used when installing, binding, or deploying YanaGrid into Power Platform forms, sub-grids, or solutions, including legacy migration — NOT generic "integrate" questions.
when_to_use: install YanaGrid, deploy YanaGrid, Power Apps form binding, sub-grid binding, home grid binding, import TechnosoftDmsCoreComponents, solution import, WebResource install, Technosoft.Yana.Grid.js install, JS library install, form library, migrate from legacy, TechnosoftDmsCoreGrid uninstall, first-time setup YanaGrid, bind YanaGrid, verify install, smoke test install.
---

# YanaGrid Install

Answer install, form-binding, deployment, and migration questions for YanaGrid.

> Apply shared rules in `${CLAUDE_SKILL_DIR}/../../references/_skill-rules.md`.

For YanaGrid manifest property semantics → `yanagrid-api`.
For functional how-to / features / what's new → `yanagrid-manual`.
For the JavaScript event API → `yanagrid-events`.
For YanaQuickView install → `yanaquickview-install`.

## Decision tree

All paths resolve under `${CLAUDE_SKILL_DIR}/../../references/`. Use `Read` with `offset` / `limit` for the matching §section.

| User asks | File | §Section |
|-----------|------|----------|
| "Install YanaGrid" / first-time setup | `yanagrid-install.md` | §Prerequisites → §Step 7 — Verify the install |
| "Migrate from an older YanaGrid version" | `yanagrid-releases.md` | §Upgrade guidance |
| "Bind to sub-grid or home grid" | `yanagrid-install.md` | §Step 3 — Bind YanaGrid to a sub-grid or home grid |
| "Set manifest properties on the form" | `yanagrid-install.md` | §Step 5 — Set manifest properties |
| "Enable Quick View toolbar" | `yanagrid-install.md` + `yanagrid-api.md` | §Step 6 — Seed Quick View configuration + §Quick View toolbar |
| "Verify the install" / smoke test | `yanagrid-install.md` | §Step 7 — Verify the install |
| "Install Technosoft.Yana.Grid.js WebResource" | `yanagrid-install.md` | §Step 2 — Install Technosoft.Yana.Grid.js WebResource |
| "How do I install the plugin / what does it ship?" | `plugin-install.md` | whole doc |
