---
name: yanagrid-manual
description: Used when asking what YanaGrid does, how its features work end-to-end, or what changed across versions — NOT for manifest property syntax, install steps, or JS events.
when_to_use: what does YanaGrid do, YanaGrid features, YanaGrid overview, editing rows, saving changes, grouping rows, footer totals, auto-save, parent rollup, Quick View toolbar usage, keyboard navigation, paging, page size, column reordering, column order, drag column, coloured choice values, colored choice values, release notes, changelog, v1.0, v1.1, v1.2, v1.3, v1.4, v1.5, migration notes, breaking change, what's new YanaGrid, end-user guide, implementer guide, calculation formula behavior.
---

# YanaGrid Manual

Answer questions about what YanaGrid does for the end user or maker, how features behave end-to-end, and what changed per version.

> Apply shared rules in `${CLAUDE_SKILL_DIR}/../../references/_skill-rules.md`.

For manifest property syntax / behavior contracts / error codes → `yanagrid-api`.
For install / form binding / deployment → `yanagrid-install`.
For JavaScript event subscription and cell manipulation → `yanagrid-events`.

## Decision tree

All paths resolve under `${CLAUDE_SKILL_DIR}/../../references/`. Use `Read` with `offset` / `limit` for the matching §section.

| User asks | File | §Section |
|-----------|------|----------|
| "What does YanaGrid do?" / overview | `yanagrid-manual.md` | §Overview |
| End-user editing / saving / deleting | `yanagrid-manual.md` | Part A — End-user guide |
| Grouping rows | `yanagrid-manual.md` | §Grouping rows |
| Footer aggregation / footer totals | `yanagrid-manual.md` | §Footer totals |
| Auto-save / row save semantics | `yanagrid-manual.md` | §Saving changes |
| Parent rollup / parent updates | `yanagrid-manual.md` | §Common questions + Part B |
| Column reordering / drag column headers / coloured choice values (end-user) | `yanagrid-manual.md` | §Reordering and searching columns |
| Paging / page size / grid height (end-user) | `yanagrid-manual.md` | §Paging and grid height |
| Grid-embedded Quick View toolbar | `yanagrid-manual.md` | §Quick View |
| Implementer property / design guidance | `yanagrid-manual.md` | Part B — Implementer guide |
| "What's new in YanaGrid vX.Y" / changelog | `yanagrid-releases.md` | §vX.Y |
| Migration / breaking changes by version | `yanagrid-releases.md` | §vX.Y → migration / breaking |
