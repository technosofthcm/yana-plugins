# YanaGrid — Release Notes

Curated, version-by-version change history for YanaGrid. Each entry summarises user-facing changes and migration steps. Internal task IDs and code references have been removed; if you need deeper detail, contact the Technosoft DMS Core team.

---

## v1.6.2 — September 2026

**Upgrade from:** v1.6.1
**Solution:** Managed `CORE Custom Control` (`CORECustomControl`)

A follow-up to v1.6.1 that lets the grid keep moving instead of pausing. Moving between rows and pages no longer waits for a background save, and no longer stops at a row with invalid input: that input stays on its row until it is fixed, and Save, Add row, Refresh and opening the record still refuse to write it. A background save that fails remains fully recoverable, and dates stay visible after a save.

### Fixes

- **Add row and page changes no longer wait for a background save.** The pager, **Add row**, and Tab navigation used to wait for an outgoing row's save to finish before moving, as introduced in v1.6.1. They now move immediately, letting the save continue in the background. This supersedes the v1.6.1 "Page changes wait for outgoing rows" behavior.
- **A row with invalid input no longer blocks moving.** You can move to another row, or to another page, while a row still has a missing or invalid value. What you typed and the row's error markers are kept — including while you page away and back — and a message below the command bar lists the invalid rows with **Go to row**. **Save**, **Add row**, **Refresh** and opening the record still refuse to write an invalid row, and a valid row saves on its own while another row stays invalid. Removing an unsaved new row also clears its errors, so it can no longer block **Add row**.
- **Required fields are checked when you leave the row.** An empty required cell is flagged when you leave its row, or when you save or add a row, not while you are still moving between the cells of that row. A value in the wrong format is still flagged as you type.
- **Saves still recover.** A row whose background save fails after the grid has moved on is reported through persistent row status and grid feedback, with **Go to row** and **Retry save** available; **Go to row** reaches the row on whatever page it is now on. Grid validation, including on an explicit **Save**, now shows as text below the command bar instead of a pop-up, and **Refresh** names the row it is waiting for instead of appearing to do nothing.
- **Required-field rules match the platform.** Only Business Required and System Required columns block a save — a Business Recommended column no longer does. A cell the user cannot fill (read-only, disabled, calculated, on an inactive record, or without update access) is never checked, and showing or hiding a column after load adds it to or removes it from the check.
- **Dates stay visible after a save.** A date could disappear from its cell after an auto-save, or show as `NaN/NaN/NaN`. The value now stays displayed.
- **Lookup Search works after adding a row.** In a row added with **Add row**, a lookup's **Search** could fail to open its results. It now opens reliably, and clicking **Search** in an empty required lookup no longer flags it as Required.
- **Add row's required-field check is scoped to the row you're in.** Add row checks required fields only on the row you're currently working in and any new row you've already added but not yet saved, not every row on the page.
- **Saves no longer stall on forms that still load an older `Technosoft.Yana.Grid.js`.** On a form whose form library is a copy of `Technosoft.Yana.Grid.js` older than the bundled-SDK release, every row save waited for the full save-event timeout and was then abandoned without writing. The grid now recognises that library's save acknowledgement, so those saves complete normally. On such forms the grid runs one row's `addOnSave` at a time, so each acknowledgement is matched to the right row; forms using the bundled SDK or the current compatibility shim are unchanged. The browser console logs a one-time warning that names the outdated form library — replace it with the current `Technosoft.Yana.Grid.js` from `CORE Custom Control`.
- **The save-event timeout is now 2 minutes and no longer opens a dialog.** If a form's `addOnSave` handlers do not respond within 2 minutes, the row keeps the user's changes and shows a persistent message — "Saving is taking longer than expected — we couldn't confirm this row within 2 minutes." — with **Check save result** to try again. This replaces the 20-second "Save Event Timed Out!" dialog, and supersedes the v1.6.1 note below that the 20-second timeout was unchanged.

### Form-script (SDK) changes

- **`cell.setValue()` now rejects when it is not acknowledged.** A call the grid cannot apply — typically a cell on another page — rejects with a `YanaGridTimeoutError` after 6 seconds instead of never settling. Add a `.catch()` to calls you do not await.
- **`row.save()` and `row.delete()` wait up to 30 seconds** for the grid's acknowledgement, up from 6.
- **Validation runs before `addOnSave`.** Set required new-row defaults in `addOnNew` and derived values in `addOnChange`; an invalid row never reaches `addOnSave`. See the user manual's **Choosing form-script events** section.

## v1.6.1 — September 2026

**Upgrade from:** v1.6.0
**Solution:** Managed `CORE Custom Control` (`CORECustomControl`)

A maintenance release that makes asynchronous row saves recoverable and keeps the user's work visible when a server response is delayed, rejected, or uncertain. It also corrects choice cells that broke after a save and lookup result lists that would not page past the first set of matches. Existing grid-owned save, paging, and validation behavior remains available, while native form commands continue to follow the host form's own workflow.

### Fixes

- **Validation no longer starts a save event.** Auto-save checks required fields and data types before invoking `addOnSave` or writing to Dataverse. Invalid values stay in the row and appear through cell indicators and an in-grid message; the existing 20-second save-event timeout modal is unchanged.
- **Background save failures stay visible.** A rejected row keeps its entered values and shows persistent row status plus grid feedback. Users can continue editing another independent row, select **Go to row**, or choose **Retry save**. An unchanged rejection is not retried automatically; editing the row makes it eligible for another automatic attempt.
- **Uncertain creates are reconciled safely.** When the response to a new-row create is lost, **Check save result** checks the same assigned identity and never replays a blind replacement create. If the result cannot be confirmed, the row remains unresolved with its values available.
- **Page changes wait for outgoing rows.** Pager, **Add row**, and Tab transitions wait for outgoing rows' validation and save handling. An unresolved outgoing row keeps the grid on its current page with its feedback available. Same-page **Go to row** does not wait for unrelated saves.
- **Saved rows refresh in place.** After a successful auto-save, the grid reads only that record to show server-generated values without resetting the page or overwriting other pending edits. Auto-save no longer fires the grid-wide `addOnLoad` event.
- **Choice and list cells survive an auto-save.** A single-choice column could break the grid immediately after a successful auto-save, and Language and Time Zone cells could silently go blank. Values read back after a save now keep the type each column expects, so choice, multi-choice, duration, language, and time-zone cells display correctly. Yes/No columns stay true/false and numeric columns stay numeric.
- **Load More reaches the next page in filtered lookups.** In a lookup constrained by an XML pre-search, **Load More** returned the first page of matches again instead of advancing, so records beyond the first page were unreachable. Paging now moves through the full result set while keeping the active filter, ordering, and typed-search context. **Load More** is offered only while further matches exist, and a new search restarts at the first page of its own results.
- **The lookup result list stays open while you scroll it.** Scrolling inside an open lookup's result list dismissed the list. It now stays open, so long result sets can be browsed and paged without reopening the lookup.

### Migration

- Move logic that must run after each successful auto-save from `addOnLoad` to `addOnRowSave`. Keep grid initialization and full-refresh logic in `addOnLoad`; use `addOnNew` for defaults and `addOnChange` for values derived from edits. The `addOnRowSave` callback runs before the background display refresh, so server-generated display values are not guaranteed inside that callback.
- The grid does not intercept or guarantee host-level workflows that open, close, submit, or confirm a form, including native form **Save & Close**, **Submit**, and **Confirm**. Those commands require a separate host integration contract.

### Validation

- Edit two rows in quick succession while an asynchronous `addOnSave` handler or delayed server response is active; confirm focus and both drafts remain available.
- Trigger a validation error, a rejected save, and an uncertain create; confirm the in-grid feedback, explicit actions, no blind create replay, and cleanup after success or discard.
- Move across a page boundary with an outgoing save in progress; confirm the page changes only after that row's validation and save handling settle.
- Edit a choice column in an auto-saving grid and blur the row; confirm the choice, Language, and Time Zone cells still show their values after the save completes.
- Open a lookup that is filtered by an XML pre-search and has more matches than one page; click **Load More** twice and confirm each click adds new records, then scroll inside the result list and confirm it stays open.

## v1.6.0 — 7 September 2026

**Upgrade from:** v1.5.1
**Solution:** Managed `CORE Custom Control` (`CORECustomControl`)

A feature release across three themes: moving data in and out of the grid (row selection with a spreadsheet-ready copy, and an Excel workbook you can edit and import back), grouping and aggregation (subtotals on every group header), and a second round of performance work. It also improves keyboard and screen-reader support, lets implementers use their own icons, adds a supported row-selection event surface, and fixes several save, aggregation, delete, and row-level validation defects. No configuration properties change, and YanaQuickView is unaffected.

### New features

- **Select rows and copy them to a spreadsheet.** Use the checkbox column at the left of the grid to pick one row, several, or all of them — hold **Shift** and click a second checkbox to take everything in between. Your selection is remembered as you move between pages, so rows picked on page 1 are still selected on page 3 and come out together. Press **Ctrl+C** (**Cmd+C** on a Mac), or use the browser's right-click **Copy**, and paste straight into Excel, Google Sheets, or a text editor: a header row of column names is always included, only the columns you can see are copied in the order they appear on screen, and values arrive the way they look in the grid — formatted dates, choice and Yes/No labels, and lookup names, never internal IDs. With nothing selected, every row currently loaded is copied, not just the page you are looking at. A read-only grid has no checkboxes; **Ctrl+C** there copies all rows. While you are typing in a cell, **Ctrl+C** copies the text inside that cell as usual. If a value contains line breaks they become single spaces so the pasted rows and columns keep their shape — for the exact multi-line text, use **Export to Excel** instead, where each value keeps its own cell.
- **Row-selection events.** `addOnSelectionChange` / `removeOnSelectionChange` notify a form script whenever the grid's effective row selection changes, and `getSelection()` reads the current selection on demand (including the initial empty state, because no notification fires on load). Notifications track the selected *set*, not the gesture: re-clicking an already-selected row, filtering, an ordinary page change, and sorting that leave the selected set intact are silent. See **`addOnSelectionChange` / `removeOnSelectionChange`** in the events reference for the full contract.
- **Subtotals on every group header.** With a column grouped, each group heading now shows the same totals configured for the grid footer — count, sum, average, minimum, maximum — calculated over the records in that group only, and respecting whatever filter is active. Editing a value updates its own group's subtotal immediately. Nothing new needs configuring: the group headings reuse the footer's setup, and clearing the grouping leaves the footer totals exactly as before.
- **Export to Excel, edit, and import back.** **Export to Excel** and **Import from Excel** normally appear in the **More** (…) menu on the grid's command bar. A fully read-only grid hides Import along with its other editing commands; missing privileges or unsaved edits leave it visible but disabled with the reason. The exported workbook has a **Data** sheet holding your rows and an **Instructions** sheet explaining the editing rules and the colour legend, and it carries hidden information that lets a later import match your edits back to the right records — leave hidden rows, columns and sheets in place. Numbers, currency and dates arrive as real Excel cells, so totals and sorting work in the workbook without retyping. Values you cannot change — read-only fields and rows, calculated and rollup fields, formula results, and unsupported field types — appear as grey locked cells for reference and are never imported, even if you edit them.

  Edit values in the workbook, clear a value by leaving its cell blank, and append rows for new records inside the `YanaData` table. Then choose **Import from Excel**: the grid reads the file, shows you exactly what it proposes to change — updates, new rows, rows it is skipping, and anything it rejected with the workbook row number and the reason — and changes nothing until you confirm. Accepted changes become ordinary unsaved grid edits, so **Save** commits them and **Cancel** discards them, with the usual validation, calculated columns and parent totals all behaving normally. A row that is in the grid but missing from your workbook is never touched and never deleted, and re-importing an unchanged export reports no changes at all.

  Import is unavailable when the grid is read-only, when you cannot create or update the records concerned, or while the grid has unsaved edits — save or cancel first. A lookup whose name you changed is only applied when exactly one matching record exists; otherwise that row is rejected rather than guessed. If a record was changed by someone else after you exported, that row is reported as out of date and never applied; there is no per-row or bulk override. Export again, re-apply the edit to the fresh workbook, and import it against the current data. The grid checks the accepted set again immediately before saving so a newer value is never overwritten silently.
- **Your own icons on grid buttons and cells (implementers).** A custom command button, or a cell styled through the JavaScript SDK, can now take its icon from a Dataverse web resource instead of being limited to the built-in Fluent icon set — so a grid button can carry the same icon as the ribbon button above it, and a domain concept with no built-in glyph can have a proper one. Supply the web resource name and the grid resolves the rest; the same name works for managed and unmanaged deployments. The icon is drawn in the colour of the surrounding text, so it dims with a disabled button and follows an explicit cell text colour, which means artwork must be **monochrome SVG**. A fixed icon box keeps command-bar height, row height and column width unchanged whatever the source dimensions. If the named resource is missing or cannot be drawn this way, the button keeps its label and the cell keeps its value, and a message names what was rejected. Existing buttons and cells using a built-in icon name, or no icon, are unaffected. See `yanagrid-events.md`.

### Changes

- **Adding a row now requires clearing the search first.** A new row starts empty, so it never matched an active search term — the row was created but stayed invisible and uncounted, which looked like nothing had happened. While a search term is active, clicking an empty grid or the empty-state text no longer adds a row, and the **Add row** command is disabled with a tooltip telling you to clear the search. Clear it and the command is available again immediately. The empty state now tells you which situation you are in: a genuinely empty grid keeps its clickable "add a new row" prompt, while a search that matches nothing shows **No records match your search** as plain text. Separately, if the number of rows shrinks below the page you are on — you deleted the last page's rows, or a search narrowed the results — the grid moves you to the last valid page instead of showing an empty one, with the record counts kept consistent.
- **Cell tooltips show the label, not the raw value.** Immediately after an edit, the tooltip on a lookup cell showed `[object Object]` instead of the record you had just chosen, and a changed choice cell showed the underlying number instead of its label — both corrected themselves only after a save and refresh. Tooltips now show the same text the cell displays from the moment you make the edit, for lookups, choices, multi-select choices, Yes/No and duration columns alike. Clearing a cell leaves an empty tooltip rather than placeholder text. What is stored, validated and saved is unchanged.
- **Faster record open.** A second round of data-loading work cut the requests the grid makes when a record opens by roughly a third, and the time spent fetching field information by about a quarter, with no change to what the grid does or displays.
- **Faster grouping.** Applying a grouping is about a fifth faster, and editing a cell while grouped about a fifth faster again, because groups that have not changed are now reused instead of rebuilt. Grouping setup, ordering, expanded and collapsed state, subtotals and paging behave exactly as before.
- **Lookup and number editors tidied up.** In the lookup editor the search icon no longer sits shorter than the box it belongs to, and a whole-number column no longer fails to render in certain configurations. Nothing about how you enter or store values changes.
- **Better keyboard and screen-reader support.** Focus now moves predictably through the common flows — entering and leaving a cell, adding a row, opening a lookup, and after a save — and cell roles, headers, editable state, validation errors and selection state are exposed to screen readers where that did not require rebuilding the grid's structure. Focus outlines are visible when navigating by keyboard. Mouse interaction is unchanged. Some deeper accessibility items need structural work and are not in this release.

### Fixes

- **Concurrent auto-saves could interfere with each other.** When two rows started saving close together, one row's asynchronous pre-save handler could release the other row's wait. Handler-written values could then miss the intended save, while repeated triggers could issue overlapping updates or duplicate creates. Each row now waits for its own handler, and repeated triggers for the same row share the save already in progress. No consumer script or API signature changes.
- **Footer totals only caught up after saving.** With paging turned on, editing a value left the totals along the bottom of the grid showing the old figures until you saved — and currency columns were affected while plain number columns updated correctly, which made it look inconsistent rather than broken. Totals now update as you type, for every numeric and currency column, and for rows you have just added.
- **A group with no values dropped its subtotal.** When every record in a group left a numeric column empty, that group's heading omitted the average, minimum or maximum for that column entirely, while the footer still showed a value — so the heading and the footer offered different sets of columns and you could not tell whether something was misconfigured or simply empty. Group headings now show the same set of columns as the footer, with the same value for an empty group. Groups that do contain values, and the footer itself, are unaffected; blank cells still do not count as zero.
- **A loading indicator ran behind the delete confirmation.** Selecting records and clicking **Delete** showed the confirmation dialog with a loading indicator spinning behind it, suggesting the deletion was already underway before you had confirmed. Only the confirmation is shown now. Deleting, cancelling and the refresh afterwards are unchanged, and the loading indicator still appears normally when the grid loads, pages, saves or refreshes.
- **Turning off "required" for a single row had no visible effect.** On a form whose script decides which columns apply to the row you are editing, marking a column as not required for that row correctly greyed out the cell but left the red required indicator showing — including on cells that were disabled. The indicator now follows the per-row setting, matching the rule the save check was already applying, so a cell that is not required for this row no longer looks required.

### Deployment

Ships in the managed **CORE Custom Control** (`CORECustomControl`) umbrella Dataverse solution, preserving production/base identity. Import the managed solution zip (`CORECustomControl_<version>_managed.zip`) — see `yanagrid-install.md`.

### Validation

- Select rows across two pages, press **Ctrl+C**, and paste into Excel — a header row plus exactly those rows, with labels rather than IDs.
- With an asynchronous `addOnSave` handler, leave two edited rows in quick succession and confirm each row includes its own handler-written values and produces only one create or update.
- Group by a column with a numeric average configured, and confirm every group heading shows the same set of totals as the footer, including a group whose values are all empty.
- Export to Excel, change nothing, and import the file back — the review must report no changes. Then change one value, import, confirm, and check that **Save** commits it and **Cancel** discards it.
- Type a search term that matches nothing and confirm **No records match your search** appears, that clicking the grid adds no row, and that **Add row** is disabled with its tooltip.
- Select a lookup value on a new row and hover the cell — the tooltip must show the record name, not `[object Object]`.

### Property changes

- _None._ Export and Import are always present in the export menu and are not controlled by a property. The web-resource icon is a JavaScript SDK field, not a control property.

---

## v1.5.1 — August 2026

**Upgrade from:** v1.5.0
**Solution:** Managed `CORE Custom Control` (`CORECustomControl`)

A hotfix release covering the JavaScript SDK contract, footer totals, column alignment, required-field validation, and filtering with grouping. The SDK defects below are long-standing — they behave the same way on v1.4.x — and were found by the SDK regression pass for v1.5.0. No configuration properties change, and YanaQuickView is unaffected.

### Fixes

- **`getParentEntity()` returned nothing when the grid was fetched directly.** A grid obtained with `getEditableGrid(...)` reported `getParentEntity()` as `undefined`, while an event handler's `eventContext.data.parentEntity` was populated in the same session. Both paths now return the same host form entity reference.
- **The SDK listed cells the grid does not display.** `row.cells` included hidden columns, which have no on-screen editor. Reading them was misleading, and writing to one never completed. The UI and SDK now use the same ordered column inventory. A bound column that starts hidden and is explicitly shown at runtime joins both inventories; runtime hide/show remains synchronized. A visible column remains present even when Dataverse reports no data type for it.
- **`setValue` could hang forever.** A `setValue` the grid never acknowledged left the promise pending with no error. It now rejects after 6 seconds with a `YanaGridTimeoutError`.
- **`getRequiredLevel()` reported optional cells as required.** It returned the string `'none'` — which is truthy — for a cell whose required level had never been set, so `if (cell.getRequiredLevel())` was true for every optional cell. It now returns `false`, and is a boolean in every state.
- **Footer minimum and maximum totals showed the wrong value.** When a column had more than one footer aggregate function configured (for example minimum, maximum, and average on the same numeric column), the minimum and maximum totals in the footer displayed the value of whichever function was configured last on that column, instead of their own. Each footer aggregate function now shows its own correct value. Per-group minimum/maximum totals were not affected.
- **Numeric and currency columns were left-aligned when read-only.** A numeric or currency column lined up on the right while editable but shifted to the left once the cell became read-only. These columns now stay right-aligned regardless of editable or read-only state; every other column type continues to align left in both states.
- **A required column no longer rejects a genuine `0` or "No" value.** Saving a row was blocked with a "required fields must be filled" message even when a required numeric column held `0` or a required Yes/No column was set to "No" — both are real values, not blanks. Saving now succeeds whether you commit one row at a time or several at once, and only a truly empty cell still blocks the save. This applies consistently across all column types and to the inline required indicator as well as the save check. A new row also starts a required Yes/No or choice column with its normal default value instead of showing "No" while still being flagged as missing.
- **Filtering to no results with grouping on showed every record anyway.** When a keyword filter matched no rows and a column was grouped, the grid ignored the filter and displayed all records with a "No data available" watermark instead of showing no rows. Clicking the "Click here to add a new row" prompt while a filter was active also added a row you could not see or type into, because the active filter hid it; and clicking it on a genuinely empty (unfiltered) grid could add two blank rows instead of one. Grouping now respects an active filter that matches nothing, the add-a-row prompt no longer appears while a filter is active, and it adds exactly one row when the grid is genuinely empty.

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
| Relying on `0` or "No" in a required column to block the save | **Review.** `0` and "No" now count as filled values, and the row saves. If a non-zero (or "Yes") value was actually required, express that as an explicit business rule. |
| Registered `Technosoft.Yana.Grid.js` as a form library | No action. It delegates to the bundled SDK, so it picks up all of the above automatically. |
| Not using the JavaScript SDK | No action required for the SDK changes above. |

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
| any → v1.6.0 | Import managed `CORE Custom Control` (`CORECustomControl_<version>_managed.zip`). Drop-in over v1.5.1; no configuration properties change. Review the **Changes** list under v1.6.0 above if you add rows while a search is active, if a script reads a cell's display text after an edit, or if a script clears "required" per row. |
| any → v1.5.1 | Import managed `CORE Custom Control` (`CORECustomControl_<version>_managed.zip`). Drop-in over v1.5.0; no configuration properties change. Review the **Upgrade guidance** table under v1.5.1 above if you use the JavaScript SDK, or if a required column relies on `0` or "No" being treated as empty. |
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

> **Bundle metadata** — generated 2026-09-24 from `.public-docs/yanagrid-releases.md` for plugin version 1.6.2.