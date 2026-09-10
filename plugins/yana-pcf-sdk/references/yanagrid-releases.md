# YanaGrid — Release Notes

Curated, version-by-version change history for YanaGrid. Each entry summarises user-facing changes and migration steps. Internal task IDs and code references have been removed; if you need deeper detail, contact the Technosoft DMS Core team.

---

## Unreleased

**Solution:** Managed `CORE Custom Control` (`CORECustomControl`)

Adds solution-shipped icons for command buttons and cell icons, plus a wider set of icon sources.

### New features

- **Row-selection events.** `addOnSelectionChange` / `removeOnSelectionChange` notify a form script whenever the grid's effective row selection changes, and `getSelection()` reads the current selection on demand (useful for the initial state, since no notification fires on load). A notification tracks the selected *set*, not the gesture: re-clicking an already-selected row is silent, and so are filtering and an ordinary page change. Sorting is not yet confirmed silent — write your handler so re-running it for an unchanged selection is harmless. See **`addOnSelectionChange` / `removeOnSelectionChange`** in the events reference for the full contract.
- **Web-resource icons.** `addButton` and `cell.setIcon` accept a new `webResourceIcon` field taking a Dataverse web resource **name** (e.g. `"xts_/icons/vin.svg"`). The artwork must be **monochrome**: it is painted in the text colour beside it, so it follows the button's hover/pressed/disabled state and dims with a read-only cell for free. It renders in a fixed 16×16 box, so any source dimensions leave command bar height, row height and column width untouched, and it takes precedence over `icon` / `name`. See **Button and cell icons** in the events/API reference.
- **More icon sources.** The existing `icon` (button) and `name` (cell) fields now also accept an emoji or symbol (`"emoji:✅"`, or a bare symbol), a web-resource path (`"url:/WebResources/…"`), and an image data URI — alongside Fluent UI icon names, which are unchanged.
- **Graceful degradation.** A web resource that does not exist or is not published leaves the button with its label and the cell with its value — including `position: "only"` — and logs a console warning naming the button or row/column and the resource it rejected.

### Behaviour changes

| Change | Who is affected | Action |
|--------|-----------------|--------|
| A cell icon with an explicit `color` now dims on a read-only cell, matching the cell's own text. | Scripts calling `setIcon` with `color` on rows that can become read-only. | None required. Omit `color` if you want the icon to track the cell's text colour in every state. |
| An unrecognised icon value is never drawn as literal text. | Scripts passing a mistyped Fluent name containing punctuation (`"Save-2"`, `"Warning!"`). | None required — these render no icon, as they always did. Fix the name to get the icon back, or use `"emoji:…"` if you genuinely wanted the character. |

---

## v1.5.1 — August 2026

**Upgrade from:** v1.5.0
**Solution:** Managed `CORE Custom Control` (`CORECustomControl`)

A bugfix release correcting three defects in the JavaScript SDK contract. All three are long-standing — they behave the same way on v1.4.x — and were found by the SDK regression pass for v1.5.0. No configuration properties change, and YanaQuickView is unaffected.

### Fixes

- **`getParentEntity()` returned nothing when the grid was fetched directly.** A grid obtained with `getEditableGrid(...)` reported `getParentEntity()` as `undefined`, while an event handler's `eventContext.data.parentEntity` was populated in the same session. Both paths now return the same host form entity reference.
- **The SDK listed cells the grid does not display.** `row.cells` included hidden columns, which have no on-screen editor. Reading them was misleading, and writing to one never completed. The UI and SDK now use the same ordered column inventory. A bound column that starts hidden and is explicitly shown at runtime joins both inventories; runtime hide/show remains synchronized. A visible column remains present even when Dataverse reports no data type for it.
- **`setValue` could hang forever.** A `setValue` the grid never acknowledged left the promise pending with no error. It now rejects after 6 seconds with a `YanaGridTimeoutError`.
- **`getRequiredLevel()` reported optional cells as required.** It returned the string `'none'` — which is truthy — for a cell whose required level had never been set, so `if (cell.getRequiredLevel())` was true for every optional cell. It now returns `false`, and is a boolean in every state.

### Upgrade guidance

| Scenario | Action |
|----------|--------|
| `await cell.setValue(...)` anywhere in your script | No action. A call that now times out could never complete before, so no working code changes behaviour. |
| `cell.setValue(...)` called **without** `await` and without `.catch()` | Add a `.catch()`. A timeout now surfaces as an unhandled promise rejection in the browser console instead of failing silently. Test the error with `err.name === 'YanaGridTimeoutError'`. |
| `if (cell.getRequiredLevel())` | No action, and the result is now correct — it previously treated every optional cell as required. |
| `cell.getRequiredLevel() === true \|\| cell.getRequiredLevel() === 'required'` | No action. The defensive form still works and can be simplified to `cell.getRequiredLevel()`. |
| `cell.getRequiredLevel() === 'none'` | **Change required.** This never matches on v1.5.1. Use `!cell.getRequiredLevel()`. |
| Reading `isRequired` from the raw `table` in an event payload | Expect a boolean rather than `'required'` / `'none'`. |
| Iterating `row.cells` and relying on hidden columns being present | **Review.** Hidden columns are no longer listed. Make the column visible in the bound view if your script needs it. |
| Registered `Technosoft.Yana.Grid.js` as a form library | No action. It delegates to the bundled SDK, so it picks up all of the above automatically. |
| Not using the JavaScript SDK | No action required. |

---

## v1.5.0 — July 2026

**Upgrade from:** v1.4.5
**Solution:** Managed `CORE Custom Control` (`CORECustomControl`)

An extensibility-focused release: a bundled JavaScript SDK with zero setup, a custom cell rendering hook, configurable commands and a fully read-only grid, custom command-bar buttons, data-change lifecycle events, and runtime option-set choice filtering — plus layout polish, drag-to-reorder columns, coloured choice values, client-side paging, performance quick wins, and a set of fixes.

### New features

- **Bundled, zero-setup JS SDK** — the grid now publishes its own JavaScript API (`window.top.YanaEditableGrid`) directly from the control bundle. Binding the grid to a form is enough; no companion web resource, no registration step. The control signals readiness through a standard platform output change notification, so a form script subscribes the normal way (`getControl(name).addOnOutputChange(...)`). A subscriber that attaches after the grid has already loaded still receives the initial load event. Existing forms that registered the older `Technosoft.Yana.Grid.js` web resource keep working unchanged — it is now a thin, deprecated compatibility shim with the same call signatures. See `yanagrid-events.md`.
- **Custom cell rendering** — implementers can style individual cells from form-level script: text colour, bold/italic, background and border colour, alignment, a Fluent icon, and an Excel-style display format for dates and numbers. Every other cell keeps the grid's default rendering. See `yanagrid-events.md` → Cell reference → Styling.
- **Configurable commands and a fully read-only grid** — `grid.setAllowAdd(false)` and `grid.setAllowDelete(false)` hide the Add/New Form and Delete actions individually; `grid.setReadOnly(true)` puts the whole grid into read-only (no add, no delete, no cell edits) in one call, and restores the prior Add/Delete state when turned back off. Useful once a parent record reaches a released or locked status.
- **Custom command-bar buttons** — a form script can register its own buttons in the grid's own command bar (to the left of **Add row**), control their enabled/visible state at runtime, and receive clicks with the current row selection. Custom buttons work even when the grid is read-only. See `yanagrid-events.md` → EditableGrid reference → Custom command buttons.
- **Data-change lifecycle events** — `addOnRowSave` fires once after a single row is committed (auto-save, Save, or a programmatic `row.save()`), distinguishing a newly created row from an update; `addOnRowDelete` fires once after a row is removed, carrying the row's last-known values. Both complement the existing `addOnLoad` / `addOnNew` / `addOnChange` / `addOnSave` events.
- **Runtime option-set choice filtering** — form script can narrow which choices an individual option-set cell offers, using the same method names as the native model-driven choice control: `getOptions()`, `addOption(value, index?)`, `removeOption(value)`, `clearOptions()`, and `resetOptions()` to restore the full list. Narrowing is scoped to one cell (row + column) and never affects other rows. See `yanagrid-events.md` → Cell reference → Option-set choice filtering.
- **Client-side paging** — the grid loads its full result set once (up to 5,000 records) and pages entirely in the browser, with the same First / Previous / Next / Last controls and record range indicator as the standard Power Apps sub-grid. Footer aggregates, calculation formulas, and parent-update rollups compute over the complete in-memory record set rather than only the current server page.
- **Drag-to-reorder columns** — end users can drag a column header to reposition it; the order is remembered per view the next time the form is opened. The right-most Actions column stays pinned and cannot be reordered or displaced.
- **Coloured choice values** — an option-set column that has colours defined on its choices now renders those colours as a badge (single-select) or dot (multi-select and the edit dropdown) in the grid, matching the colour-coding seen elsewhere in the app.

### Changes and improvements

- **Actions column moved to the far right** — the per-row action icons (Open Record, Quick View) now render as the right-most column, matching the native Power Apps grid layout, instead of the left-most column in prior versions.
- **Keyword search replaces quick-find** — the command-bar row now has an in-control keyword search box instead of the platform's native quick-find, searching across the grid's loaded rows as you type.
- **Grouping is always-on** — grouping no longer needs to be enabled; every column header's **⋮** menu offers **Group by this column** / **Remove grouping**. The **Grouped by** chip on the command bar gained **Expand all** and **Collapse all** bulk actions alongside **Remove**, all keyboard-accessible.
- **Editable field border colour** — idle editable field borders changed from black to grey, matching the standard Dynamics 365 model-driven grid. Error, focus, required, disabled, and notification styling are unchanged.
- **Performance** — opening a record with a Yana Grid now needs far fewer requests. Metadata "describe this field" lookups per record open are down roughly 89%; total Dataverse requests on first load are down roughly 41%. On-screen behavior and re-render counts are unchanged — this removes redundant network chatter, it does not change what you see.

### Fixes

- **SDK cell clearing** — clearing a cell's value from the JS SDK now writes an empty value (or `null`) as appropriate to the column type, instead of an empty string that Dataverse could reject or silently store as `0`.
- **Footer totals no longer overlap paging controls** — the footer aggregate row and the paging controls no longer draw on top of each other.
- **Grid load event fires once** — the grid's load notification used to fire multiple times per refresh; it now fires once as expected.
- **Lookup choices no longer served from a stale cache** — a lookup dropdown now reflects records created or renamed elsewhere in the same session, instead of returning a cached result set until it happened to be evicted.
- **Two-options columns show their configured labels** — a Yes/No column with custom labels defined on the field (e.g. "Productive" / "Non Productive") now shows those labels in the grid, both read-only and while editing, instead of always showing "Yes" / "No".
- **Customer lookup search returns all matches** — a lookup search on a customer field no longer hides previously selected records or fails to find records you type a full name for.
- **Focus stays on the current row when clearing a lookup** — clearing a lookup value no longer jumps focus back to the first row.
- **Lookup search XML error and inflated record count fixed** — searching a lookup with a numeric or symbol-containing term no longer throws an XML error, and the footer now shows the grid's true record count instead of capping the display at "5000+ records".

### Property changes

- **Retained (hidden)**: `enableGroupBy` — the property still exists and continues to be honoured, but it is now hidden from the configuration dialog and defaults to `true`. Existing bindings, including `enableGroupBy = false`, keep working unchanged; no action is required.
- **Removed**: `defaultPageSize` — page size is no longer a manifest setting; the grid now pages client-side using the sub-grid's own "Maximum number of rows" configuration (see **Client-side paging** above).
- **New**: `gridEvent` (output) — a machine-written JSON descriptor `{"eventName","controlName","sequence"}` written at store-ready and on every grid lifecycle event. It is the supported wake-up channel for the bundled SDK (`addOnOutputChange`) and is never configured by an implementer — it does not appear in the control's configuration dialog.

### Upgrade guidance

| Scenario | Action |
|----------|--------|
| Was using `enableGroupBy = true` | No action. Behavior is unchanged — grouping was already on. |
| Was using `enableGroupBy = false` | No action required. The property is retained (hidden, not removed) and continues to be honoured, so grouping stays hidden for that sub-grid after upgrading. |
| Was using `defaultPageSize` | The property is removed. Page size now follows the sub-grid's own "Maximum number of rows" setting — verify that setting reflects the page size you want end users to see. |
| Registered `Technosoft.Yana.Grid.js` as a form library | Keep working unchanged. New form scripts do not need to register it — see `yanagrid-events.md`. |
| Using default configuration (no removed properties set) | No action required. |

---

## v1.4.5 — July 2026

**Upgrade from:** v1.4.4
**Solution:** Managed `CORE Custom Control` (`CORECustomControl`)

A hotfix release packaging three editable-grid fixes.

### Fixes

- **Description clears immediately alongside a related field** — clearing a linked selection field (e.g. Accessories on a car commodity/maintenance grid) now clears its dependent Description cell immediately, instead of leaving the old text in place.
- **Purchase Order Detail save no longer fails with a query-syntax error** — a save that previously failed with "Error in query syntax" for a specific lookup scenario now completes successfully.
- **New Form button opens promptly with visible feedback** — clicking **New Form** now shows a visible loading indicator while the form opens, instead of appearing unresponsive.

**Solution:** No new configuration properties; YanaQuickView is not affected.

---

## v1.4.4 — June 2026

**Upgrade from:** v1.4.3
**Solution:** Managed `CORE Custom Control` (`CORECustomControl`)

A hotfix release bundling four editable-grid fixes: form-script events that were lost when the user switched views, and three save-correctness fixes.

### Fixes

- **Form-script events survive a view change** — registered grid events (`addOnLoad` / `addOnChange`) keep working after switching the grid to another view and back, instead of silently stopping.
- **Deleting an errored row no longer blocks saving the rest** — after removing a row that had a validation error, saving the remaining valid rows now succeeds instead of being blocked by the deleted row's lingering error.
- **A newly saved row stays visible** — a row you just created no longer disappears from the grid until a manual refresh.
- **Saving several new rows at once no longer fails on a duplicate key** — adding more than one new row and saving them together now succeeds, with each row getting its own unique line number.

**Solution:** No new configuration properties; YanaQuickView is not affected.

---

## v1.4.3 — June 2026

**Upgrade from:** v1.4.2
**Solution:** Managed `CORE Custom Control` (`CORECustomControl`)

A hotfix release bundling two save-correctness fixes.

### Fixes

- **New-row save binds the correct record reference** — adding a new detail row that auto-inherits a parent lookup (e.g. business unit) now saves correctly, instead of failing because the lookup was sent as a display code rather than a proper record reference.
- **A runtime-required cell correctly blocks save** — a column marked required at runtime from form-level script now reliably blocks saving a row whose required cell is left empty, including after the grid's data reloads.

**Solution:** No new configuration properties; YanaQuickView is not affected.

---

## v1.4.2 — June 2026

**Upgrade from:** v1.4.1
**Solution:** Managed `CORE Custom Control` (`CORECustomControl`)

A bugfix (hotfix) release focused on save reliability, validation accuracy, and display refresh in the editable grid. No new configuration properties; YanaQuickView behavior is unchanged.

### Bug fixes

- **Duplicate rows on save** — adding a new row and saving no longer displays duplicate records (previously a transient duplicate appeared until a manual refresh).
- **Optional column no longer blocks save** — when form-level logic marks a grid column as not required (via the grid's required-level API), blank values in that column no longer block the save.
- **Header refresh on refresh/discard** — header/parent values stay current after a Refresh or Discard action.

### Deployment

Ships in the managed **CORE Custom Control** (`CORECustomControl`) umbrella Dataverse solution, preserving production/base identity. Import the managed solution zip (`CORECustomControl_<version>_managed.zip`) — see `yanagrid-install.md`.

### Validation

- Add a new row to an empty grid and save — confirm exactly one record (no duplicate).
- On a form where a WebResource makes a grid column optional, leave it blank and save — confirm the save succeeds.
- Make changes, then Refresh or Discard — confirm header/parent values reflect the current state.

### Property changes

- No new properties.

---

## v1.4.1 — May 2026

**Upgrade from:** v1.4.0
**Solution:** Managed `CORE Custom Control` (`CORECustomControl`)

A bugfix release restoring reliable parent/header rollups for non-admin users and calculation-formula recalculation after field updates.

### Bug fixes

- **Parent update formulas for non-admin users** — fields configured through `parentUpdateFormulas` update correctly after detail-line add, edit, and delete actions for users *without* the System Administrator role. When a security restriction legitimately prevents the update, the user now receives expected warning behavior rather than a silent no-op.
- **Calculation formulas after field updates** — configured `calculationFormulas` recalculate when their source fields are updated in the grid, so dependent target fields refresh without a manual reload.

### Deployment

Ships in the managed **CORE Custom Control** (`CORECustomControl`) umbrella Dataverse solution, preserving production/base identity.

### Validation

Verify with a **non-admin** user on a form configured with `parentUpdateFormulas`: after changing detail lines, the parent/header total should recalculate. Separately, update a calculation-formula source field and confirm the target field refreshes in place.

### Property changes

- No new properties.

---

## v1.4.0 — May 2026

**Upgrade from:** v1.3.0
**Solution:** New umbrella `CORE Custom Control` (`CORECustomControl`)

### New features

- **Generic Quick View toolbar button** — a configuration-driven popup that displays related-entity data in an accordion of read-only data grids, invoked from the Grid toolbar. The button appears automatically when an `xts_pluginconfiguration` record exists for the host entity.
- **Per-section parallel loading** — Quick View sections load in parallel; a failing section never blocks siblings. Each section has its own loading shimmer, empty state, and error-with-retry.
- **First section expanded by default** — Quick View opens with the first section visible; the rest are collapsed.
- **Fullscreen toggle** — the Quick View dialog supports fullscreen mode for dense data.
- **Standalone `YanaQuickView` PCF control** — the Quick View component is also published as its own control, embeddable outside the Grid (ribbon buttons, custom forms, other PCF controls). See the `yanaquickview-*` docs.

### Deployment

Ships in the **CORE Custom Control** (`CORECustomControl`) umbrella Dataverse solution, alongside the new standalone YanaQuickView control. Import the managed solution zip (`CORECustomControl_<version>_managed.zip`) — see `yanagrid-install.md`.

### Property changes

- **Grid manifest**: no new properties.
- **Standalone QuickView**: see `yanaquickview-releases.md`.

### Compatibility

- Grid bindings from v1.3.0 continue to work after upgrading to v1.4.0.
- No data migration required — existing `xts_pluginconfiguration` records are read as-is.

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
| any → v1.5.0 | Import managed `CORE Custom Control` (`CORECustomControl_<version>_managed.zip`). `defaultPageSize` is removed; `enableGroupBy` is retained (hidden, not removed) — see **Property changes** and **Upgrade guidance** under v1.5.0 above. New `gridEvent` output property needs no action. |
| any → v1.4.5 | Import managed `CORE Custom Control` (`CORECustomControl_<version>_managed.zip`). Drop-in over v1.4.4. |
| any → v1.4.4 | Import managed `CORE Custom Control` (`CORECustomControl_<version>_managed.zip`). Drop-in over v1.4.3. |
| any → v1.4.3 | Import managed `CORE Custom Control` (`CORECustomControl_<version>_managed.zip`). Drop-in over v1.4.2. |
| any → v1.4.2 | Import managed `CORE Custom Control` (`CORECustomControl_<version>_managed.zip`). Drop-in over v1.4.1. |
| any → v1.4.1 | Import managed `CORE Custom Control` (`CORECustomControl_<version>_managed.zip`). Verify `parentUpdateFormulas` with a non-admin user after import. |
| any → v1.4.0 | Import umbrella `CORE Custom Control` (`CORECustomControl_<version>_managed.zip`). Form bindings preserved. |
| v1.2.x → v1.3.x | Drop-in. Optionally configure `parentUpdateFormulas` for new rollup behavior. |
| v1.1.x → v1.2.x | Drop-in. Optionally enable `autoSaveRecord` and `footerAggregateColumns`. |
| v1.0.x → v1.1.x | Drop-in. Optionally configure `calculationFormulas`. |

---

## See also

- `yanagrid-api.md` — current API surface
- `yanagrid-install.md` — install + migration steps
- `yanagrid-manual.md` — end-user + implementer how-to

---

> **Bundle metadata** — generated 2026-09-04 from `.public-docs/yanagrid-releases.md` for plugin version 1.4.0.