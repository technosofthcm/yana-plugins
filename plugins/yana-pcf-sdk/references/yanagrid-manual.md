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
| Group subtotals | The same totals repeated on each group heading, for that group's records only |
| Row selection | Checkbox column for picking rows; selection survives moving between pages |
| Copy to clipboard | Ctrl+C copies the selected rows, ready to paste into a spreadsheet |
| Export to Excel | Download the grid's rows as an Excel workbook |
| Import from Excel | Edit an exported workbook, import it back, review the changes, then Save or Cancel |
| Calculation formulas | Auto-calculate a column from other columns |
| Parent updates | Roll up totals from the grid into fields on the parent form |
| Quick View toolbar | Side-panel showing related-entity data (when configured) |
| Keyboard and screen reader | Full keyboard navigation, with cell state exposed to assistive technology |
| Client-side paging | First/Previous/Next/Last navigation over the full loaded record set (up to 5,000 records) |
| Column reordering | Drag a column header to reposition it; remembered per view |
| Extensibility (implementers) | Custom cell rendering, configurable Add/Delete/read-only, custom command-bar buttons, and lifecycle events via the bundled JS SDK — see `yanagrid-events.md` |

---

## Part A — End-user guide

This section is for people using a Yana DMS screen day to day.

### Editing a cell

1. Click (or tap) the cell you want to change.
2. Type the new value, choose from the dropdown, or pick a date.
3. Press **Tab** to move to the next cell, or click another cell.

The cell border turns blue while you are editing. A red border means the value is invalid (for example, required and empty). Hover the cell to see the validation message. In a required column, an actual value of 0 or "No" counts as filled — only a truly blank cell is treated as missing.

Hovering a cell also shows its full value as a tooltip, which is useful when a column is too narrow to show everything. The tooltip shows the same text the cell displays — a lookup shows the record's name, a choice column its label — from the moment you make the edit, without waiting for a save. Clearing a cell leaves the tooltip empty.

### Keyboard navigation

The whole grid is reachable from the keyboard.

- **Tab** moves to the next cell, **Shift+Tab** to the previous one, and the arrow keys move between cells and rows.
- **Enter** commits the cell you are in; **Escape** abandons what you typed in it.
- Tabbing past the last cell of a row continues on the next row, and the row-action icons on the right are reachable the same way.
- After a save, focus returns to where you were working rather than jumping back to the top of the grid.

Screen readers announce each cell's column, whether it can be edited, and any validation error on it, along with which rows are selected.

### Saving changes

Whether your screen auto-saves or not depends on how it was set up.

- **Auto-save on** — moving off the row (Tab to next row, or click another row) commits your changes automatically. You will see a brief saving indicator.
- **Auto-save off** — your changes are staged in memory until you click **Save** on the grid toolbar.

Since v1.6.0, moving quickly between edited rows does not start overlapping saves for the same row. Each row waits for its own form-script save handler, so a different row finishing first cannot drop changes written by that handler or cause a duplicate create.

If validation fails, the row stays in edit mode with the cell highlighted and an error message. Common causes: a required field is empty, or the value has the wrong format or type.

For auto-save, the pager, **Add row**, and Tab navigation wait for the rows leaving the current page to finish validation and save handling. If a row is still unresolved, the grid stays on the current page so its values and feedback remain available. **Go to row** on the same page does not wait for another row's save. Host form workflows that open, close, submit, or confirm a form remain outside the grid's control.

**Clear the search before saving.** While a term is in the search box, **Save** is disabled — hover it and the grid explains why: rows hidden by the filter may have unresolved errors, and saving while they are out of view would commit problems you never had the chance to see. Clear the search and **Save** is available again. This is the same rule as **Add row**, below.

### Adding a row

Click the **Add row** button on the command bar. A blank row appears at the bottom of the grid; the grid scrolls it into view and puts the cursor in its first editable cell so you can start typing immediately. Fill in the required fields and the row commits on save. (If a required field on the current rows is still empty, the grid asks you to complete it before adding another row.)

On a grid with no rows at all you can also just click anywhere in the empty grid, or on the **Click here to add a new row** prompt, to create the first row.

**Clear the search first.** A new row starts empty, so it can never match a search term — which used to mean the row was created but stayed invisible. While a term is in the search box, **Add row** is disabled (hover it for a reminder) and clicking the empty grid adds nothing. Clear the search and the command is available again straight away. When a search matches no rows the grid says **No records match your search**, which is how you tell that case apart from a grid that is genuinely empty.

### Deleting a row

Select the row's checkbox, then click **Delete** on the toolbar. You will be asked to confirm, and the grid refreshes once you do.

### Selecting rows

The checkbox column at the left of the grid drives Delete, Copy and Export.

- Click a row's checkbox to select that row.
- Hold **Shift** and click another checkbox to select everything in between.
- Click the checkbox in the column header to select every row.

Your selection is remembered as you move between pages, so rows picked on page 1 are still selected on page 3 and are acted on together. A read-only grid has no checkboxes.

### Copying rows to a spreadsheet

Click anywhere in the grid and press **Ctrl+C** (**Cmd+C** on a Mac), or use your browser's right-click **Copy**. Then paste into Excel, Google Sheets, or any text editor.

- Rows you selected are copied. With nothing selected, every row currently loaded in the grid is copied — not just the page you are looking at.
- A header row of column names is always included, so a paste into an empty sheet arrives labelled.
- Only the columns you can see are copied, in the order they appear on screen. Hidden columns and the row-actions column are left out.
- Values are copied the way they look in the grid: dates in your format, choice and Yes/No labels, and lookup names — never internal IDs.
- If a value contains line breaks, those become single spaces so the pasted rows and columns keep their shape. When you need the exact multi-line text, use **Export to Excel** instead — there each value keeps its own cell.

While you are editing a cell, **Ctrl+C** copies the text inside that cell as usual. The grid only takes over when you are not typing in a cell. Copy also works on a read-only grid, where it takes all rows.

### Exporting to Excel

Open the **More** (**…**) menu on the grid's command bar and choose **Export to Excel**.

- Rows you selected are exported. With nothing selected, all filtered and sorted rows currently loaded in the grid are exported.
- The file keeps the columns you can see, in the order you see them, with the displayed values.
- An Excel export writes real number, currency and date cells where possible, so totals and sorting work in the workbook without retyping. It also includes a visible **Instructions** sheet explaining the editing rules and the colour legend.
- An Excel export carries hidden information identifying each record and the source table. Leave hidden rows, columns and sheets in place — they are what lets a later import match your edits back to the right records. Hidden content is not protection: anyone who receives the file can still read it.
- A row you added in the grid but have not saved yet exports without that record identity.
- The menu offers Excel only. A CSV command is not exposed on this build.

### Editing in Excel and importing back

**Import from Excel** sits alongside **Export to Excel** in the same menu, on any grid that could ever accept a file — see **When import is unavailable** below for the cases where it is disabled or absent. The round trip is: export, edit the workbook, import it back, review what the grid proposes, then use the normal **Save** or **Cancel**.

#### What you can change in the workbook

- Edit values in place, and clear a value that allows it by leaving the cell blank.
- Append rows for new records **inside the `YanaData` table** — a row added below the table is not read.
- Rename, reorder or remove the original columns if that suits you; the grid still recognises the ones that remain.

Grey locked cells are exported for reference but never imported, even if you change them. These are read-only fields and rows, calculated and rollup fields, formula results, and field types the import does not support. Where a note is available, it explains how the value is calculated. The workbook shows the calculated value, not a live Excel formula.

Owner and Customer lookups are display-only in YanaGrid, so they are also exported as grey locked cells and ignored on import. In an editable cell, enter a literal value rather than an Excel formula: a formula in an importable cell rejects that workbook row and tells you to replace it with the calculated value.

Dates keep the same meaning through the round trip: **Date Only** keeps its calendar date, **User Local** uses the time zone recorded in the export, and **Time-Zone Independent** keeps the clock time you entered. A User Local time that falls in a daylight-saving gap or overlap is rejected rather than guessed; choose an unambiguous time and import again.

#### Reviewing and applying the changes

Choose **Import from Excel** and pick your file. The grid reads it and shows you what it found before changing anything:

- **Rows to update** — existing rows whose values differ from the grid.
- **Rows to add** — workbook rows with no record identity yet.
- **Unchanged rows** — rows it recognised but whose importable values did not change.
- **Skipped rows** — rows it will not act on, each with the reason.
- **Changed in Dataverse since export** — rows whose record someone else changed after you exported. These are **never applied**, so newer data is not overwritten; the section lists each one with the reason and what to do about it. There is no way to overwrite one of them from the review, individually or in bulk. To get your edits onto those records, export the grid again — the fresh file carries the newer values — re-apply your edits there, and import that.
- **Rejected rows** — rows it could not read, each naming the workbook row and the reason in one line. A value that could match more than one record — a lookup name shared by two records, for example — is rejected rather than guessed.
- **Ignored cells** — cells it deliberately left alone, such as the grey locked ones.
- **Unknown added columns** — columns that were not part of the export and are ignored with a warning.

Closing the review changes nothing. **Apply** turns the accepted changes into ordinary unsaved grid edits, marked dirty exactly as if you had typed them: **Save** commits them and **Cancel** puts the grid back as it was, with the usual validation, calculated columns and parent totals all behaving normally.

A row that is in the grid but missing from your workbook is never touched and never deleted. Re-importing an export you did not change reports no changes at all.

#### If the records move before you save

Between **Apply** and **Save**, the grid re-checks that the records you reviewed are still the ones it is about to write. If any of them changed in Dataverse in the meantime, could not be re-read, or the check itself could not complete, the **whole save is refused** — not just the affected rows. Nothing is written, and the grid says how many records are involved.

This is deliberately all-or-nothing: you approved a set of changes, and there is no honest way to commit only the part of it that still happens to be safe. To recover, use **Refresh** — which discards the staged import — then export, re-apply your edits, and import again against the current data. Ordinary typed edits are not subject to this check.

#### Importing a file the grid did not export

You do not have to start from an export. If the file has no YanaGrid export identity — a workbook you built yourself, or an export from an older version of the grid whose record keys can no longer be trusted — the grid switches to **column matching** instead of refusing the file.

- A **Match columns** step opens first. It shows which sheet and which heading row it detected — both of which you can change — and how each column in your file was matched to a field in the grid, along with the basis for each match. A column whose name matches a field name or a column label exactly is matched for you. A column that only *nearly* matches is listed but **not** used until you choose it; **Use all suggestions** accepts them in bulk. If two file columns end up pointing at the same field, the grid says so and will not continue until you change one.
- **Every row is added as a new record.** A file the grid did not export carries no record identity, so existing rows are never updated from one. To update rows, export the grid, edit that file, and import it back.
- From there the normal review, **Apply** and **Save** steps are the same as for a round trip.

The workbook is still refused outright when nothing can be read from it: the file is not `.xlsx`, it cannot be opened as a workbook, it has no visible sheet with data, no row reads as a heading row, there are headings but no data under them, or the heading row contains merged cells.

#### When import is unavailable

There are two different behaviours here, not one:

- **The command is removed** when the grid is read-only — the same as **Add row** and **Delete**, which also disappear rather than sit disabled. Nothing in the grid is editable, so an import has nothing it could write.
- **The command stays visible but is not selectable**, explaining itself in place and on hover, when you do not have permission to update records in this table, or the grid has unsaved edits — save or discard them first. These are softer blocks, so the command stays discoverable.

If the grid does not allow adding rows, any new row in your workbook is listed under **Rejected**, with the reason and what to do about it, and the rest of the import proceeds. Note that a file the grid did not export is create-only, so on a grid that does not allow adding rows every one of its rows is rejected and there is nothing left to apply.

Any file, whichever mode it is read in, is rejected as a whole when it holds more rows than the grid supports — it is never silently truncated to a size that fits, and the message says how many rows it has against the limit.

A round-trip export is additionally rejected as a whole, with the reason given, when it was exported from a different table, is missing its `Data` sheet or its `YanaData` table, has lost or duplicated the hidden columns that identify each record, or carries a column name that matches more than one field.

### Row actions

The **Open Record** and **Quick View** icons for a row are on the far right of the grid (matching the standard Power Apps grid layout), not the left.

### Reordering and searching columns

Drag a column header to move it — your chosen order is remembered the next time you open the form. The right-most Actions column always stays in place.

To find rows quickly, use the keyword search box on the command-bar line — type a term and the grid filters to matching rows as you type.

An option-set (choice) column whose values have colours configured shows those colours as a badge or dot next to the value, the same way colour-coded choices look elsewhere in the app.

### Grouping rows

The column header has a **⋮** menu. Choose **Group by this column** to collapse the grid into sections by that column's values. Your chosen grouping is remembered the next time you open the form.

When a column is grouped, a **Grouped by** chip appears on the command bar. Use the controls on the chip to:

- **Expand all** — open every group section at once.
- **Collapse all** — close every group section at once.
- **Remove** — clear grouping and return to the flat list.

You can also remove grouping from the column header menu by choosing **Remove grouping**.

#### Group subtotals

When the screen has footer totals configured, each group heading also shows those same totals for the records in that group alone — so you get a subtotal per group without exporting or adding anything up yourself. Editing a value updates its own group's subtotal immediately, and the subtotals respect whatever search or filter is active. Clearing the grouping removes them and leaves the footer totals as they were.

The group headings always show the same set of totals as the footer, including for a group whose records all leave that column empty.

### Footer totals

When the screen is configured with footer columns, the totals row sits beneath the grid. The function (sum, average, minimum, maximum, count) is set by the maker per column.

### Paging and grid height

The grid loads its data once and pages through it entirely in your browser — moving between pages does not reload the grid. The pager offers **First, Previous, Next, Last** buttons, the current page, and a record range (e.g. "1 - 25 of 500"). Page size follows the "Maximum number of rows" the maker configured for that view. A view with more than 5,000 matching records only loads the first 5,000.

The grid reserves a fixed height for a **full page** of rows — so a page size of 5 shows a 5-row-tall grid even when the current page has fewer records, and the height stays steady when you add a row. For a large page size, the grid grows only up to about 60% of the window height and the remaining rows scroll inside the grid, so it never takes over the whole form.

Footer totals, calculated columns, and parent roll-ups are always based on **every** record in the grid, not just the page you're viewing.

### Discarding changes

Use the **Discard Changes** toolbar button to revert the row to the values that were last saved. Discard does not affect other rows.

### Refreshing

The **Refresh** toolbar button reloads the data from Dataverse. With auto-save off, refresh discards staged edits — save first if you want to keep them.

### Quick View

When the **Quick View** icon appears on the toolbar, clicking it opens a dialog showing related data in an accordion. Each accordion section is a different related entity (for example, customer history, warranty claims, prior service visits).

- The first section is expanded; the rest are collapsed — click a section header to expand it.
- Each section loads independently — you can read the open section while others are still fetching.
- A section that fails shows an error message and a **Retry** button — retrying does not affect the other sections.
- The dialog has a fullscreen toggle for denser data.

Quick View grids are display-only — you cannot edit, sort, or filter inside the dialog.

### Common questions

**Why is a cell locked / greyed out?**
Either the column is configured as read-only, or the row's status puts the whole row into read-only mode (for example, a closed/completed record). Read-only cells show a light-gray box (full height, even when empty) and a normal cursor, so you can tell at a glance which cells you can edit. Ask your administrator to unlock it if needed. Numeric and currency columns stay right-aligned whether editable or read-only; every other column type stays left-aligned in both states.

**Why didn't my change save?**
Look for a red border on a cell or a banner at the top. The grid will not save a row with invalid values. Fix the highlighted cells and save again.

When a background save fails, the row shows **Save failed** and a persistent message identifies the row. You can continue editing another independent row without an error dialog interrupting typing. Choose **Go to row** to correct the failed row, or **Retry save** to try the same values again. Moving between rows does not repeatedly retry unchanged failed values. The message clears when the save succeeds or the changes are discarded. A hidden row remains listed; clear the search or expand its group before navigating to it.

If the grid cannot confirm whether a new row was created after a connection error, it keeps the changes pending. Choose **Check save result** to check for that same row. It will not automatically create a replacement while the result remains uncertain. Keep your entered values before refreshing or discarding, and confirm the original row's status before adding a replacement. Discarding local changes does not reverse a request the server has already accepted.

If an existing row no longer exists, saving an edit reports the missing row and keeps your unsaved values. Refresh the grid after preserving any values you need.

**I can't find a record in a lookup — Load More doesn't show any more.**
Type more of the name to narrow the search first; a new search starts at the first page of its own results. **Load More** adds the next set of matches each time you choose it, and disappears once there are no more. It is normal for a lookup to be limited to the records an administrator configured it to offer, so a record that never appears however far you page is filtered out by that configuration rather than hidden by the grid.

**The lookup list closes when I scroll it.**
Scrolling inside the result list keeps it open. If the list closes, you are most likely scrolling the form behind it — move the pointer over the list itself before scrolling.

**Why is the parent form showing a stale total?**
Parent totals first update in form memory; previews can change while you edit. Persistence follows the parent form's save and submission settings. Save the parent form after committing grid rows.

---

## Part B — Implementer guide

This section is for Power Platform makers configuring YanaGrid for end users.

### Where to put YanaGrid

YanaGrid is a **dataset** control, so it binds to:

- A **sub-grid** on a parent form (most common — e.g. line items on an Order).
- A **view-level grid** at the entity home (less common — replaces the default editable grid).

It does not bind to a single column.

### How to install

See `yanagrid-install.md` for the full install + binding steps.

### Choosing properties

Start with a minimal configuration and add properties as needed.

| Goal | Set this property | Notes |
|------|-------------------|-------|
| Auto-save on row leave | `autoSaveRecord = true` | Reduces clicks for end users; verify the entity's save behavior works with optimistic writes |
| Footer totals | `footerAggregateColumns = "col1:sum, col2:avg"` | Only numeric columns; default function is `sum` |
| Lock columns | `readOnlyColumns = "col1, col2"` | Lock display columns that should never be edited from the grid |
| Lock by status | `readOnlyStatus = "2, 5"` | Statecodes/statuscodes that mark the whole row read-only |
| Calculate columns | `calculationFormulas = "{tot}={qty}*{price}"` | Targets must be writable; operators: `+ - * /` |
| Roll up to parent | `parentUpdateFormulas = "{p_tot}={c_tot}:sum"` | Previews update in parent form memory; persistence follows parent save/submission settings |

Grouping is always available — no property is required. Users initiate grouping from each column header's menu ("Group by this column"). The **Grouped by** chip on the command bar provides **Expand all**, **Collapse all**, and **Remove** controls. Group headings reuse `footerAggregateColumns`, so configuring footer totals is what gives users per-group subtotals — there is no separate per-group setting.

Copy, **Export to Excel** and **Import from Excel** are likewise not controlled by any property. Both export and import commands live in the command bar's **More** (**…**) menu. Import is not unconditionally present, though: a read-only grid **removes** it outright, the same way it removes Add and Delete, while a missing update privilege or unsaved edits leave it listed but disabled with the reason attached. It otherwise respects the user's create and update privileges and the grid's own add-row rules — see Part A, **When import is unavailable**.

### Custom icons on buttons and cells

Custom command buttons and SDK-styled cells take their icon from one of two fields.

- **`webResourceIcon`** — the **name** of a Dataverse web resource holding **monochrome** artwork, exactly as it appears in the solution (`xts_/icons/vin.svg`), never a path or a URL. The grid resolves the location, so the same name works for managed and unmanaged deployments. The artwork is drawn as a mask filled with the surrounding text colour, which is why it must be single-colour: it dims with a disabled button and follows an explicit cell text colour for free.
- **`icon`** (`name` on a cell) — a built-in Fluent icon name (`Copy`), an emoji or symbol (`emoji:✅`, `glyph:→`, or just `✅`), a web-resource **path** (`url:/WebResources/xts_icons/vin.svg`, or the bare `/WebResources/…` path), or an image data URI (`data:image/svg+xml;base64,…`). Anything else — raw SVG markup, an off-origin URL, a malformed icon name — is dropped, and the icon simply does not render.

**Precedence is by presence, not by outcome.** A `webResourceIcon` whose *name* is valid wins outright and `icon` is never consulted — so what renders does not depend on whether the artwork happened to load. `icon` is reached only when `webResourceIcon` is absent or its name is rejected (wrong characters, a non-image extension, a scheme or a `..` segment). Do not rely on `icon` as a runtime fallback for a web resource that is missing from the environment: a validly-named but unreachable resource renders **nothing**, not the icon name. It leaves the button label or the cell value intact and logs what could not be found.

Icons sit in a fixed box so artwork of any source dimensions leaves command-bar height, row height and column width unchanged. That box is 16×16 on command buttons and cannot be changed; a cell may override it with `size`.

See `yanagrid-events.md` for the exact fields and worked examples.

### Row-selection events for form scripts

Since v1.6.0, a form script can subscribe to effective row-selection changes through `addOnSelectionChange`, detach through `removeOnSelectionChange`, and read the current selection through `getSelection()`. The event reports completed selection changes for the correct YanaGrid instance; it does not cancel a selection or make buttons appear automatically. Read the initial state with `getSelection()` because no selection event fires when the grid first loads. See `yanagrid-events.md` for the payload, timeout behavior and worked example.

Full property reference: `yanagrid-api.md` → **Property reference**.

### Designing for end users

- Keep visible columns to a useful minimum — the bound view determines them. Edit the view, not the control.
- Mark columns that should never be edited as read-only at the **column** level (Dataverse), not at the grid level when possible — that ensures consistency across all surfaces.
- If parent rollups depend on a child column, make sure that child column is required or has a sensible default. A null source breaks `sum` / `avg`.
- Avoid stacking too many features on one form. Auto-save + complex calculations + parent updates is powerful but adds latency on every row commit.

### Quick View toolbar setup

The Quick View toolbar button activates by data, not by manifest property. To enable it for an entity:

1. Open the **`xts_pluginconfiguration`** table.
2. Create a record whose entity lookup is the host entity (e.g. Quote).
3. Put your `<Configurations>` XML into the `xts_configuration` column. See `yanagrid-api.md` → **Configuration shape**.
4. Refresh the form — the Quick View icon appears on the Grid toolbar.

Use `CurrentRecordId` and `CurrentUserId` placeholders in filter conditions to keep one configuration record reusable across all records.

### Testing checklist

| # | Test |
|---|------|
| 1 | New row, edit cells, save — record exists in Dataverse |
| 2 | Edit existing row, leave row — auto-save (if enabled) commits |
| 3 | Field validation errors block save and show red border |
| 4 | Footer aggregate values are correct after add/edit/delete |
| 5 | Grouping persists across reloads; Expand all / Collapse all work from the Grouped by chip |
| 6 | `parentUpdateFormulas` writes correct values to parent fields |
| 7 | Quick View dialog opens, sections load in parallel, retry works |
| 8 | Read-only columns / read-only-by-status rows are locked |
| 9 | Group headings show the same totals as the footer, including for a group whose values are all empty |
| 10 | Select rows across two pages, Ctrl+C, paste into Excel — header row plus exactly those rows, labels not IDs |
| 11 | Export to Excel, change nothing, import back — the review reports no changes |
| 12 | Export, change one value, import, Apply — Save commits it, Cancel discards it |
| 13 | With a search term that matches nothing, Add row is disabled and clicking the grid adds no row |
| 14 | Tab and arrow keys reach every editable cell and the row actions, in a logical order |
| 15 | Import a workbook the grid never exported — Match columns opens, and every row is proposed as a new record |
| 16 | On a read-only grid, Import from Excel is absent from the More menu (not merely disabled) |
| 17 | Import, Apply, then change one of those records elsewhere — Save is refused outright and writes nothing |
| 18 | With unsaved edits and a search term active, Save is disabled with its tooltip; clearing the search re-enables it |
| 19 | Subscribe to `addOnSelectionChange`, select and clear rows, then confirm `getSelection()` returns the same effective selection |
| 20 | With an asynchronous `addOnSave` handler, leave two edited rows quickly — each row saves once with its own handler-written values |

### Support

For issues, behavior questions, or feature requests, contact the Technosoft DMS Core team. End users should escalate through their internal helpdesk first.

---

## See also

- `yanagrid-api.md` — manifest properties and behavior contracts
- `yanagrid-install.md` — install + form binding
- `yanagrid-releases.md` — version history and migration notes
- `yanaquickview-manual.md` — standalone Quick View control
- `plugin-install.md` — Claude Code plugin for developers

---

> **Bundle metadata** — generated 2026-09-16 from `.public-docs/yanagrid-manual.md` for plugin version 1.6.1.