# YanaGrid — User Manual

YanaGrid is an inline-editable grid for Microsoft Power Apps model-driven apps. It replaces the default sub-grid on a parent record (e.g. a quote, work order, or invoice) with a faster editing experience that supports row save, grouping, footer totals, and related-record roll-ups.

This manual is for two audiences:

- **End users** — service advisors, parts staff, accountants, and anyone using a Yana-powered screen.
- **Implementers** — Power Platform makers configuring forms for end users.

Pick the section that fits your role.

---

## Overview

YanaGrid sits inside a record form, usually as the line-items section. It looks like a spreadsheet: rows are records, columns are fields. You edit a cell directly and the change is saved either when you leave the row (auto-save) or when you click **Save** (manual).

Key capabilities:

| Capability | What it does |
|------------|--------------|
| Inline edit | Type into a cell, change values, no separate dialog |
| Row save | Saves one row at a time |
| Auto-save (optional) | Saves automatically when you move to a different row |
| Grouping | Group rows by a column, e.g. group parts by category |
| Footer totals | Aggregate columns (sum, average, etc.) shown beneath the grid |
| Calculation formulas | Auto-calculate a column from other columns |
| Parent updates | Roll up totals from the grid into fields on the parent form |
| Quick View toolbar | Side-panel showing related-entity data (when configured) |

---

# Part A — End-user guide

This section is for people using a Yana DMS screen day to day.

## Editing a cell

1. Click (or tap) the cell you want to change.
2. Type the new value, choose from the dropdown, or pick a date.
3. Press **Tab** to move to the next cell, or click another cell.

The cell border turns blue while you are editing. A red border means the value is invalid (for example, required and empty). Hover the cell to see the validation message.

## Saving changes

Whether your screen auto-saves or not depends on how it was set up.

- **Auto-save on** — moving off the row (Tab to next row, or click another row) commits your changes automatically. You will see a brief saving indicator.
- **Auto-save off** — your changes are staged in memory until you click **Save** on the grid toolbar.

If a save fails, the row stays in edit mode with the cell highlighted and an error message. Common causes: a required field is empty, or someone else changed the same record at the same time.

## Adding a row

Click the **+ New** button on the grid toolbar (top right). A blank row appears at the bottom of the grid. Fill in the required fields and the row commits on save.

## Deleting a row

Select the row's leftmost checkbox, then click **Delete** on the toolbar. You will be asked to confirm.

## Grouping rows

If grouping is enabled, the column header has a **⋮** menu. Choose **Group by this column** to collapse the grid into sections by that column's values. Your chosen grouping is remembered the next time you open the form.

To clear grouping, open the same menu and choose **Clear grouping**.

## Footer totals

When the screen is configured with footer columns, the totals row sits beneath the grid. The function (sum, average, minimum, maximum, count) is set by the maker per column.

## Discarding changes

Use the **Discard Changes** toolbar button to revert the row to the values that were last saved. Discard does not affect other rows.

## Refreshing

The **Refresh** toolbar button reloads the data from Dataverse. With auto-save off, refresh discards staged edits — save first if you want to keep them.

## Quick View

When the **Quick View** icon appears on the toolbar, clicking it opens a dialog showing related data in an accordion. Each accordion section is a different related entity (for example, customer history, warranty claims, prior service visits).

- The first section is expanded; the rest are collapsed — click a section header to expand it.
- Each section loads independently — you can read the open section while others are still fetching.
- A section that fails shows an error message and a **Retry** button — retrying does not affect the other sections.
- The dialog has a fullscreen toggle for denser data.

Quick View grids are display-only — you cannot edit, sort, or filter inside the dialog.

## Common questions

**Why is a cell locked / greyed out?**
Either the column is configured as read-only, or the row's status puts the whole row into read-only mode (for example, a closed/completed record). Ask your administrator to unlock it if needed.

**Why didn't my change save?**
Look for a red border on a cell or a banner at the top. The grid will not save a row with invalid values. Fix the highlighted cells and save again.

**Why is the parent form showing a stale total?**
The grid updates the parent fields in memory when a row saves — the parent form itself still needs to save (or refresh) to persist. Save the parent form after editing rows.

---

# Part B — Implementer guide

This section is for Power Platform makers configuring YanaGrid for end users.

## Where to put YanaGrid

YanaGrid is a **dataset** control, so it binds to:

- A **sub-grid** on a parent form (most common — e.g. line items on an Order).
- A **view-level grid** at the entity home (less common — replaces the default editable grid).

It does not bind to a single column.

## How to install

See `yanagrid-install.md` for the full install + binding steps.

## Choosing properties

Start with a minimal configuration and add properties as needed.

| Goal | Set this property | Notes |
|------|-------------------|-------|
| Auto-save on row leave | `autoSaveRecord = true` | Reduces clicks for end users; verify the entity's save behavior works with optimistic writes |
| Footer totals | `footerAggregateColumns = "col1:sum, col2:avg"` | Only numeric columns; default function is `sum` |
| Lock columns | `readOnlyColumns = "col1, col2"` | Lock display columns that should never be edited from the grid |
| Lock by status | `readOnlyStatus = "2, 5"` | Statecodes/statuscodes that mark the whole row read-only |
| Enable grouping | `enableGroupBy = true` (default) | Disable if you don't want users to regroup |
| Calculate columns | `calculationFormulas = "{tot}={qty}*{price}"` | Targets must be writable; operators: `+ - * /` |
| Roll up to parent | `parentUpdateFormulas = "{p_tot}={c_tot}:sum"` | Fires on successful row save |

Full property reference: `yanagrid-api.md` → **Property reference**.

## Designing for end users

- Keep visible columns to a useful minimum — the bound view determines them. Edit the view, not the control.
- Mark columns that should never be edited as read-only at the **column** level (Dataverse), not at the grid level when possible — that ensures consistency across all surfaces.
- If parent rollups depend on a child column, make sure that child column is required or has a sensible default. A null source breaks `sum` / `avg`.
- Avoid stacking too many features on one form. Auto-save + complex calculations + parent updates is powerful but adds latency on every row commit.

## Quick View toolbar setup

The Quick View toolbar button activates by data, not by manifest property. To enable it for an entity:

1. Open the **`xts_pluginconfiguration`** table.
2. Create a record whose entity lookup is the host entity (e.g. Quote).
3. Put your `<Configurations>` XML into the `xts_configuration` column. See `yanagrid-api.md` → **Configuration shape**.
4. Refresh the form — the Quick View icon appears on the Grid toolbar.

Use `CurrentRecordId` and `CurrentUserId` placeholders in filter conditions to keep one configuration record reusable across all records.

## Testing checklist

| # | Test |
|---|------|
| 1 | New row, edit cells, save — record exists in Dataverse |
| 2 | Edit existing row, leave row — auto-save (if enabled) commits |
| 3 | Field validation errors block save and show red border |
| 4 | Footer aggregate values are correct after add/edit/delete |
| 5 | Grouping persists across reloads |
| 6 | `parentUpdateFormulas` writes correct values to parent fields |
| 7 | Quick View dialog opens, sections load in parallel, retry works |
| 8 | Read-only columns / read-only-by-status rows are locked |

## Support

For issues, behavior questions, or feature requests, contact the Technosoft DMS Core team. End users should escalate through their internal helpdesk first.

---

## See also

- `yanagrid-api.md` — manifest properties and behavior contracts
- `yanagrid-install.md` — install + form binding
- `yanagrid-releases.md` — version history and migration notes
- `yanaquickview-manual.md` — standalone Quick View control
- `plugin-install.md` — Claude Code plugin for developers

---

> **Bundle metadata** — generated 2026-05-13 from `.public-docs/yanagrid-manual.md` for plugin version 2.0.0.