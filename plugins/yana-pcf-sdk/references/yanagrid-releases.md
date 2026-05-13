# YanaGrid — Release Notes

Curated, version-by-version change history for YanaGrid. Each entry summarises user-facing changes and migration steps. Internal task IDs and code references have been removed; if you need deeper detail, contact the Technosoft DMS Core team.

---

## v1.4.0 — May 2026

**Upgrade from:** v1.3.0
**Solution:** New umbrella `TechnosoftDmsCoreComponents` (replaces per-control solutions)

### New features

- **Generic Quick View toolbar button** — a configuration-driven popup that displays related-entity data in an accordion of read-only data grids. Invoked from the Grid toolbar. The button appears automatically when an `xts_pluginconfiguration` record exists for the host entity.
- **Per-section parallel loading** — Quick View sections load in parallel; a failing section never blocks siblings. Each section has its own loading shimmer, empty state, and error-with-retry.
- **First section expanded by default** — Quick View opens with the first section visible; the rest are collapsed.
- **Fullscreen toggle** — Quick View dialog supports fullscreen mode for dense data.
- **Standalone `YanaQuickView` PCF control** — the Quick View component is also published as its own control, embeddable outside the Grid (ribbon buttons, custom forms, other PCF controls). See `yanaquickview-*` docs.

### Deployment

A new umbrella Dataverse solution `TechnosoftDmsCoreComponents` replaces the legacy per-control solutions `TechnosoftDmsCoreGrid` and `TechnosoftDmsCoreQuickView`. Existing tenants must uninstall the two per-control solutions before importing the umbrella. Control IDs and manifest properties are unchanged, so form/view bindings continue to work after migration.

Full migration steps: see `yanagrid-install.md` → **Migration**.

### Property changes

- **Grid manifest**: no new properties.
- **Standalone QuickView**: see `yanaquickview-releases.md`.

### Compatibility

- Grid bindings from v1.3.0 continue to work after upgrading to v1.4.0.
- No data migration required — existing `xts_pluginconfiguration` records are read as-is.
- Pipelines that imported `TechnosoftDmsCoreGrid` or `TechnosoftDmsCoreQuickView` must be updated to import `TechnosoftDmsCoreComponents` instead. **This is a breaking change for deployment pipelines.**

---

## v1.3.0 — March 2026

**Upgrade from:** v1.2.0

### New features

- **Parent Update Formulas** — configurable aggregation (sum, avg, min, max, count) from child detail lines to parent/header form fields.
- **Dynamic default values** — entity-agnostic default value population from the parent entity on new-row create.

### Bug fixes

- Discard Changes correctly reverts data to original values.
- Refresh respects the Auto Save flag.
- Parent/header form auto-refreshes after detail line save; the "Refresh Confirm" popup no longer appears.
- Save button no longer remains disabled after a global auto-save triggers on the parent form.

### New properties

- `parentUpdateFormulas`

---

## v1.2.0

### New features

- Footer aggregation (sum, average, minimum, maximum, count) for numeric columns.
- Auto-save on row leave.
- Enhanced keyboard navigation with validation-aware Tab.
- Field validation system with real-time feedback.

### New properties

- `footerAggregateColumns`
- `autoSaveRecord`

---

## v1.1.0

### New features

- Dynamic grouping by any column with expand/collapse.
- Formula calculation system with dependency tracking.
- Multi-select option set support.

### New properties

- `calculationFormulas`
- `enableGroupBy`

---

## v1.0.0

**Initial release.**

- Inline editing for all Dataverse field types.
- CRUD operations (create, save, delete, refresh).
- Field-level and record-level security.
- Locale and internationalization support.

---

## Upgrade guidance

| From → To | Action |
|-----------|--------|
| any → v1.4.0 | Uninstall legacy per-control solutions; import umbrella `TechnosoftDmsCoreComponents`. Form bindings preserved. |
| v1.2.x → v1.3.x | Drop-in. Optionally configure `parentUpdateFormulas` for new rollup behavior. |
| v1.1.x → v1.2.x | Drop-in. Optionally enable `autoSaveRecord` and `footerAggregateColumns`. |
| v1.0.x → v1.1.x | Drop-in. Optionally configure `calculationFormulas` and `enableGroupBy`. |

---

## See also

- `yanagrid-api.md` — current API surface
- `yanagrid-install.md` — install + migration steps
- `yanagrid-manual.md` — end-user + implementer how-to

---

> **Bundle metadata** — generated 2026-05-13 from `.public-docs/yanagrid-releases.md` for plugin version 2.0.0.