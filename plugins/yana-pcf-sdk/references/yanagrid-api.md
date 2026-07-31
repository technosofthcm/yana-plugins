# YanaGrid — API Reference

YanaGrid is a virtual PCF dataset control for Microsoft Power Apps model-driven apps. It renders a dataset as an inline-editable grid with row save, grouping, footer aggregation, parent-record updates, and an optional toolbar-launched Quick View dialog.

This document is the **public API surface**. It describes the manifest properties an implementer configures and the runtime behavior contracts an integrator can rely on. It does **not** describe internal implementation, source layout, or extension points beyond the published manifest.

**Document scope:** YanaGrid v1.5.0 (ships in umbrella solution `CORE Custom Control`).

---

## JS SDK library

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

**Removed in v1.5.0**: `enableGroupBy` — grouping is now always available from the column-header context menu, and the grouping chip carries Expand all / Collapse all. `defaultPageSize` — page size now resolves at runtime from the sub-grid configuration. See `yanagrid-releases.md` for migration details.

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
- **Notes**: Only numeric columns aggregate. Non-numeric columns are silently ignored.

### `autoSaveRecord`

When `true`, the grid commits the row to Dataverse on row blur (after the user leaves the row). When `false`, the user must explicitly trigger save.

- **Effect on `parentUpdateFormulas`**: parent updates fire only on successful save, regardless of auto vs manual.
- **Conflict behavior**: optimistic — last writer wins. The control surfaces a save error if Dataverse rejects.

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

> **Design note (v1.5.0):** Grouping became always-on in v1.5.0. Prior versions exposed an `enableGroupBy` manifest property to toggle this capability; that property was removed because grouping is now unconditionally available and discoverable from the column-header menu. See `yanagrid-releases.md` for migration details.

---

## Column order (v1.5.0)

End users can drag a column header to reposition it. The new order is remembered per entity + view the next time the form is opened (stored in the browser, keyed to that view). The right-most Actions column is pinned and cannot be dragged or have a column dropped after it, so it always stays in the far-right position matching the native Power Apps grid. Column reordering is disabled while the grid is in full read-only mode (`grid.setReadOnly(true)`).

---

## Coloured choice values (v1.5.0)

An option-set column whose choices have a colour defined on them renders that colour in the grid: a single-select value shows as a coloured badge, and a multi-select value or a value in the edit dropdown shows a coloured dot next to its label. A choice without a defined colour renders as plain text, unchanged from prior versions.

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
3. If `autoSaveRecord=true`, the grid POSTs the row to Dataverse via WebAPI.
4. On success: `parentUpdateFormulas` recompute and write to parent form fields.
5. On failure: cell-level error indicator surfaces; row stays in edit state for retry.

### Refresh behavior

- The grid refreshes when the host form refreshes.
- Discard Changes reverts staged edits to the last known server values.
- Refresh respects the `autoSaveRecord` flag — manual mode never auto-saves before refresh.

### Validation order

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
| 1.5.0 | Current — bundled zero-setup SDK; custom cell rendering, configurable commands/read-only grid, custom command-bar buttons, data-change events, runtime option-set filtering; grouping always-on (`enableGroupBy` removed); client-side paging (`defaultPageSize` removed); drag-to-reorder columns; coloured choice values; new `gridEvent` output | `Technosoft.DMS.XRM.CustomControl.Grid` |
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

> **Bundle metadata** — generated 2026-07-31 from `.public-docs/yanagrid-api.md` for plugin version 1.5.0.