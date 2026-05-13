---
name: yana-pcf-api-reference
description: Used when looking up Yana PCF manifest properties, behavior contracts, configuration XML shape, or error messages for YanaGrid / YanaQuickView.
when_to_use: what does <property> do, manifest, behavior contract, error message, configuration shape, FetchXML placeholder, supported types, footerAggregateColumns, calculationFormulas, parentUpdateFormulas, enableGroupBy, readOnlyColumns, readOnlyStatus, autoSaveRecord, quickViewConfigName, selectedQuery, xts_pluginconfiguration.
---

# Yana PCF API Reference

Answer questions about runtime behavior and the public configuration surface of YanaGrid / YanaQuickView.

> Apply the shared rules in `${CLAUDE_SKILL_DIR}/../../references/_skill-rules.md` before answering.

For install / deployment → `yana-pcf-integration`.
For functional how-to / features / what's new → `yana-pcf-features`.

## Decision tree

All file names below resolve under `${CLAUDE_SKILL_DIR}/../../references/`. Use `Read` with `offset` / `limit` for the matching §section.

| User asks | File | §Section |
|-----------|------|----------|
| YanaGrid manifest property by name | `yanagrid-api.md` | §Property reference |
| YanaGrid Quick View toolbar config | `yanagrid-api.md` | §Quick View toolbar |
| "What happens when..." behavior | `yanagrid-api.md` | §Behavior contracts |
| Config XML recipe (Grid) | `yanagrid-api.md` | §Configuration recipes |
| Standalone QuickView manifest | `yanaquickview-api.md` | §Property reference |
| Standalone QuickView config XML | `yanaquickview-api.md` | §Configuration shape + §Configuration recipes |
| Error code / message lookup | `<control>-api.md` | §Errors |
| Supported types / compatibility | `<control>-api.md` | §Compatibility |
| Limits / known limitations | `<control>-api.md` | §Limitations |
| Behavior changes by release | `<control>-api.md` | §Versioning |
