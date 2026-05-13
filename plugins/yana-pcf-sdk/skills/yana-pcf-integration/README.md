# yana-pcf-integration

## Purpose

Route an external developer's install / deployment / binding question to the right §section of the bundled `*-install.md` references for YanaGrid and YanaQuickView, including the legacy-solution migration path and the seeding of `xts_pluginconfiguration` records.

## Pain Points

- Without this skill, Claude would either dump the full install guide or invent steps that mix Modern and Classic form designers.
- External devs do not know whether to bind via form designer or edit `ControlManifest.Input.xml`; the routing makes the correct path explicit.
- The umbrella `TechnosoftDmsCoreComponents` solution replaced per-control solutions in v1.4.0 — the skill routes migration questions to the documented uninstall-then-import sequence rather than guessing.

## Activation profile

| Field | Value |
|-------|-------|
| `description` | "Used when installing, binding, or deploying Yana PCF controls (YanaGrid, YanaQuickView) into Power Platform forms, sub-grids, or solutions." |
| `when_to_use` | install, bind, deploy, sub-grid, home grid, migrate from legacy, seed xts_pluginconfiguration |
| Loads | matching §section of `yanagrid-install.md` / `yanaquickview-install.md` / `plugin-install.md` + shared `_skill-rules.md` |

## Changelog

### 2026-05-13 — Apply skill-creator + context-engineering criteria

- Split `description` (purpose, <200 char, third-person) and `when_to_use` (trigger keyword list) per Claude Code skills schema.
- Extracted shared rules + path-resolution paragraph to `references/_skill-rules.md`; SKILL body shrinks from 36 → 23 lines.
- Declared `${CLAUDE_SKILL_DIR}/../../references/` path prefix once above the decision tree; table rows now use bare filenames.
- Removed scaffold-command trigger phrases (commands deleted in earlier work).
