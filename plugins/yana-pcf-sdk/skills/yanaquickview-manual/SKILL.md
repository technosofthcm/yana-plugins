---
name: yanaquickview-manual
description: Used when asking what YanaQuickView does, how its features work end-to-end, or what changed across versions — NOT for manifest properties, install steps, or JS events.
when_to_use: what does YanaQuickView do, QuickView features, QuickView overview, reading sections, accordion expansion, fullscreen QuickView, QuickView release notes, QuickView changelog, QuickView v1.0, what's new YanaQuickView, QuickView end-user guide, QuickView limits no edit no sort no filter, retry parallel load.
---

# YanaQuickView Manual

Answer questions about what YanaQuickView does for the end user or maker, how features behave end-to-end, and what changed per version.

> Apply shared rules in `${CLAUDE_SKILL_DIR}/../../references/_skill-rules.md`.

For manifest property syntax / behavior contracts / error codes → `yanaquickview-api`.
For install / embedding / deployment → `yanaquickview-install`.

## Decision tree

All paths resolve under `${CLAUDE_SKILL_DIR}/../../references/`. Use `Read` with `offset` / `limit` for the matching §section.

| User asks | File | §Section |
|-----------|------|----------|
| "What does YanaQuickView do?" (standalone) | `yanaquickview-manual.md` | §Overview |
| Accordion section behavior / retry / parallel load | `yanaquickview-manual.md` | §Reading a section |
| QuickView end-user limits (no edit / sort / filter) | `yanaquickview-manual.md` | §What you cannot do |
| "What's new in YanaQuickView vX.Y" / changelog | `yanaquickview-releases.md` | §vX.Y |
| Migration / breaking changes by version | `yanaquickview-releases.md` | §vX.Y → migration / breaking |
