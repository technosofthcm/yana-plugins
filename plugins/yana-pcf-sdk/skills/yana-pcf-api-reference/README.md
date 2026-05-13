# yana-pcf-api-reference

## Purpose

Look up Yana PCF manifest properties, behavior contracts, configuration XML shape, and error messages from `yanagrid-api.md` / `yanaquickview-api.md`. Acts as the single grounded source for "what does <property> do" questions so that Claude does not invent surface that doesn't exist.

## Pain Points

- Without this skill, Claude would hallucinate property names, defaults, or behavior contracts when asked about manifest knobs.
- Error messages must be quoted verbatim (English 1033 resource strings); this skill enforces verbatim quoting from §Errors tables.
- Configuration XML for YanaQuickView is fragile — recipes are tested in `yanaquickview-api.md` §Configuration recipes and must be copied verbatim, not paraphrased.

## Activation profile

| Field | Value |
|-------|-------|
| `description` | "Used when looking up Yana PCF manifest properties, behavior contracts, configuration XML shape, or error messages for YanaGrid / YanaQuickView." |
| `when_to_use` | what does <property> do, manifest, behavior contract, error message, configuration shape, FetchXML placeholder, supported types, property names (footerAggregateColumns, calculationFormulas, parentUpdateFormulas, enableGroupBy, readOnlyColumns, readOnlyStatus, autoSaveRecord, quickViewConfigName, selectedQuery), xts_pluginconfiguration |
| Loads | matching §section of `yanagrid-api.md` / `yanaquickview-api.md` + shared `_skill-rules.md` |

## Changelog

### 2026-05-13 — Apply skill-creator + context-engineering criteria

- Split `description` and `when_to_use` per Claude Code skills schema; description now <200 char and third-person.
- Removed duplicated rules block; replaced with reference to shared `_skill-rules.md`.
- Path prefix declared once above decision tree; table rows now use bare filenames + `<control>-api.md` placeholder for matched control.
