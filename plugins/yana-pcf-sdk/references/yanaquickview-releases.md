# YanaQuickView — Release Notes

Curated, version-by-version change history for the standalone YanaQuickView control. Internal task IDs and code references have been removed.

---

## v1.0.0 — May 2026

**Initial release.**
**Solution:** Ships inside umbrella `CORE Custom Control` (`CORECustomControl`, introduced with YanaGrid v1.4.0)

### Features

- **Config-driven accordion** — each `<Query>` block in the configuration becomes one accordion section.
- **Parallel section loading** — sections fetch in parallel; a failing section never blocks siblings.
- **Per-section states** — loading shimmer, empty ("No data available"), and error-with-retry are scoped per section.
- **Read-only grids** — built on Fluent UI v8 `DetailsList`. No inline edit, sort, or filter.
- **Locale formatting** — currency, date, and lookup values use Dataverse-formatted strings.
- **Column width hints** — `minwidth` attribute on `<attribute>` controls minimum column width.
- **Placeholder substitution** — `CurrentRecordId` and `CurrentUserId` in FetchXML filter conditions are substituted at runtime.
- **Service isolation** — each control instance has its own service state; multiple controls on the same form do not share state.

### Manifest properties

| Property | Type | Binding | Purpose |
|----------|------|---------|---------|
| `quickViewConfigName` | SingleLine.Text | input | Name of the `<*Config>` block to read |
| `selectedQuery` | SingleLine.Text | bound | Output — name of the currently selected section |

### Deployment

YanaQuickView v1.0.0 ships inside the umbrella Dataverse solution **CORE Custom Control** (`CORECustomControl`). It is **not** published as a separate solution.

- **New tenants:** install `CORE Custom Control` (`CORECustomControl_<version>_managed.zip`).

### Origin

The same Quick View component is embedded in the YanaGrid toolbar (YanaGrid v1.4.0). Both variants share the same configuration record and the same runtime behavior.

---

## See also

- `yanaquickview-api.md` — API surface
- `yanaquickview-install.md` — install + embedding
- `yanaquickview-manual.md` — end-user + implementer how-to
- `yanagrid-releases.md` — YanaGrid release notes (Quick View toolbar history)

---

> **Bundle metadata** — generated 2026-09-04 from `.public-docs/yanaquickview-releases.md` for plugin version 1.4.0.