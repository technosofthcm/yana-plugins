# YanaGrid — API Reference

YanaGrid is a virtual PCF dataset control for Microsoft Power Apps model-driven apps. It renders a dataset as an inline-editable grid with row save, grouping, footer aggregation, parent-record updates, and an optional toolbar-launched Quick View dialog.

This document is the **public API surface**. It describes the manifest properties an implementer configures and the runtime behavior contracts an integrator can rely on. It does **not** describe internal implementation, source layout, or extension points beyond the published manifest.

**Document scope:** YanaGrid v1.6.1 (ships in umbrella solution `CORE Custom Control`).

---

## JS SDK (bundled — zero setup since v1.5.0)

The JS SDK provides programmatic event subscription and cell manipulation from form-level scripts: subscribe to grid lifecycle events (`addOnLoad`, `addOnChange`, `addOnSave`, and more), read and set cell values, apply conditional read-only rules, and add cell notifications — all without modifying the control's manifest configuration.

Since **v1.5.0 the SDK ships inside the control bundle**. The control publishes `window.top.YanaEditableGrid` itself when it initializes, and signals readiness through the `gridEvent` output property. Consuming the grid requires **no Yana-specific setup**: bind the control, write your own form script.

### Consuming the grid without web resoures Technosoft.Yana.Grid.js

Subscribe to the control's output change from your form's OnLoad handler; when it fires the grid is alive and the API is published:

```js
this.Form_OnLoad = async function (executionContext) {
    const formContext = executionContext.getFormContext();
    const gridControlName = "my_subgrid_id";
    const editableGridControl = formContext.getControl(gridControlName);

    if (!editableGridControl) return;

    editableGridControl.addOnOutputChange(() =>
        this.Grid_OnGridOutputChange(editableGridControl, gridControlName)
    );
};

this.Grid_OnGridOutputChange = async function (editableGridControl, gridControlName) {
    const outputs = editableGridControl.getOutputs();
    const gridEventRaw = outputs?.[`${gridControlName}.gridEvent`]?.value;

    if (!gridEventRaw) return;

    let gridEventData;
    try {
        gridEventData = JSON.parse(gridEventRaw);
    } catch (e) {
        console.error(`Failed to parse gridEvent output for ${gridControlName}:`, e);
        return;
    }

	if (!(gridEventData?.eventName === "ready" || gridEventData?.eventName === "onLoad")) return;

    const editableGrid = await window.top.YanaEditableGrid.getEditableGrid(this, gridControlName);
    if (!editableGrid) return;

    // ... continue logic here
	editableGrid.addOnLoad(this.Grid_OnLoad);
    editableGrid.addOnChange("xts_unitprice", this.Xts_UnitPrice_OnChange);
};

this.Grid_OnLoad = async function (that, context) {
  const { table, parentEntity } = context.data;
  // table is the EditableGrid: table.getRows(), table.setReadOnly(true), ...
}

this.Xts_UnitPrice_OnChange = async function (that, context) {
  const cell = context.data.cell;       // the changed Cell (addOnChange only)
  const row  = context.data.row;        // the Row it belongs to
  // ...use formContext together with the grid data
}
```

### Consuming the grid with web resoures Technosoft.Yana.Grid.js

Subscribe to the control's output change from your form's OnLoad handler; when it fires the grid is alive and the API is published:

```js
this.Form_OnLoad = async function (executionContext) {
  const grid = await YanaEditableGrid.getEditableGrid(this, "my_grid");
  if (!grid) return;                       // null on the 60s ready-timeout
  
  grid.addOnLoad(this.Grid_OnLoad);
  grid.addOnChange("xts_unitprice", this.Xts_UnitPrice_OnChange);
}

this.Grid_OnLoad = async function (that, context) {
  const { table, parentEntity } = context.data;
  // table is the EditableGrid: table.getRows(), table.setReadOnly(true), ...
}

this.Xts_UnitPrice_OnChange = async function (that, context) {
  const cell = context.data.cell;       // the changed Cell (addOnChange only)
  const row  = context.data.row;        // the Row it belongs to
  // ...use formContext together with the grid data
}
```

- `getEditableGrid(controlName)` — new signature; pass the control name only. Handlers receive `undefined` as their first parameter.
- `getEditableGrid(echoToken, controlName)` — legacy signature; the first argument is echoed back to every handler as its first parameter (unchanged contract).
- **Sticky onLoad replay:** an `addOnLoad` handler registered after the grid's initial load event invokes immediately, exactly once, with the latest payload. Already-registered handlers are not re-invoked.
- The output descriptor is readable via `getOutputs()`: `formContext.getControl(name).getOutputs()["<control>.fieldControl.gridEvent"]` contains a JSON string `{"eventName","controlName","sequence"}` (`eventName`: `ready`, `onLoad`, `onChange`, `onSave`, `onNew`, `onNewForm`, `onQuickView`). For a simple wake-up you don't need to read it.

### Legacy web resource (deprecated)

`Technosoft.Yana.Grid.js` still ships for backward compatibility, but since v1.5.0 its body is a thin shim that delegates to the bundled SDK (same `getEditableGrid(context, gridId)` signature, same 60-second wait-for-ready timeout, console-only deprecation notice). Existing forms that register it as a form library keep working unchanged, **but the shim requires a YanaGrid control ≥ 1.5.0 on the form**. New consumers should not register it. It will be removed in a future major version.

**Since v1.6.0:** the bundled SDK reports row-selection changes through `addOnSelectionChange` / `removeOnSelectionChange`, and exposes the on-demand `getSelection()` read, with no manifest configuration required.

See `yanagrid-events.md` for the full JS SDK reference.

---

## At a glance

| Property | Type | Required | Default | Summary |
|----------|------|----------|---------|---------|
| `dataset` | DataSet | yes | — | Bound dataset (entity records). Supports view selector + quick find. |
| `footerAggregateColumns` | SingleLine.TextArea | no | `""` | Comma-separated column logical names with optional aggregation function. |
| `autoSaveRecord` | TwoOptions | no | `false` | Save row on blur. |
| `calculationFormulas` | SingleLine.TextArea | no | `""` | Comma-separated `{target} = {source1} op {source2}` formulas. |
| `readOnlyColumns` | SingleLine.TextArea | no | — | Comma-separated column logical names to lock. |
| `readOnlyStatus` | SingleLine.TextArea | no | — | Statecode/statuscode values that mark the entire row read-only. |
| `parentUpdateFormulas` | SingleLine.TextArea | no | `""` | Aggregate child rows into parent form fields. |
| `enableQuickView` | TwoOptions | no | `false` | Quick View: Enable. |
| `quickViewTitle` | SingleLine.Text | no | `"Quick View"` | Quick View: Title. |
| `quickViewConfigName` | SingleLine.Text | no | `""` | Quick View: Config Name. |
| `gridEvent` | SingleLine.Text (output) | — | — | Machine-written lifecycle event descriptor; subscribe via `addOnOutputChange`. Never configured. |

Quick View is also activated automatically when an `xts_pluginconfiguration` record exists for the entity — see **Quick View toolbar** below.

**Removed in v1.5.0**: `defaultPageSize` — page size now resolves at runtime from the sub-grid configuration. See `yanagrid-releases.md` for migration details.

**Retained (hidden) in v1.5.0**: `enableGroupBy` still exists on the control but is hidden from the configuration dialog and defaults to `true`. It is not removed, and existing bindings — including `enableGroupBy = false` — continue to be honoured unchanged.

---

## Property reference

### `dataset`

Bound dataset. The control consumes the records returned by the bound view.

- **Capabilities**: `displayViewSelector:true; displayQuickFind:true`
- **Supported bound column types**: SingleLine.Text, Multiple, DateAndTime.DateAndTime, DateAndTime.DateOnly, OptionSet, TwoOptions, MultiSelectOptionSet, Lookup.Simple, Decimal, Currency, FP, Whole.None.
- **Required**: yes — the control will not initialize without a bound dataset.

### `footerAggregateColumns`

Renders an aggregate row at the bottom of the grid for the listed columns.

- **Format**: comma-separated. Each entry is `columnLogicalName` or `columnLogicalName:function`.
- **Functions**: `sum`, `avg`, `min`, `max`, `count`. Default is `sum` when omitted.
- **Example**: `"totalamount:sum, quantity:sum, duration:avg"`
- **Notes**: An entry is dropped only when its column is **not on the bound view** — the grid resolves the data type from the bound columns, and a name it cannot resolve produces no footer entry at all. Being non-numeric is *not* what drops an entry. A text column that **is** on the view aggregates and renders: blank and null cells drop out first (so they do not dilute `avg` or inflate `count`), then each remaining value is stripped down to its digits, sign and decimal point, and anything still unparseable counts as `0`. So `sum` over a text column holding `"12 units"` and `"abc"` is `12`, and `avg` is `6` — not "ignored". Configure only genuinely numeric columns — currency, decimal, float, whole number — and check the column name against the view when a total does not appear.
- **Group subtotals (v1.6.0)**: this same configuration also drives the per-group totals shown on each group heading while a column is grouped. There is no separate per-group property — see **Grouping → Group aggregates**.

### `autoSaveRecord`

When `true`, the grid commits the row to Dataverse on row blur (after the user leaves the row). When `false`, the user must explicitly trigger save.

- **Effect on `parentUpdateFormulas`**: parent previews can update while editing. Writing a preview to the parent form and enabling its submission are separate; persistence follows the parent form's save/submission settings.
- **Conflict behavior**: optimistic — last writer wins. The control surfaces a save error if Dataverse rejects.
- **Deleted rows**: updating an existing row never creates a replacement when that row has been deleted. Unsaved edits remain available until explicitly discarded or refreshed.
- **Uncertain creates**: a pending new row retains its assigned identity. If a create response is lost, later save attempts check that exact identity instead of replaying the write. A confirmed record is adopted without overwriting concurrent server changes; newer local edits remain pending. If the outcome cannot be confirmed, the row stays unresolved. This protection lasts for the pending-row lifecycle and ends when its state is explicitly discarded, refreshed, or reloaded.
- **Create ordering**: create requests from separate saves within one control instance are serialized. This does not coordinate other control instances, tabs, or users; server-side numbering and uniqueness rules remain responsible for those concurrent writers.

### `calculationFormulas`

Configurable in-grid calculations. Updates the target column when source columns change.

- **Syntax**: `{target_field} = {source_field1} <op> {source_field2}`
- **Operators**: `+`, `-`, `*`, `/`. Parentheses for precedence.
- **Example**: `"{total_amount} = {unit_price} * {quantity}, {tax_amount} = {total_amount} * 0.10"`
- **Notes**: Targets must be writable columns on the bound entity. Source fields can be any visible column. Cycles raise a configuration error (see Errors).

### `readOnlyColumns`

Comma-separated list of column logical names that the grid renders as read-only regardless of the user's field-level security.

- **Format**: `"xts_field1, xts_field2"`
- **Use case**: columns that the integrator wants displayed but never edited from this grid.

### `readOnlyStatus`

Comma-separated list of `statuscode` values; when the row's `statuscode` matches, the entire row becomes read-only.

- **Format**: integer option-set values, e.g. `"2, 5, 100000001"`
- **Behavior**: applied per-row at render time. Status changes require a refresh to update read-only state.

### `gridEvent` (output, v1.5.0)

Output-only property the control writes at store-ready and on each grid lifecycle event. It is the supported wake-up channel for form scripts (`addOnOutputChange`) and is **never configured by an implementer** — it does not appear in the control's configuration dialog and needs no designer setup.

- **Value**: JSON string `{"eventName": "...", "controlName": "...", "sequence": n}`.
- **Event names**: `ready` (store initialized — the safe moment to call `getEditableGrid`), then `onLoad`, `onChange`, `onSave`, `onNew`, `onNewForm`, `onQuickView` as they occur.
- **`sequence`** increments on every emission so the output value always changes.

### `parentUpdateFormulas`

Aggregates child-row values into fields on the parent (host) form when the grid saves.

- **Syntax**: `{parent_field} = {child_field}:aggregation_function`
  - `parent_field`: logical name on the parent/header entity (the form hosting the grid)
  - `child_field`: logical name on the child/detail entity (the grid rows)
  - `aggregation_function`: `sum`, `avg`, `min`, `max`, `count`
- **Example**: `"{xts_totalamount} = {xts_amount}:sum, {xts_avgprice} = {xts_unitprice}:avg, {xts_linecount} = {xts_amount}:count"`
- **Trigger**: fires on successful row save (auto or manual). Parent form fields are updated via the XRM client API; persistence depends on the parent form's save behavior.

#### Permission requirements

The rollup is a client-side write into the open form's attribute collection — it does **not** elevate or bypass any security setting. For the rollup to succeed, the current user must have:

1. **Read** on the child table and on the rows that should contribute. The control aggregates only the rows the dataset hands it; row-level security filters the dataset before the formula sees it.
2. **Field-level Read** on every numeric `{child_field}` referenced on the right of `=`. If FLS hides a source column from the user, the column is absent from the dataset and the formula is skipped with a `field_not_found` validation error.
3. **Update** on the parent `{parent_field}`. Without write access the value is written into the in-memory form model but the parent form's save call rejects it.
4. A parent form variant that **includes the target field control**. Role-specific forms that omit the target column make `getAttribute(target)` return `null` from the XRM client API, indistinguishable from FLS-hidden.

If any of these gates fails, the rollup is skipped silently from the user's perspective (no toast, no inline error — the value simply does not appear). The control emits a one-time `console.warn` in the browser DevTools console for each missing target, source, dataset, or form context so support can identify which gate tripped:

| Console warning prefix | Meaning |
|------------------------|---------|
| `[updatedParentFields] Target attribute "<name>" is not available on the open form …` | Target field hidden by FLS or absent from the role-specific form variant. |
| `[updatedParentFields] No parent form context available …` | Control is hosted outside a model-driven form (view, dashboard, harness). |
| `[useUpdateParentData] Parent rollup is configured but the child dataset is empty …` | Likely missing Read privilege on the child table or row-level filtering excludes everything. |
| `[useUpdateParentData] Skipping evaluation due to formula errors … field_not_found …` | A `{child_field}` is missing — usually FLS Read denied on the source numeric column. |

Each warning fires once per affected target per session; admins (FLS-exempt, full form access) see no console output.

---

## Grouping

Grouping is always available — no configuration is required.

Every column header has a **⋮** menu. Choose **Group by this column** to group the grid by that column's values. The grid collapses into sections, one per distinct value.

When a column is grouped, a **Grouped by** chip appears on the left of the command bar. The chip provides three controls:

| Control | Action |
|---------|--------|
| **Expand all** | Expands every group section at once |
| **Collapse all** | Collapses every group section at once |
| **Remove** | Clears grouping and returns to a flat list |

You can also remove grouping from the column header menu by choosing **Remove grouping**.

### Group aggregates (v1.6.0)

While a column is grouped, each group heading shows the aggregates configured in `footerAggregateColumns`, computed over that group's records only.

- **Configuration**: none of its own. The group headings reuse `footerAggregateColumns` verbatim — the same columns and the same functions (`sum`, `avg`, `min`, `max`, `count`). There is no per-group override and no additional function.
- **Scope**: the records in that group that pass the active search or filter. Values recompute in real time as cells are edited, so a subtotal updates as soon as its group changes.
- **Accuracy**: exact, not sampled. While grouping is active the grid holds the full matching row set and bypasses client paging, so a group's rows are all of its rows.
- **Empty values**: null, undefined and empty cells are non-participants — they are not counted as zero when averaging or taking a minimum over records that do have values. A group in which *every* record leaves a configured column empty shows the same value the footer shows for an empty set, so a group heading always presents the same set of aggregate columns as the footer.
- **Clearing grouping** removes the group aggregates and leaves the footer aggregates unchanged.

> **Design note (v1.5.0):** Grouping is effectively always available in v1.5.0. The underlying `enableGroupBy` manifest property still exists and is still honoured, but it is now hidden from the configuration dialog and defaults to `true`, so grouping is available out of the box without configuring anything. A sub-grid that already had `enableGroupBy = false` keeps grouping hidden after upgrading. See `yanagrid-releases.md` for migration details.

---

## Column order (v1.5.0)

End users can drag a column header to reposition it. The new order is remembered per entity + view the next time the form is opened (stored in the browser, keyed to that view). The right-most Actions column is pinned and cannot be dragged or have a column dropped after it, so it always stays in the far-right position matching the native Power Apps grid. Column reordering is disabled while the grid is in full read-only mode (`grid.setReadOnly(true)`).

---

## Coloured choice values (v1.5.0)

An option-set column whose choices have a colour defined on them renders that colour in the grid: a single-select value shows as a coloured badge, and a multi-select value or a value in the edit dropdown shows a coloured dot next to its label. A choice without a defined colour renders as plain text, unchanged from prior versions.

---

## Row selection, copy, export and import (v1.6.0)

None of these are configured. There is deliberately **no** manifest property controlling row selection, copy, export or import.

**Row selection** uses the existing checkbox column that Delete already uses. Shift+click extends a range, the header checkbox selects all, and the selection persists across client-side pages. A grid in full read-only mode (`grid.setReadOnly(true)`) has no checkboxes.

**Copy** (`Ctrl+C` / `Cmd+C`, or the browser context-menu Copy) writes TSV to the clipboard: a header row of column display names, then the selected rows — or every loaded row when nothing is selected. Visible, user-ordered columns only; the Actions column is excluded. Values are the displayed forms (formatted dates, choice and lookup labels), and tabs and newlines inside a value collapse to a single space. Copy inside an active cell editor is left to the browser.

**Export** is offered from the command bar's **More** (…) menu, currently as **Export to Excel** only — the CSV command is present in the export engine but not exposed as a menu item on this build. Row source is the selected rows, or all currently loaded filtered and sorted rows when nothing is selected. Column source is the visible columns in displayed order, with display names on the header row.

The Excel export follows **workbook contract v2**:

| Part | Purpose |
|------|---------|
| `Data` sheet | Visible rows, inside a named `YanaData` Excel table — the sole importable row boundary |
| `Instructions` sheet | Visible editing rules and the colour legend |
| `_YanaContract` sheet | Very hidden. Contract version, source table, per-column stable field identity, per-row raw baseline and `modifiedon`, locale, timezone, Excel date system, row limit |
| `__yana_lists` sheet | Very hidden. Choice label lists backing the data sheet's dropdown validation |

Number, currency, Date Only, User Local and Time-Zone Independent values are written as typed Excel cells. Choice and lookup keep their display labels, with raw identity held in the contract. Protected, calculated, rollup, formula-result, system and unsupported values render as grey locked cells; Owner and Customer lookups are display-only and belong to this group. No active Excel formulas are emitted, and a formula entered in an importable cell rejects that row until it is replaced with a literal value. CSV output, where it is produced, carries no contract data and is not importable.

Date Only imports the workbook calendar date unchanged. User Local interprets the workbook's wall-clock value in the time zone recorded by the export before applying the grid's normal UTC conversion; a daylight-saving gap or overlap is rejected because it does not identify one moment. Time-Zone Independent preserves the entered clock time.

**Import** reads `.xlsx` only. A file carrying this contract version is read as a round trip (keys honoured, updates proposed). Any other workbook — no contract, an unreadable one, or an **older** contract version — falls back to free-form mode: the user confirms a column map, and because such a file carries no trustworthy record identity, **every row is create-only**.

Menu presence is not uniform. A read-only grid **removes** the command outright, matching Add and Delete. A missing create/update privilege or unsaved edits leave it present but disabled, with the reason as its tooltip and secondary text.

| Row in the workbook | Outcome |
|---|---|
| Known record key, values differ | Update proposed |
| Known record key, values identical | No change |
| Blank record key, populated row inside `YanaData` | New row proposed (**rejected and reported**, per row, when the grid disallows adding) |
| Well-formed key not in the grid | Skipped, reported |
| Duplicate key | Rejected |
| Record changed since export | Reported stale and **never applied** — no per-row override exists |
| Any reviewed record moved, unreadable, or unverifiable at Save | **Whole save refused**, nothing written; recover with Refresh, then re-export and re-import |
| In the grid but absent from the workbook | Untouched — import is upsert only and never deletes |

Values for read-only columns and rows, calculated and rollup columns, and columns driven by `calculationFormulas` or `parentUpdateFormulas` are ignored and reported as ignored. Renamed, reordered or removed original columns are mapped through their stable field identity; added columns are reported as unknown and ignored with a warning, not an error. The review also counts recognised rows whose importable values are unchanged. A lookup display change resolves only on exactly one eligible match. Review is side-effect free until confirmed; confirmed changes are staged as ordinary unsaved grid edits, so validation, calculations, parent updates, dirty highlighting, the SDK events, **Save** and **Cancel** all behave exactly as for hand-typed edits.

---

## Quick View toolbar (v1.4.0)

In v1.4.0, the Grid toolbar exposes a **Quick View** button. The button only appears when an `xts_pluginconfiguration` record exists for the bound entity. No manifest opt-in is required.

### Activation

1. Create an `xts_pluginconfiguration` record whose lookup matches the bound entity.
2. Set the `xts_configuration` column to a valid `<Configurations>` XML payload (see **Configuration shape** below).
3. Refresh the form — the Quick View icon appears on the Grid toolbar.

### Configuration shape

```xml
<Configurations>
  <FamilyTreeConfig>
    <Query>
      <fetch>
        <entity name="xts_vehicleinformation">
          <attribute name="xts_chassisnumber" />
          <attribute name="xts_productsegment1id" minwidth="170px" />
          <link-entity name="xts_customer" from="xts_customerid" to="xts_customerid" alias="cus">
            <attribute name="xts_name" />
            <filter>
              <condition attribute="xts_recordid" operator="eq" value="CurrentRecordId" />
            </filter>
          </link-entity>
        </entity>
      </fetch>
    </Query>
    <Query><!-- second accordion section --></Query>
  </FamilyTreeConfig>
</Configurations>
```

### Element reference

| Element / Attribute | Purpose |
|---------------------|---------|
| `<Configurations>` | Root wrapper. |
| `<FamilyTreeConfig>` / `<YanaGridConfig>` | Configuration block — matches the active entity's default. |
| `<Query>` | One accordion section per `<Query>` element. |
| `<attribute name="...">` | Column to display. Dataverse display name used as the header. |
| `minwidth="170px"` | Optional minimum column width hint on `<attribute>`. |

### Placeholders

| Placeholder | Substitution |
|-------------|--------------|
| `CurrentRecordId` | The current host record's id |
| `CurrentUserId` | The current user's id |

### Dialog behavior

- First section expanded by default; the rest collapsed.
- Sections fetch in parallel; a failing section does not block siblings.
- Each section has its own loading shimmer, empty state, and error-with-retry.
- Grids are read-only — no inline edit, sort, or filter.
- Fullscreen toggle available.

For the standalone Quick View control (embeddable outside the Grid), see `yanaquickview-api.md`.

---

## Behavior contracts

These are the runtime guarantees the control offers. Integrators can rely on them across releases unless explicitly noted as deprecated in `yanagrid-releases.md`.

### Save lifecycle

1. User edits a cell → grid stages the change in-memory.
2. User leaves the row (blur, Tab to next row, or explicit save).
3. If `autoSaveRecord=true`, the grid saves the validated row to Dataverse via WebAPI.
4. On success: `parentUpdateFormulas` recompute and write to parent form fields.
5. On background save failure: persistent row status and grid feedback surface; entered values remain available for correction or retry.

Since v1.6.0, each row waits for its own asynchronous `addOnSave` handler. Completion of another row's handler cannot release that wait, and repeated save triggers for the same row share its in-flight save instead of starting parallel creates or updates. Values written by the handler therefore stay with the row being saved.

Auto-save validates the row before invoking `addOnSave` or writing to Dataverse. Validation failures retain the edits and show cell indicators and an in-grid message that dismisses after five seconds; repeating the failure restarts that timer. The existing 20-second save-event timeout dialog remains unchanged. Background Dataverse save failures appear as persistent row status and grid feedback without interrupting another row being edited. An unchanged failed row waits for **Retry save**; changing its values permits another automatic attempt. **Check save result** reconciles an uncertain create without replaying its write. **Go to row** moves focus only when selected and respects row validation and page-save barriers.

After a successful auto-save, the grid retrieves only the saved record in the background to display server-generated values such as Owner labels. This read preserves the current page and other pending edits. Transient read failures have bounded retries; a failed display refresh does not undo the successful write. Auto-save does not fire `addOnLoad`; use `addOnRowSave` for logic that runs after each committed row. That event precedes the background display refresh.

Cross-page movement owned by the grid — the pager, **Add row**, and Tab navigation — waits for outgoing rows' validation and save handling to settle. If an outgoing row remains unresolved, the grid keeps the current page and leaves its row feedback available for correction, retry, or discard. A same-page **Go to row** action does not wait for unrelated rows that are still saving. Host-level workflows that open, close, submit, or confirm a form — including **Save & Close**, **Submit**, and **Confirm** — are outside the grid's command contract; the grid does not intercept or guarantee them.

### Refresh behavior

- The grid refreshes when the host form refreshes.
- Discard Changes reverts staged edits to the last known server values.
- Refresh respects the `autoSaveRecord` flag — manual mode never auto-saves before refresh.

### Validation order

Both auto-save and the grid's Save flow validate before `addOnSave`, then write only after the handler completes. An invalid auto-save row does not block another valid row from saving. Use `addOnNew` for required defaults and `addOnChange` for derived values, so they are present before validation.

1. Required-field check
2. Data-type check (numeric, date, lookup)
3. `calculationFormulas` recompute
4. `parentUpdateFormulas` re-aggregate (preview only; commits on save)

### Paging (v1.5.0, client-side)

- The grid loads its full result set once, up to a **5,000-record** cap, then pages entirely in the browser — there is no further server round-trip when navigating pages.
- Page size follows the bound sub-grid's own **"Maximum number of rows"** configuration; there is no separate manifest property for it (the `defaultPageSize` property from earlier versions was removed).
- The pager offers the same controls as the standard Power Apps sub-grid: First, Previous, Next, Last, a current-page indicator, and a record range (e.g. "1 - 25 of 500").
- Footer aggregates, `calculationFormulas`, and `parentUpdateFormulas` all compute over the **full in-memory record set**, not just the rows on the current page.
- Sorting, keyword search, grouping, row selection, and validation all operate consistently across pages.

### Layout & sizing

- The grid reserves a **full page-size height** — a page size of N (the bound view's rows-per-page / `defaultPageSize`, default 5) renders an N-row-tall grid regardless of the current record count. The height is **stable when rows are added** within the page.
- For large page sizes the grid height is **capped to ~60% of the viewport**; rows beyond what fits scroll vertically inside the grid rather than expanding the control. The height recomputes on window resize.
- The **Add row** action lives on the command bar (alongside Refresh / Save / Delete). Adding a row appends a blank row, scrolls it into view, and focuses its first editable cell.
- Cell content is **vertically centered** within each row. Read-only / non-editable cells render with a muted gray fill at full cell height (including when empty) and a default cursor, distinguishing them from editable cells.

---

## Configuration recipes

### Enable auto-save and footer totals

```xml
<property name="autoSaveRecord" value="true" />
<property name="footerAggregateColumns" value="xts_amount:sum, xts_quantity:sum" />
```

### Add a calculation column

```xml
<property name="calculationFormulas" value="{xts_lineamount} = {xts_unitprice} * {xts_quantity}" />
```

### Aggregate to parent form

```xml
<property name="parentUpdateFormulas" value="{xts_totalamount} = {xts_lineamount}:sum, {xts_linecount} = {xts_lineamount}:count" />
```

### Lock columns for read-only viewing

```xml
<property name="readOnlyColumns" value="xts_statuscode, xts_createdon" />
<property name="readOnlyStatus" value="2, 100000001" />
```

### Enable the Quick View toolbar

No manifest change required. Seed an `xts_pluginconfiguration` record for the entity (see `yanagrid-install.md` → Quick View configuration).

---

## Compatibility

| Item | Supported |
|------|-----------|
| Power Apps model-driven apps | yes |
| Power Apps canvas apps | no |
| Dataverse online | yes |
| Dataverse on-premise | not tested |
| Entity types | standard + custom |
| Sub-grids | yes (bind as dataset) |
| Home grids | yes |
| Browsers | Chromium-based (Edge, Chrome), Firefox latest |
| Framework | React 16.8.6, Fluent UI 8.29.0 (platform-libraries) |
| External services | none — control declares `external-service-usage enabled="false"` |
| Required platform features | `Utility`, `WebAPI` |

---

## Limitations

- Calculation formulas support only `+`, `-`, `*`, `/` with parentheses; no functions, no string ops.
- `parentUpdateFormulas` writes to the parent form's in-memory model; persistence requires the parent to save.
- Quick View grids are display-only — no inline edit, sort, or filter.
- `readOnlyStatus` is checked against `statuscode` only; custom status fields are not supported.
- The Quick View toolbar button is data-driven (presence of `xts_pluginconfiguration`); there is no per-form manifest override.
- Paging is **client-side only**, with a **5,000-record** load cap — a view returning more records than that is truncated at the cap. There is no export feature in this release.
- Auto-save barriers cover commands owned by the grid. Host-level workflows that open, close, submit, or confirm a form — including **Save & Close**, **Submit**, and **Confirm** — are not intercepted or guaranteed by the grid.

---

## Errors

User-facing messages emitted by the control. Codes are the localization keys; the strings are from the English (1033) resource.

| Key | Message | Cause | Resolution |
|-----|---------|-------|------------|
| `Formula.EqualsRequired` | Formula must contain an equals sign (=) | A `calculationFormulas` entry is missing `=` | Ensure each formula has `{target} = {expression}` |
| `Formula.TargetAndExpressionRequired` | Formula must have both target field and expression | One side of `=` is empty | Provide both target and source |
| `Formula.TargetFieldRequired` | Target field is required and must be in format {fieldname} | Target missing or not wrapped in `{}` | Wrap the target column logical name in `{}` |
| `Formula.SourceFieldRequired` | Formula must reference at least one source field | No `{source}` reference on the right side | Reference at least one column logical name in `{}` |
| `Formula.CircularDependency` | Circular dependency detected: {0} | Two or more formulas reference each other | Re-order or remove the cyclic reference |
| `Formula.InvalidExpressionOperands` | Invalid expression: insufficient operands | Operator without enough operands | Check formula syntax |
| `Formula.InvalidExpressionCount` | Invalid expression: incorrect number of operands | Too few or too many operands for the operator | Check formula syntax |
| `Formula.DivisionByZero` | Division by zero | Divisor evaluated to zero | Guard with a non-zero source or change operator |
| `Formula.UnknownOperator` | Unknown operator: {0} | Operator not in `+ - * /` | Use a supported operator |
| `Formula.UnknownParsingError` | Unknown parsing error | Formula could not be parsed | Inspect the formula string |
| `Formula.EvaluationError` | Evaluation error | Runtime evaluation failed | Check source field values and types |

Save failures surface the underlying Dataverse error message verbatim (e.g. required field missing, optimistic concurrency conflict).

---

## Versioning

| Version | Status | Namespace |
|---------|--------|-----------|
| 1.6.1 | Current — persistent asynchronous auto-save feedback, stable retry and uncertain-create recovery, page-save barriers, single-row hydration with correct choice/list cell types, filtered-lookup Load More paging, and the v1.6.0 feature set | `Technosoft.DMS.XRM.CustomControl.Grid` |
| 1.6.0 | Previous — Excel round trip, row-selection events and `getSelection()`, group subtotals, web-resource icons, save isolation, performance and accessibility improvements | `Technosoft.DMS.XRM.CustomControl.Grid` |
| 1.5.0 | Previous — bundled zero-setup SDK; custom cell rendering, configurable commands/read-only grid, custom command-bar buttons, data-change events, runtime option-set filtering; grouping always available (`enableGroupBy` retained, hidden, defaults to `true`); client-side paging (`defaultPageSize` removed); drag-to-reorder columns; coloured choice values; new `gridEvent` output | `Technosoft.DMS.XRM.CustomControl.Grid` |
| 1.4.0 | Previous — adds Quick View toolbar + ships in umbrella `CORE Custom Control` solution | `Technosoft.DMS.XRM.CustomControl.Grid` |

See `yanagrid-releases.md` for full version history and migration notes.

---

## See also

- `yanagrid-manual.md` — end-user + implementer how-to
- `yanagrid-install.md` — Power Apps install + Quick View configuration seeding
- `yanagrid-releases.md` — version history
- `yanaquickview-api.md` — standalone Quick View control
- `plugin-install.md` — Claude Code plugin install for external developers

---

> **Bundle metadata** — generated 2026-09-16 from `.public-docs/yanagrid-api.md` for plugin version 1.6.1.