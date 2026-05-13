---
name: yana-pcf-integration
description: Used when installing, binding, or deploying Yana PCF controls (YanaGrid, YanaQuickView) into Power Platform forms, sub-grids, or solutions.
when_to_use: integrate, install Yana, add YanaGrid, deploy PCF, form binding, sub-grid binding, home grid binding, seed xts_pluginconfiguration, migrate from legacy TechnosoftDmsCoreGrid solution, install umbrella TechnosoftDmsCoreComponents.
---

# Yana PCF Integration

Answer install / form-binding / deployment questions for YanaGrid and YanaQuickView.

> Apply the shared rules in `${CLAUDE_SKILL_DIR}/../../references/_skill-rules.md` before answering.

For runtime behavior of a manifest property → `yana-pcf-api-reference`.
For functional how-to / features / what's new → `yana-pcf-features`.

## Decision tree

All file names below resolve under `${CLAUDE_SKILL_DIR}/../../references/`. Use `Read` with `offset` / `limit` for the matching §section.

| User asks | File | §Section |
|-----------|------|----------|
| "Install YanaGrid" / first-time setup | `yanagrid-install.md` | §Prerequisites → §Step 7 |
| "Migrate from legacy Grid solution" | `yanagrid-install.md` | §Step 1 — Migration |
| "Bind to sub-grid or home grid" | `yanagrid-install.md` | §Step 3 |
| "Set manifest properties on the form" | `yanagrid-install.md` | §Step 5 |
| "Enable Quick View toolbar" | `yanagrid-install.md` §Step 6 + `yanagrid-api.md` §Quick View toolbar | Two reads |
| "Verify the install" / smoke test | `yanagrid-install.md` | §Step 7 |
| "Embed YanaQuickView standalone" | `yanaquickview-install.md` | §Step 2 — Embedding context |
| "Seed xts_pluginconfiguration" | `yanaquickview-install.md` | §Step 3 |
| "How do I install the plugin / what does it ship?" | `plugin-install.md` | whole doc |
