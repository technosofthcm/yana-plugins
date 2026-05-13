---
name: yana-pcf-features
description: Used when asking what YanaGrid / YanaQuickView do, how features work, or what changed across versions.
when_to_use: features, capabilities, edit a cell, save changes, group rows, footer totals, parent rollup, auto-save, validation, paging, calculation formula, keyboard navigation, accordion sections, fullscreen, what's new, v1.0, v1.1, v1.2, v1.3, v1.4, release notes, changelog, migration notes, breaking change.
---

# Yana PCF Features

Answer questions about what YanaGrid / YanaQuickView do for the end user or maker, and how features behave end-to-end.

> Apply the shared rules in `${CLAUDE_SKILL_DIR}/../../references/_skill-rules.md` before answering.

For install / form binding / deployment → `yana-pcf-integration`.
For manifest property semantics / behavior contracts / error codes → `yana-pcf-api-reference`.

## Decision tree

All file names below resolve under `${CLAUDE_SKILL_DIR}/../../references/`. Use `Read` with `offset` / `limit` for the matching §section. Match the user's role: Part A = end-user wording; Part B = maker wording.

| User asks | File | §Section |
|-----------|------|----------|
| "What does YanaGrid do?" / overview | `yanagrid-manual.md` | §Overview |
| End-user editing / saving / deleting | `yanagrid-manual.md` | Part A — End-user guide |
| Grouping rows | `yanagrid-manual.md` | §Grouping rows |
| Footer aggregation / footer totals | `yanagrid-manual.md` | §Footer totals |
| Auto-save / row save semantics | `yanagrid-manual.md` | §Saving changes |
| Parent rollup / parent updates | `yanagrid-manual.md` | §Common questions + Part B |
| Grid-embedded Quick View toolbar | `yanagrid-manual.md` | §Quick View |
| Implementer property / design guidance | `yanagrid-manual.md` | Part B — Implementer guide |
| "What does YanaQuickView do?" (standalone) | `yanaquickview-manual.md` | §Overview |
| Accordion section behavior / retry / parallel load | `yanaquickview-manual.md` | §Reading a section |
| QuickView end-user limits (no edit / sort / filter) | `yanaquickview-manual.md` | §What you cannot do |
| "What's new in YanaGrid vX.Y" / changelog | `yanagrid-releases.md` | §vX.Y |
| "What's new in YanaQuickView vX.Y" | `yanaquickview-releases.md` | §vX.Y |
| Migration / breaking changes by version | `<control>-releases.md` | §vX.Y → migration / breaking |

For manifest property syntax / defaults → delegate to `yana-pcf-api-reference`. For install steps → delegate to `yana-pcf-integration`.
