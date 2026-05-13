# YanaGrid — API Reference

YanaGrid is a virtual PCF dataset control for Microsoft Power Apps model-driven apps. It renders a dataset as an inline-editable grid with row save, grouping, footer aggregation, parent-record updates, and an optional toolbar-launched Quick View dialog.

This document is the **public API surface**. It describes the manifest properties an implementer configures and the runtime behavior contracts an integrator can rely on. It does **not** describe internal implementation, source layout, or extension points beyond the published manifest.

**Document scope:** YanaGrid v1.4.0 (ships in umbrella solution `TechnosoftDmsCoreComponents`).

---

## JS SDK library

In addition to the manifest properties documented here, `Technosoft.Yana.Grid.js` is a JavaScript WebResource that provides programmatic event subscription and cell manipulation from form-level scripts. It exposes `window.top.YanaEditableGrid` and allows external developers to subscribe to grid lifecycle events (`addOnLoad`, `addOnChange`, `addOnSave`, and more), read and set cell values, apply conditional read-only rules, and add cell notifications — all without modifying the control's manifest configuration. See `yanagrid-events.md` for the full JS SDK reference.

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
| `enableGroupBy` | TwoOptions | no | `true` | Allow user to group by column. |
| `parentUpdateFormulas` | SingleLine.TextArea | no | `""` | Aggregate child rows into parent form fields. |

Quick View is **not** configured via manifest property in v1.4.0 — the toolbar button appears automatically when an `xts_pluginconfiguration` record exists for the entity. See **Quick View toolbar** below.

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

### `enableGroupBy`

Enables the column grouping affordance in the column header menu.

- **Default**: `true`
- **Persistence**: the user's selected grouping is saved to user preferences and re-applied on next load.

### `parentUpdateFormulas`

Aggregates child-row values into fields on the parent (host) form when the grid saves.

- **Syntax**: `{parent_field} = {child_field}:aggregation_function`
  - `parent_field`: logical name on the parent/header entity (the form hosting the grid)
  - `child_field`: logical name on the child/detail entity (the grid rows)
  - `aggregation_function`: `sum`, `avg`, `min`, `max`, `count`
- **Example**: `"{xts_totalamount} = {xts_amount}:sum, {xts_avgprice} = {xts_unitprice}:avg, {xts_linecount} = {xts_amount}:count"`
- **Trigger**: fires on successful row save (auto or manual). Parent form fields are updated via the XRM client API; persistence depends on the parent form's save behavior.

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
- The Quick View toolbar button is data-driven (presence of `xts_pluginconfiguration`); there is no per-form manifest override in v1.4.0.

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
| 1.4.0 | This document — adds Quick View toolbar + ships in umbrella `TechnosoftDmsCoreComponents` solution | `Technosoft.DMS.XRM.CustomControl.Grid` |

See `yanagrid-releases.md` for full version history and migration notes.

---

## See also

- `yanagrid-manual.md` — end-user + implementer how-to
- `yanagrid-install.md` — Power Apps install + Quick View configuration seeding
- `yanagrid-releases.md` — version history
- `yanaquickview-api.md` — standalone Quick View control
- `plugin-install.md` — Claude Code plugin install for external developers

---

> **Bundle metadata** — generated 2026-05-13 from `.public-docs/yanagrid-api.md` for plugin version 2.0.0.