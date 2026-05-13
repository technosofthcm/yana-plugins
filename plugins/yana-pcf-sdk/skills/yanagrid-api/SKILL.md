---
name: yanagrid-api
description: Used when looking up YanaGrid manifest properties, behavior contracts, configuration XML shape, error messages, or compatibility limits — NOT for JavaScript events or JS API questions.
when_to_use: manifest property, footerAggregateColumns, calculationFormulas, parentUpdateFormulas, enableGroupBy, readOnlyColumns, readOnlyStatus, autoSaveRecord, dataset, error message, error code, Quick View toolbar configuration, xts_pluginconfiguration, compatibility, limitations, Formula., configuration XML, FetchXML placeholder, supported types.
---

# YanaGrid API Reference

Answer questions about YanaGrid manifest properties, runtime behavior contracts, configuration XML shape, error messages, and compatibility limits.

> Apply shared rules in `${CLAUDE_SKILL_DIR}/../../references/_skill-rules.md`.

For JavaScript event subscription, `getEditableGrid`, cell manipulation → `yanagrid-events`.
For install / form binding / deployment → `yanagrid-install`.
For functional how-to, features, changelog → `yanagrid-manual`.
For YanaQuickView manifest properties and config → `yanaquickview-api`.

## Decision tree

All paths resolve under `${CLAUDE_SKILL_DIR}/../../references/`. Use `Read` with `offset` / `limit` for the matching §section.

| User asks | File | §Section |
|-----------|------|----------|
| YanaGrid manifest property by name | `yanagrid-api.md` | §Property reference |
| YanaGrid Quick View toolbar config | `yanagrid-api.md` | §Quick View toolbar |
| "What happens when..." behavior contract | `yanagrid-api.md` | §Behavior contracts |
| Config XML recipe (Grid) | `yanagrid-api.md` | §Configuration recipes |
| Error code / message lookup (Grid) | `yanagrid-api.md` | §Errors |
| Supported types / compatibility (Grid) | `yanagrid-api.md` | §Compatibility |
| Limits / known limitations (Grid) | `yanagrid-api.md` | §Limitations |
| Behavior changes by release (Grid) | `yanagrid-api.md` | §Versioning |
