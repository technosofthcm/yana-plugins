# YanaQuickView — User Manual

YanaQuickView is a standalone PCF control that displays related-entity data as a configurable accordion of read-only grids. It is the same component that powers the YanaGrid toolbar's Quick View button — but as its own control, it can be embedded anywhere in a Power Apps model-driven form.

This manual covers the **standalone** control. For the Grid-embedded Quick View, see `yanagrid-manual.md`.

---

## Overview

YanaQuickView sits in a form section, on a ribbon button, or inside a custom page. It reads a single configuration record from Dataverse and renders an accordion. Each accordion section is a related-entity grid with read-only rows.

Key capabilities:

| Capability | What it does |
|------------|--------------|
| Config-driven layout | Adding a new related-entity section requires editing one Dataverse record, not redeploying code |
| Accordion sections | One section per `<Query>` in the configuration; first is expanded by default |
| Parallel loading | Sections fetch in parallel; a failing section does not block siblings |
| Per-section states | Loading shimmer, empty message, error-with-retry — scoped to one section |
| Placeholder substitution | `CurrentRecordId` and `CurrentUserId` in filter conditions are substituted at runtime |
| Locale formatting | Currency, date, and lookup values use Dataverse-formatted strings |

---

# Part A — End-user guide

## Opening the control

YanaQuickView usually appears as a section on a record's form, or behind a ribbon button. When you open the record (or click the button), the accordion appears with the first section expanded.

## Reading a section

Each section is a grid of related records. Click the section header to expand or collapse it.

- **While loading** — the section shows a shimmer placeholder.
- **No data** — the section says "No data available".
- **Loaded** — rows appear in a standard grid; column headers come from the underlying entity.
- **Error** — the section shows an error message and a **Retry** button. Retry re-runs only that section; other sections are unaffected.

## What you cannot do

The grids inside YanaQuickView are display-only.

- No inline edit
- No sort
- No column filter
- No row delete

To change a related record, open the record itself (usually by clicking the record name in the original parent record).

## Fullscreen mode

If the parent screen offers a fullscreen toggle, use it to give the accordion more horizontal space when sections have many columns.

---

# Part B — Implementer guide

This section is for Power Platform makers configuring YanaQuickView.

## Where to put YanaQuickView

YanaQuickView is most useful for:

- **Related-record overview panels** on a parent form — e.g. show all warranty claims, service visits, and ownership history for a vehicle in one collapsible section.
- **Ribbon-launched panels** — open a Quick View from a button on a list grid.
- **Custom pages** — embed alongside dashboards.

It binds to a single text column for the `selectedQuery` output.

## How to install

See `yanaquickview-install.md` for the full install + embedding steps.

## Choosing properties

YanaQuickView has only two manifest properties.

| Property | Set to | Purpose |
|----------|--------|---------|
| `quickViewConfigName` | The XML wrapper tag name (e.g. `FamilyTreeConfig`) | Selects which `<*Config>` block to read from the configuration record |
| `selectedQuery` | A text column on the host entity | Output — the host can react to the user changing the active section |

Both are optional. With both empty, the control reads the first configuration block it finds for the entity.

Full property reference: `yanaquickview-api.md` → **Property reference**.

## Seeding the configuration record

YanaQuickView reads `xts_pluginconfiguration`, matched by entity name. To seed:

1. Open the **`xts_pluginconfiguration`** table.
2. Create a record whose entity lookup is the host entity.
3. Put the `<Configurations>` XML into the `xts_configuration` column.
4. Refresh the host form.

Configuration shape and full element reference: `yanaquickview-api.md` → **Configuration shape**.

## Designing the configuration

Each `<Query>` becomes one accordion section. Order matters — the first `<Query>` is expanded by default.

- Use `CurrentRecordId` in filter conditions to scope sections to the current record.
- Use `CurrentUserId` for sections that should filter by the logged-in user.
- Add `minwidth="170px"` to `<attribute>` tags to control column width.
- Keep section count modest — five to seven sections is usually enough. More than ten makes the accordion hard to scan.

## Testing checklist

| # | Test |
|---|------|
| 1 | Control renders without error on the host form |
| 2 | All configured sections appear in the accordion |
| 3 | First section is expanded; rest are collapsed |
| 4 | Each section fetches its data and renders rows or empty/error state |
| 5 | Sections with `CurrentRecordId` placeholder correctly scope to the parent record |
| 6 | Retry button restores a failed section without affecting siblings |
| 7 | Selecting a different section updates the bound `selectedQuery` output (if used) |

## Support

For issues or feature requests, contact the Technosoft DMS Core team.

---

## See also

- `yanaquickview-api.md` — manifest properties and behavior contracts
- `yanaquickview-install.md` — install + form embedding
- `yanaquickview-releases.md` — version history
- `yanagrid-manual.md` — Grid-embedded Quick View
- `plugin-install.md` — Claude Code plugin for developers

---

> **Bundle metadata** — generated 2026-05-13 from `.public-docs/yanaquickview-manual.md` for plugin version 2.0.0.