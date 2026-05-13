---
name: yanaquickview-api
description: Used when looking up YanaQuickView manifest properties, configuration XML, error messages, or compatibility limits — NOT for JavaScript events or JS API questions.
when_to_use: quickViewConfigName, selectedQuery, FamilyTreeConfig, YanaQuickView manifest, QuickView config XML, xts_pluginconfiguration QuickView, CurrentRecordId, CurrentUserId, accordion section configuration, QuickView errors, QuickView limits, QuickView error message, QuickView compatibility, QuickView configuration shape.
---

# YanaQuickView API Reference

Answer questions about YanaQuickView manifest properties, runtime behavior contracts, configuration XML shape, error messages, and compatibility limits.

> Apply shared rules in `${CLAUDE_SKILL_DIR}/../../references/_skill-rules.md`.

For YanaQuickView install / embedding → `yanaquickview-install`.
For YanaQuickView features / how-to / changelog → `yanaquickview-manual`.
For YanaGrid manifest properties and config → `yanagrid-api`.

## Decision tree

All paths resolve under `${CLAUDE_SKILL_DIR}/../../references/`. Use `Read` with `offset` / `limit` for the matching §section.

| User asks | File | §Section |
|-----------|------|----------|
| YanaQuickView manifest property by name | `yanaquickview-api.md` | §Property reference |
| Standalone QuickView config XML | `yanaquickview-api.md` | §Configuration shape + §Configuration recipes |
| Error code / message lookup (QuickView) | `yanaquickview-api.md` | §Errors |
| Supported types / compatibility (QuickView) | `yanaquickview-api.md` | §Compatibility |
| Limits / known limitations (QuickView) | `yanaquickview-api.md` | §Limitations |
| Behavior changes by release (QuickView) | `yanaquickview-api.md` | §Versioning |
