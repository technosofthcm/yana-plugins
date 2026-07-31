# YanaGrid — JavaScript SDK Events Reference

`Technosoft.Yana.Grid.js` is a JavaScript WebResource that lets form-level scripts interact with embedded YanaGrid controls from the host form's execution context. The library is intended for external developers who need to subscribe to grid lifecycle events, read row and cell state, or programmatically manipulate cells from a Dataverse model-driven form script.

---

## Overview

`Technosoft.Yana.Grid.js` ships as a Dataverse WebResource. Once it is loaded as a form library, it exposes `window.top.YanaEditableGrid` — an instance of the `Controls` class. Form scripts call `getEditableGrid` on this object to obtain an `EditableGrid` handle for the named grid control embedded on the form.

Communication between the form-level library and the grid control uses a postMessage-based protocol. Messages are JSON-stringified and exchanged across the iframe boundary. The library abstracts this protocol entirely; consumer scripts only interact with the `EditableGrid`, `Row`, and `Cell` objects documented here.

The library runs in the host form's window context (`window.top`). It must be loaded before any consumer form script that calls `window.top.YanaEditableGrid`.

---

## Install

### Path A — Umbrella solution `CORE Custom Control` ≥ `v_sdk_bundled`

Starting with version `v_sdk_bundled`, `Technosoft.Yana.Grid.js` ships as a WebResource inside the `CORE Custom Control` managed solution. If your environment already has this or a newer version imported, the JS file is available under the publisher prefix — no manual upload is required.

To use it:

1. Open the form designer for the form that hosts the YanaGrid control.
2. In the **Events** tab, add `Technosoft.Yana.Grid.js` as a form library.
3. Set the library's load order so it runs **before** your consumer form script.
4. Save and publish the form.

### Path B — Older umbrella version, or testing

If your `CORE Custom Control` version predates `v_sdk_bundled`, or you want to test with a local copy, upload the file manually:

1. Obtain `Technosoft.Yana.Grid.js` from the `references/sdk/` folder inside this plugin.
2. In **make.powerapps.com** → your solution → **+ New** → **Web resource**:
   - **Name**: choose a name under your solution's publisher prefix (e.g., `app_TechnosoftYanaGrid`).
   - **Display name**: `Technosoft Yana Grid SDK`.
   - **Type**: **Script (JScript)**.
   - Upload the JS file.
3. Save the WebResource, then publish it.
4. Open the form designer for the form that hosts the YanaGrid control.
5. Add the WebResource as a form library in the **Events** tab.
6. Set the library's load order so it runs **before** your consumer form script.
7. Save and publish the form.

### Detection hint

To check which path applies: in **make.powerapps.com** → **Solutions** → open `CORE Custom Control` → look for a WebResource entry for the Yana Grid SDK JavaScript file.

- **Present**: Path A applies. Bind it directly from the solution's WebResources.
- **Absent**: Path B applies. Upload the copy from this plugin's `references/sdk/` folder.

---

## Entry point

After the library is loaded as a form library, `window.top.YanaEditableGrid` is available in any script that runs in the same form context.

To get a handle for a specific grid control:

```js
async function onFormLoad(executionContext) {
    const grid = await window.top.YanaEditableGrid.getEditableGrid(
        executionContext,
        "your_grid_control_name"
    );

    if (!grid) {
        // Grid did not become ready within 60 seconds.
        return;
    }

    // Subscribe to events or manipulate cells here.
}
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `instance` | `ExecutionContext` | The execution context passed by the platform to the form handler. |
| `gridId` | `string` | The logical name of the YanaGrid control as set in the form designer. |

**Returns:** `Promise<EditableGrid | null>`

The Promise resolves with an `EditableGrid` instance when the grid control has initialized and its internal state is ready. If the grid does not become ready within **60 seconds**, the Promise resolves with `null` (it does not reject). Always null-check before proceeding.

---

## Event reference

Events are registered on an `EditableGrid` instance obtained from `getEditableGrid`. Handlers are stored per grid ID and fired in subscription order.

All handlers share the same signature:

```js
function handler(instance, eventContext) { ... }
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `instance` | `ExecutionContext` | The execution context passed to `getEditableGrid`. |
| `eventContext` | `object` | Contextual data for the event. Shape described per event below. |

**Common `eventContext` shape:**

```js
{
    gridId: string,          // logical name of the grid control
    eventName: string,       // e.g. "addOnLoad", "addOnChange"
    data: {
        parentEntity: object,   // host form entity reference
        table: EditableGrid,    // the grid instance (with all rows)
        row?: Row,              // present for row-level events
        cell?: Cell             // present for cell-level events
    }
}
```

> **Row-level events** (`addOnRowSave`, `addOnRowDelete`) expose only `{ parentEntity, table, row }` in `eventContext.data` — there is no `cell`. They differ from the cell/grid events above: they fire *after* a single row commits (save) or is removed (delete), and the `row` they hand you carries extra metadata (`isNew()`, real record id) described below.

---

### `addOnLoad` / `removeOnLoad`

```js
grid.addOnLoad(handler);
grid.removeOnLoad(handler);
```

**Trigger:** fires each time the grid finishes loading or refreshing its data from Dataverse.

**`eventContext.data` shape:**

| Property | Present | Description |
|----------|---------|-------------|
| `parentEntity` | always | Host form entity reference. |
| `table` | always | `EditableGrid` with all current rows. |
| `row` | no | — |
| `cell` | no | — |

**Use:** initialize column visibility, apply row highlights, set read-only columns based on the grid's initial state.

---

### `addOnNew` / `removeOnNew`

```js
grid.addOnNew(handler);
grid.removeOnNew(handler);
```

**Trigger:** fires when the user adds a new row to the grid via the **+ New** button (inline row creation). Fires before the row is saved.

**`eventContext.data` shape:**

| Property | Present | Description |
|----------|---------|-------------|
| `parentEntity` | always | Host form entity reference. |
| `table` | always | `EditableGrid` including the new unsaved row. |
| `row` | yes | The newly created `Row`. |
| `cell` | no | — |

**Use:** set default values on cells of the new row, apply field-level constraints before the user edits.

---

### `addOnNewForm` / `removeOnNewForm`

```js
grid.addOnNewForm(handler);
grid.removeOnNewForm(handler);
```

**Trigger:** fires when the user adds a new row via the **Open new form** dialog path (full-form creation, as opposed to inline row creation). Fires before the record is saved.

**`eventContext.data` shape:**

| Property | Present | Description |
|----------|---------|-------------|
| `parentEntity` | always | Host form entity reference. |
| `table` | always | `EditableGrid` with current rows. |
| `row` | yes | The `Row` opened in the new-form dialog. |
| `cell` | no | — |

---

### `addOnQuickView` / `removeOnQuickView`

```js
grid.addOnQuickView(handler);
grid.removeOnQuickView(handler);
```

**Trigger:** fires when the user opens the Quick View dialog for a row.

**`eventContext.data` shape:**

| Property | Present | Description |
|----------|---------|-------------|
| `parentEntity` | always | Host form entity reference. |
| `table` | always | `EditableGrid` with current rows. |
| `row` | yes | The `Row` for which Quick View was opened. |
| `cell` | no | — |

---

### `addOnChange` / `removeOnChange`

```js
grid.addOnChange(columnName, handler);
grid.removeOnChange(columnName, handler);
```

**Trigger:** fires when the value of the specified column changes in any row. The handler is called only for the column named in `columnName`; changes to other columns do not fire this handler.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `columnName` | `string` | Logical name of the column to watch (e.g., `"xts_status"`). |
| `handler` | `function` | Handler function with signature `(instance, eventContext)`. |

**`eventContext.data` shape:**

| Property | Present | Description |
|----------|---------|-------------|
| `parentEntity` | always | Host form entity reference. |
| `table` | always | `EditableGrid` with all rows. |
| `row` | yes | The `Row` that contains the changed cell. |
| `cell` | yes | The `Cell` whose value changed. |

**Use:** react to field changes — enforce conditional read-only rules, update related cells, set notifications.

---

### `addOnSave` / `removeOnSave`

```js
grid.addOnSave(handler);
grid.removeOnSave(handler);
```

**Trigger:** fires when a row is about to be saved. The handler runs before the save is confirmed as complete in the grid UI.

**`eventContext.data` shape:**

| Property | Present | Description |
|----------|---------|-------------|
| `parentEntity` | always | Host form entity reference. |
| `table` | always | `EditableGrid` with all rows. |
| `row` | yes | The `Row` being saved. |
| `cell` | no | — |

**Completion semantics:** the grid waits up to **20 seconds** for the handler to complete (await resolution). After the handler finishes — whether it resolves or throws — the grid resumes the save lifecycle. If the handler throws, the grid surfaces an error dialog via `parent.Xrm.Navigation.openErrorDialog` with the error message and stack, then continues. If the handler does not complete within 20 seconds, the grid surfaces a `Common.SaveEventTimeout` error dialog and continues.

> Throwing from an `addOnSave` handler does not prevent the record from saving. It surfaces an error dialog and then save proceeds. To perform async validation before save, use `cell.setNotification()` from an `addOnChange` handler to surface field-level messages before the save is attempted.

---

### `addOnRowSave` / `removeOnRowSave` (since v1.5.0)

```js
grid.addOnRowSave(handler);
grid.removeOnRowSave(handler);
```

**Trigger:** fires **once after a single row has been committed to Dataverse** — whether through auto-save, the **Save** button, or a programmatic `row.save()`. This is distinct from `addOnSave`, which fires *before* the save and blocks the lifecycle. `addOnRowSave` fires *after* the write succeeds, so the row already holds its persisted state.

**Create vs. update:** the handler can tell whether the save **created** a brand-new record or **updated** an existing one via `row.isNew()`:

- `row.isNew() === true` → the row was newly created. `row.getRowId()` returns the **real Dataverse GUID** assigned by the platform (the temporary client-side id has already been remapped).
- `row.isNew() === false` → an existing row was updated.

**`eventContext.data` shape:**

| Property | Present | Description |
|----------|---------|-------------|
| `parentEntity` | always | Host form entity reference. |
| `table` | always | `EditableGrid` with all current rows. |
| `row` | yes | The saved `Row`, carrying `isNew()` and the resolved record id. |
| `cell` | no | — |

**Use:** react to a committed row — log an audit entry, update a related cell, push the new record id to another system, or surface a row notification when a computed value is inconsistent.

```js
grid.addOnRowSave((instance, ctx) => {
    const { row } = ctx.data;

    if (row.isNew()) {
        // A new record was created — getRowId() is the real Dataverse GUID.
        console.log("Created order line:", row.getRowId());
    } else {
        console.log("Updated order line:", row.getRowId());
    }

    // Read values straight off the saved row (getValue delegates to Cell.getValue,
    // so datetime → Date, lookup → { id, name, data } object (GUID in .id),
    // optionset → option value).
    const qty   = Number(row.getValue("xts_quantity"));
    const price = Number(row.getValue("xts_unitprice"));
    const amount = Number(row.getValue("xts_amount"));

    if (qty * price !== amount) {
        row.setNotification("Quantity × Unit price ≠ Amount", { type: "warning" });
    } else {
        row.clearNotification();
    }
});
```

---

### `addOnRowDelete` / `removeOnRowDelete` (since v1.5.0)

```js
grid.addOnRowDelete(handler);
grid.removeOnRowDelete(handler);
```

**Trigger:** fires **after a row has been removed** from the grid — via **Ctrl+Delete**, the row/command-bar **Delete** action, or a programmatic `row.delete()`. It reports the removed row's last-known state.

> This event is **not cancelable** — it fires after the deletion has already happened, so a handler cannot block the removal. For existing (saved) records, the platform still shows its own confirmation dialog *before* deletion; this event fires only once the user confirms and the delete succeeds.

**`eventContext.data` shape:**

| Property | Present | Description |
|----------|---------|-------------|
| `parentEntity` | always | Host form entity reference. |
| `table` | always | `EditableGrid` with the remaining rows. |
| `row` | yes | A snapshot of the removed `Row` (its last-known cell values + `rowId`). |
| `cell` | no | — |

**Use:** clean up dependent state, recompute a form-level total, or log the removal.

```js
grid.addOnRowDelete((instance, ctx) => {
    const { row } = ctx.data;
    console.log("Deleted order line:", row.getRowId());
    // The snapshot still exposes the removed row's values:
    console.log("It had quantity:", row.getValue("xts_quantity"));
});
```

---

## EditableGrid reference

Obtained via `window.top.YanaEditableGrid.getEditableGrid(instance, gridId)`. Represents the grid control and its current rows.

### Event registration

| Method | Signature | Description |
|--------|-----------|-------------|
| `addOnLoad` | `(handler) → void` | Subscribe to grid load / refresh. |
| `removeOnLoad` | `(handler) → void` | Unsubscribe. |
| `addOnNew` | `(handler) → void` | Subscribe to inline new-row creation. |
| `removeOnNew` | `(handler) → void` | Unsubscribe. |
| `addOnNewForm` | `(handler) → void` | Subscribe to new-row-via-form-dialog. |
| `removeOnNewForm` | `(handler) → void` | Unsubscribe. |
| `addOnQuickView` | `(handler) → void` | Subscribe to Quick View open. |
| `removeOnQuickView` | `(handler) → void` | Unsubscribe. |
| `addOnChange` | `(columnName: string, handler) → void` | Subscribe to column value changes. |
| `removeOnChange` | `(columnName: string, handler) → void` | Unsubscribe. |
| `addOnSave` | `(handler) → void` | Subscribe to row-save lifecycle (fires *before* save). |
| `removeOnSave` | `(handler) → void` | Unsubscribe. |
| `addOnRowSave` | `(handler) → void` | Subscribe to single-row commit (fires *after* a row saves). (since v1.5.0) |
| `removeOnRowSave` | `(handler) → void` | Unsubscribe. |
| `addOnRowDelete` | `(handler) → void` | Subscribe to single-row removal (fires *after* a row is deleted). (since v1.5.0) |
| `removeOnRowDelete` | `(handler) → void` | Unsubscribe. |
| `addButton` | `(def: CustomButtonDef) → void` | Add or update a custom command-bar button. (since v1.5.0) |
| `removeButton` | `(id: string) → void` | Remove a custom command-bar button. (since v1.5.0) |
| `setButtonDisabled` | `(id: string, disabled: boolean) → void` | Enable/disable a custom button. (since v1.5.0) |
| `setButtonVisible` | `(id: string, visible: boolean) → void` | Show/hide a custom button. (since v1.5.0) |
| `addOnButtonClick` | `(id: string, handler) → void` | Subscribe to a custom button's clicks. (since v1.5.0) |
| `removeOnButtonClick` | `(id: string, handler) → void` | Unsubscribe. |

### Grid state

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `getRows` | `() → Row[]` | Array of `Row` | All currently loaded rows. |
| `getRow` | `(rowId: string) → Row \| undefined` | `Row` or `undefined` | Find a row by its `rowId`. |
| `getParentEntity` | `() → object` | entity reference | Host form entity reference. |

### Grid manipulation

| Method | Signature | Description |
|--------|-----------|-------------|
| `refresh` | `() → void` | Request the grid to reload its data from Dataverse. |
| `setReadOnlyColumns` | `(columnNames: string[]) → void` | Mark columns as read-only across all rows. Pass an empty array to clear. |
| `setReadOnlyColumnsByRow` | `(rowId: string, columnNames: string[]) → void` | Mark columns as read-only for a specific row only. |
| `setRowHighlight` | `(rowId: string, highlight: boolean) → void` | Toggle visual highlight on a row. |
| `setVisibleHiddenColumns` | `(columnNames: string[]) → void` | Control column visibility. Columns in the array become visible; others are hidden. |
| `setAllowAdd` | `(allow: boolean) → void` | Show (`true`) or hide (`false`) the **Add New** / **New Form** buttons. |
| `setAllowDelete` | `(allow: boolean) → void` | Show (`true`) or hide (`false`) the **Delete** button. |
| `setReadOnly` | `(readOnly: boolean) → void` | Toggle full grid read-only. See **Grid lock / read-only** below. |

### Custom command buttons (since v1.5.0)

A consumer web resource or form script can register its own buttons in the grid's own command bar, positioned to the **left of Add row**. The grid renders the button and reports clicks with the current row selection — what the button's handler then does is entirely the consumer's own code. (A PCF control cannot inject into the model-driven form's own command bar, which is why custom buttons live in the grid's own bar.)

| Method | Signature | Description |
|--------|-----------|-------------|
| `addButton` | `(def: CustomButtonDef) → void` | Add a button, or update it in place if `def.id` already exists (idempotent). |
| `removeButton` | `(id: string) → void` | Remove a button and drop its click handlers. Unknown `id` is a no-op. |
| `setButtonDisabled` | `(id: string, disabled: boolean) → void` | Enable/disable a button at runtime. |
| `setButtonVisible` | `(id: string, visible: boolean) → void` | Show/hide a button at runtime. |
| `addOnButtonClick` | `(id: string, handler) → void` | Attach a click handler to a button by id — the event-bus style, mirroring `addOnChange(column, handler)`. Re-registering the same handler function replaces the prior registration rather than stacking. |
| `removeOnButtonClick` | `(id: string, handler) → void` | Detach a click handler. |

**`CustomButtonDef` (the object passed to `addButton`):**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | yes | Unique per grid — the key used by `removeButton`, `setButtonDisabled`, `setButtonVisible`, and click routing. |
| `label` | `string` | yes | Visible button text. |
| `icon` | `string` | no | Fluent UI icon **name** (e.g. `"Copy"`), not a URL. |
| `order` | `number` | no | Position in the custom-button cluster; smaller renders further left. Appended (after existing custom buttons) when omitted. |
| `disabled` | `boolean` | no | Initial disabled state. Default `false`. |
| `hidden` | `boolean` | no | Initial hidden state. Default `false`. |
| `requireSelection` | `boolean` | no | When `true`, the button auto-disables while no row is selected — the same behavior as the built-in Delete button. |
| `onClick` | `function` | no | Inline click handler — a convenience equivalent to calling `addOnButtonClick(id, handler)` yourself. Register a handler through only one of the two (inline `onClick` or `addOnButtonClick`); registering the same function through both fires it twice. |

Only a small number of custom buttons render inline before the rest collapse into the command bar's **More** (`…`) overflow menu (fewer while the grouping chip is showing, since the chip shares the same horizontal space) — this is automatic and needs no configuration. Custom buttons stay visible and usable even when the grid is in full read-only mode (`grid.setReadOnly(true)`); use `setButtonVisible` / `setButtonDisabled` if a button should not be available in that state.

**Click payload** (`ButtonClickContext`, the second argument handed to the handler):

```js
{
  buttonId: "copyToQuotation",
  data: {
    table: EditableGrid,        // the live grid at click time
    parentEntity: object,       // host form entity reference
    selectedRowIds: string[],   // ids of the currently selected rows
    selectedRows: Row[],        // the same rows, already resolved via table.getRow(id)
  }
}
```

**Worked example:**

```js
grid.addButton({
  id: "copyToQuotation",
  label: "Copy to Quotation",
  icon: "Copy",
  requireSelection: true,   // auto-disabled until at least one row is selected
  onClick: function (instance, ctx) {
    var selected = ctx.data.selectedRows;
    if (selected.length === 0) return;

    // The action performed is entirely the consumer's own code — the grid only
    // renders the button and delivers the selection.
    selected.forEach(function (row) {
      console.log("Copying line to quotation:", row.getRowId());
    });
  },
});

// Later, react to a change elsewhere by toggling the button:
grid.setButtonDisabled("copyToQuotation", false);
grid.setButtonVisible("copyToQuotation", true);
```

---

### Grid lock / read-only

These three methods control whether the user can add, delete, or edit rows. They operate on the grid as a whole (all rows), independent of the cell-level `setReadOnly` / `setReadOnlyColumns` methods.

```js
grid.setAllowAdd(false);    // hides the Add / New Form buttons
grid.setAllowDelete(false); // hides the Delete button
grid.setReadOnly(true);     // full read-only
```

- `setAllowAdd(false)` hides the **Add New** and **New Form** buttons, preventing row creation. `setAllowAdd(true)` restores them.
- `setAllowDelete(false)` hides the **Delete** button, preventing row removal. `setAllowDelete(true)` restores it.
- `setReadOnly(true)` puts the grid into **full read-only**: it hides the Add/Delete buttons *and* blocks all cell editing while enabled. The grid is effectively read-only when Add and Delete are disabled and cells are non-editable — `setReadOnly(true)` enforces all of this at once.

**Toggle semantics:** `setReadOnly(true)` does not permanently overwrite the Add/Delete settings. When you call `setReadOnly(false)`, the grid restores the prior `allowAdd` / `allowDelete` state it had before being locked.

```js
// Lock the grid for non-editors, then restore later.
grid.setReadOnly(true);
// ... later ...
grid.setReadOnly(false);   // prior allowAdd/allowDelete state is restored
```

---

## Row reference

A `Row` represents a single grid row returned from `getRows()`, `getRow()`, or an event's `eventContext.data.row`.

### Reading state

| Member | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `rowId` | property | `string` | Unique identifier for the row within the grid. |
| `getRowId()` | `() → string` | `string` | The row's id. After an `addOnRowSave` for a newly created record, this is the **real Dataverse GUID**; otherwise the grid's row id. |
| `getCell(schemaName)` | `(schemaName: string) → Cell \| undefined` | `Cell` or `undefined` | The `Cell` for the given column logical name, or `undefined` if the column is not present in the grid. |
| `getValue(field)` | `(field: string) → any` | value or `null` | Convenience over `getCell(field).getValue()` — applies the same type conversions (`DateAndTime` → `Date`, `Lookup` → `{ id, name, data }` object, `OptionSet` → option value). For a `Lookup`, read the record GUID via `.id` and the display name via `.name`. Returns `null` for an empty or unknown field (never throws). |
| `getValues()` | `() → object` | `{ [schemaName]: value }` | A map of every cell value in the row, each resolved through `getValue`. |
| `isNew()` | `() → boolean` | `boolean` | `true` only inside an `addOnRowSave` handler when the save **created** the record; `false` for updates and for rows obtained outside a save event. |

### Acting on the row

| Member | Signature | Description |
|--------|-----------|-------------|
| `setDisabled(disabled)` | `(disabled: boolean) → void` | Disable (`true`) or re-enable (`false`) all editable cells in the row. Respects system-disabled rules. |
| `setReadOnly(readOnly)` | `(readOnly: boolean) → void` | Make every cell in the row read-only (`true`) or restore writability (`false`). |
| `setReadOnlyColumns(names, readOnly?)` | `(names: string[], readOnly = true) → void` | Make a subset of columns read-only (default) or writable again (`readOnly = false`). |
| `setHighlight(highlight)` | `(highlight: boolean) → void` | Toggle the row's visual highlight. |
| `setNotification(message, options?)` | `(message: string, options?: object) → void` | Show a row-scoped notification (icon + tooltip + row tint) in the action column. Supports three severities; an `error`-type notification **blocks the row from saving**. See below. |
| `clearNotification()` | `() → void` | Remove any row-scoped notification (icon, tint, and field borders). |
| `save()` | `() → Promise<void>` | Save this single row; resolves once the grid acknowledges the commit (rejects on failure or after a 6s timeout). Triggers `addOnRowSave`. Useful when auto-save is off. |
| `delete()` | `() → Promise<void>` | Delete this row; resolves once the grid acknowledges the removal. For existing records the platform confirmation dialog is still shown. Triggers `addOnRowDelete`. |

**`setNotification` options:**

```js
row.setNotification("Quantity × Unit price ≠ Amount", {
    type: "error",          // 'info' | 'warning' | 'error' (default 'error')
    title: "Data Error",    // bold heading shown above the message in the tooltip
    fields: ["xts_amount"]  // schema names to flag with a red border (only when type === 'error')
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | `'info' \| 'warning' \| 'error'` | `'error'` | Severity. Controls the icon and color of the row indicator, and whether the row is blocked from saving (see below). |
| `title` | `string` | `''` | Bold heading shown above the message in the tooltip (e.g. `"Data Error"`). |
| `fields` | `string[]` | `[]` | Schema names to flag with a red cell border + tooltip. **Only applied when `type === 'error'`.** |

**The three notification types — icon, color, and save behavior:**

| `type` | Icon | Color | Blocks save? |
|--------|------|-------|--------------|
| `info` | info circle | blue (`#0078d4`) | No — purely informational. |
| `warning` | warning triangle | orange (`#f7630c`) | No — advisory only. |
| `error` | error circle | red (`#c0172b`) | **Yes** — the row cannot be saved while the notification is present. |

> **An `error`-type notification blocks the save.** While a row carries an `error` notification:
> - **Auto-save** of that row is rejected (other rows are unaffected — the block is scoped to the flagged row).
> - The grid-wide **Save** button is rejected if *any* row carries an `error` notification, and the error dialog points at the page(s) holding the flagged rows.
>
> The save is rejected with the `Validation.SaveNotificationError` message (with your notification message appended when present). Call `row.clearNotification()` to lift the block once the condition is resolved. `info` and `warning` notifications never block save — use `error` only when you genuinely want to prevent the row from being committed.

This is the row-level counterpart to `cell.setNotification()`: use `error` here when the *whole row* is in an invalid state that must not be saved, and `info`/`warning` to surface non-blocking guidance.

---

## Cell reference

A `Cell` represents a single column value within a row. Obtained via `row.getCell(schemaName)` or from `eventContext.data.cell` in change events.

### Reading state

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `getValue` | `() → any` | column value or `null` | Current cell value. `DateAndTime` columns return a `Date` object; `Lookup` columns return an object `{ id, name, data }` — `id` is the record GUID, `name` the display name, and `data` the full target-entity record (present only for a value just chosen via the in-cell lookup search; `undefined` for values loaded from the grid). All other types return the raw value. Returns `null` when empty. |
| `getType` | `() → string` | type string | Column type as reported by the PCF framework (e.g., `"SingleLine.Text"`, `"Lookup.Simple"`, `"DateAndTime.DateOnly"`). |
| `getDisabled` | `() → boolean` | `boolean` | Whether the cell is currently disabled. |
| `getReadOnly` | `() → boolean` | `boolean` | Whether the cell is currently read-only. |
| `getRequiredLevel` | `() → boolean` | `boolean` | Whether the cell is required (`true`) or optional (`false`). |
| `getReadOnlyColumns` | `() → string[]` | array | Read-only column names that apply in the row context of this cell. |
| `getEditableGridId` | `() → string` | `string` | Logical name of the grid control this cell belongs to. |
| `getOptions` | `() → { text, value }[]` | array | Choices currently offered by an option-set cell (narrowed list if set, else the full metadata list). No-op (`[]`) on a non-option-set cell. See **Option-set choice filtering** below. (since v1.5.0) |

### Setting state

| Method | Signature | Description |
|--------|-----------|-------------|
| `setValue` | `(newValue: any) → Promise<any>` | Set the cell's value. See below. |
| `setDisabled` | `(disabled: boolean) → void` | Enable or disable the cell. Has no effect if the cell is system-disabled. |
| `setReadOnly` | `(readonly: boolean) → void` | Set the cell's read-only state. Has no effect if the cell is system-disabled. |
| `setRequiredLevel` | `(level: 'required' \| 'none') → void` | Set whether the cell is required. Values outside `'required'` and `'none'` are ignored. |
| `setReadOnlyColumns` | `(columnNames: string[]) → void` | Set read-only column names in the row context of this cell. |
| `addOption` | `(value: number, index?: number) → void` | Add a metadata choice to the offered list. No-op on a non-option-set cell. (since v1.5.0) |
| `removeOption` | `(value: number) → void` | Remove a choice from the offered list. No-op on a non-option-set cell. (since v1.5.0) |
| `clearOptions` | `() → void` | Empty the offered list (stored value stays visible). No-op on a non-option-set cell. (since v1.5.0) |
| `resetOptions` | `() → void` | Restore the full metadata choice list. No-op on a non-option-set cell. (since v1.5.0) |

### Lookup pre-search

| Method | Signature | Description |
|--------|-----------|-------------|
| `addPreSearch` | `(filter: string) → void` | Apply a FetchXML filter to constrain the lookup search results for this cell. |
| `removePreSearch` | `() → void` | Remove the lookup search filter. |

### Notifications

| Method | Signature | Description |
|--------|-----------|-------------|
| `setNotification` | `(message: string) → void` | Display an inline notification message on this cell. |
| `clearNotification` | `() → void` | Clear the inline notification. |

### Option-set choice filtering (since v1.5.0)

Lets form-level script control which choices an individual **option-set** cell offers, using the same method names the native model-driven choice control already exposes (`getOptions`, `addOption`, `removeOption`, `clearOptions`) — no new vocabulary if you already know `formContext.getControl(...)`.

Applies to single-choice (OptionSet) and multi-choice (MultiSelectPicklist) columns. `statuscode` and `statecode` are excluded (they keep the platform's system-managed transitions), and TwoOptions is excluded (a boolean toggle, not a choice list). Calling any of these methods on an excluded or non-option-set cell is a **no-op** — reads return `[]`, mutators do nothing, and the grid session never breaks.

| Method | Signature | Description |
|--------|-----------|-------------|
| `getOptions` | `() → { text, value }[]` | The choices currently offered — the narrowed list if one was set on this cell, otherwise the full list loaded from the column's metadata. |
| `addOption` | `(value: number, index?: number) → void` | Add a choice **by its metadata value**, optionally at position `index` (clamped; appended when omitted). The value must be one of the column's existing defined choices — its text (and colour) are resolved from that metadata; a value that is not a defined choice is ignored. Adding a value already present moves it to the new position. |
| `removeOption` | `(value: number) → void` | Remove the choice with this value from the offered list. No-op if it isn't currently offered. |
| `clearOptions` | `() → void` | Empty the offered list entirely — the cell offers no choices to pick from. A value already stored on the cell stays visible; it is never cleared by this call. |
| `resetOptions` | `() → void` | Drop any per-cell narrowing and restore the column's full metadata choice list — the inverse of the calls above. |

The full metadata list is the default returned by `getOptions()` before any of these methods is called, and it is never itself modified — narrowing is layered per row + column, so narrowing one cell never affects the same column on another row.

**Lifecycle:**

- Narrowing persists across row re-render, paging away and back, and a grid refresh.
- After a new row is saved, its narrowing follows the row onto its saved record id.
- A stored value that is no longer in the narrowed list **stays visible** as the selected item — it is not cleared and does not raise a change event. `getOptions()` still omits it, because it is not currently "offered".
- `resetOptions()` (or the consumer narrowing again) is the only thing that clears a narrowing.
- Colours on metadata choices are preserved in the narrowed list; the required-field asterisk and validation behave the same as an unnarrowed cell.

**Worked example — dependent choices:**

A Work Order line has a `xts_state` column (Start / In Progress / Stop / Finish) and a `xts_worktype` column (Productive / Non Productive). The business rule: once `xts_state` is `Start` and `xts_worktype` is `Productive`, the only valid next states are `Stop` and `Finish`.

```js
grid.addOnChange("xts_worktype", function (instance, ctx) {
    var row = ctx.data.row;
    if (!row) return;

    var stateCell = row.getCell("xts_state");
    if (!stateCell) return;

    var state = row.getValue("xts_state");
    var workType = ctx.data.cell.getValue();

    if (state === STATE_START && workType === WORKTYPE_PRODUCTIVE) {
        // Narrow to only Stop and Finish for THIS row's state cell.
        stateCell.clearOptions();
        stateCell.addOption(STATE_STOP);
        stateCell.addOption(STATE_FINISH);
    } else {
        // Restore the full choice list for this row.
        stateCell.resetOptions();
    }
});
```

Narrowing `xts_state` on this row has no effect on any other row's `xts_state` cell — each row's offered list is independent, and a column with no narrowing applied to it always offers its full metadata list.

### Styling (cell render, since v1.5.0)

Visual overrides for how a single cell renders. Every setter is **chainable** (returns the `Cell`) and **merges** with the styles already applied to that cell — so `cell.setBold(true)` followed by `cell.setTextColor("red")` leaves both active. `clearStyle()` removes everything at once.

| Method | Signature | Description |
|--------|-----------|-------------|
| `setTextColor` | `(color: string) → Cell` | Text colour of the cell value. Any CSS colour (`"#B00020"`, `"red"`, `"rgb(11,106,11)"`). Applies to the value in both editable inputs and read-only cells — including the selected tag of a lookup. |
| `setBold` | `(bold: boolean) → Cell` | Bold (`true`) or normal (`false`) value text. |
| `setBackgroundColor` | `(color: string) → Cell` | Background fill of the cell. |
| `setBorderColor` | `(color: string) → Cell` | Border colour. Placement follows editability: on an **editable** cell the border is drawn on the input control itself (text field, spin button, dropdown, lookup picker); on a **read-only / disabled** cell it is drawn around the whole cell. |
| `setItalic` | `(italic: boolean) → Cell` | Italic (`true`) or normal (`false`) value text. |
| `setTextAlign` | `(align: 'left' \| 'center' \| 'right') → Cell` | Horizontal alignment of the value — overrides the column's default alignment (e.g. left-align a numeric cell). |
| `setTextFormat` | `(format: string) → Cell` | Excel-style display format string, interpreted by the cell's column type. Read-only cells show the formatted value as text; an editable **date** cell displays the pattern inside its date input; other editable cells keep their normal input. See below. |
| `setIcon` | `(icon: object) → Cell` | Render a Fluent UI icon inside the cell — before, after, or instead of the value. See below. |
| `clearStyle` | `() → Cell` | Remove **all** styling set on this cell (colour, background, border, bold/italic, alignment, format, icon) and revert to the grid defaults. Safe to call on a never-styled cell. |

#### `setTextFormat` details

The format string uses Excel-style patterns and is applied by column type:

| Column type | Pattern kind | Examples |
|-------------|--------------|----------|
| Date (`DateAndTime.*`) | date pattern | `"dd/MM/yyyy"`, `"dd/MM/yyyy HH:mm"`, `"yyyy-MM-dd"` |
| Numeric (`Decimal`, `Currency`, `Whole.*`, `FP`) | number pattern | `"#,##0.00"` (grouped, 2 decimals), `"0.000"` (no grouping, 3 decimals), `"#,##0"` (grouped, no decimals) |

```js
cell.setTextFormat("dd/MM/yyyy");   // date column
cell.setTextFormat("#,##0.00");     // decimal / currency column
```

Rules:

- **Read-only / disabled cells** always show the formatted value as static text.
- **Editable date cells** render their normal date input, and the input itself displays the pattern (e.g. `30/06/2026` for `"dd/MM/yyyy"`). Picking a date from the calendar works as usual; when typing a date manually, enter it in your locale's format (the platform parser interprets typed text).
- A pattern whose kind doesn't match the column type (e.g. a number pattern on a text column) is ignored — the cell keeps its original display.
- A value that can't be parsed falls back to the original display; the format never blanks a cell.
- Date tokens: `dd`, `d`, `MM`, `M`, `yyyy`, `yy`, `HH`, `H`, `mm` (minutes), `ss`. Literal separators (`/`, `-`, `:`, space) are kept as written.
- Number patterns: a `,` in the integer part enables thousands grouping; the digits after `.` set the decimal places (grouping and decimal symbols follow the user's locale).

#### `setIcon` details

```js
cell.setIcon({
    name: "Warning",        // required — Fluent UI icon name (case-sensitive)
    color: "#B00020",       // optional — any CSS colour
    size: 16,               // optional — pixel size
    position: "before",     // optional — 'before' | 'after' | 'only' (default 'before')
    tooltip: "Check this"   // optional — hover text on the icon
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | `string` | — (required) | Fluent UI icon name, e.g. `"Warning"`, `"Info"`, `"Blocked"`, `"CompletedSolid"`, `"Money"`, `"Lock"`. |
| `color` | `string` | inherits | Icon colour (any CSS colour). |
| `size` | `number` | inherits | Icon size in pixels (16 matches the grid's own icons). |
| `position` | `'before' \| 'after' \| 'only'` | `'before'` | `before` = left of the value, `after` = right of the value, `only` = replace the value with just the icon. |
| `tooltip` | `string` | none | Text shown when hovering the icon. |

**Finding the right icon name:**

The grid renders icons through Fluent UI 8's icon font, so `name` must be an exact **Fluent UI icon name** (PascalCase, case-sensitive). To find one:

1. Alternatively, browse the official list on the **[Fluent UI icons page](https://developer.microsoft.com/en-us/fluentui#/styles/web/icons)**.
2. Copy the name **verbatim** — `"CompletedSolid"` works, `"completedsolid"` or `"Completed Solid"` does not.

> If the icon doesn't appear, the name is almost always wrong (misspelled, wrong casing, or from a different icon set — Fluent UI *System Icons* / Fabric MDL2 names are not interchangeable with other libraries such as Font Awesome or Material Icons). Verify the name exists in the catalog above; an unknown name renders nothing, it does not error.

Common picks: `Info`, `Warning`, `Error`, `Blocked`, `CompletedSolid`, `Lock`, `Money`, `Clock`, `Flag`, `Pinned`.

#### Worked example — styling

```js
grid.addOnChange("xts_closeline", function (instance, ctx) {
    var row = ctx.data.row;
    if (!row) return;

    var reason = row.getCell("xts_closereason");
    if (!reason) return;

    if (ctx.data.cell.getValue() === true) {
        // Chainable setters merge into one style.
        reason.setTextColor("#B00020")
              .setBackgroundColor("#FDE7E9")
              .setBorderColor("#B00020")
              .setBold(true)
              .setItalic(true)
              .setTextAlign("center")
              .setIcon({
                  name: "Warning",
                  color: "#B00020",
                  size: 16,
                  position: "before",
                  tooltip: "Close reason is required when the line is closed"
              });

        // Display formatting — a read-only cell shows the pattern as text; an editable
        // DATE cell shows the pattern inside its date input.
        var promise = row.getCell("xts_promisedate");
        if (promise) promise.setTextFormat("dd/MM/yyyy");
        var total = row.getCell("xts_totalamount");
        if (total) total.setTextFormat("#,##0.00");
    } else {
        // One call reverts everything.
        reason.clearStyle();
    }
});
```

Notes:

- Styles are keyed per **cell** (row + column); styling one cell never affects its neighbours.
- Styles set on an unsaved new row survive the save — they follow the row onto its real record id.
- Styling is display-only: it never changes the cell's value, validation, or read-only/disabled state.

### `setValue` details

```js
const newValue = await cell.setValue(value);
```

`setValue` sends the new value to the grid control and waits for the platform to apply validation and normalization. Returns a Promise:

- **Resolves** with the new value on success.
- **Rejects** with a string beginning with `Validation Error:` when platform validation fails (e.g., a required field constraint or data-type mismatch).

```js
try {
    await cell.setValue("Active");
} catch (err) {
    // err begins with "Validation Error:"
    console.error(err);
}
```

**Lookup fields:** the resolved value is the normalized lookup reference returned by the platform — an object `{ id, name, data }` (`id` = record GUID, `name` = display name) — which may differ from the raw value passed in.

**Clearing a cell (since v1.5.0):** `setValue(null)`, `setValue(undefined)` and `setValue('')` all clear the cell. `0` and `false` are real values, **not** clears. What gets persisted on a clear depends on the column type:

| Column type | `setValue(null / undefined / '')` persists | Notes |
|-------------|--------------------------------------------|-------|
| Text (`SingleLine.Text`), Memo (`Multiple`) | `''` (empty string) | `''` is the correct empty for a string column. |
| Whole / Decimal / FP / Currency | `null` | A real `0` still persists `0`. Clearing no longer writes `0`. |
| OptionSet (choice) | `null` | — |
| MultiSelectPicklist (multi-choice) | `null` | An empty selection is sent as `null`. |
| DateAndTime (date / date-and-time) | `null` | — |
| TwoOptions (yes/no) | `null` | Clearing sets the column to null ("not set") — the target column must be nullable. `setValue(false)` sets it to No (a real value), it does not clear. Note: the in-grid checkbox/toggle renders a null value as unchecked (there is no third visual state). |
| Lookup | `null` | Clears the reference. |

Clearing a **required** cell is still rejected by validation (the Promise rejects with `Validation Error: …`), unchanged from setting any invalid value.

> Prior to v1.5.0, clearing a numeric, choice, or two-options cell could persist an empty string (`''`) instead of `null`. That has been corrected — the table above reflects current behavior.

---

## Worked example

The following form script demonstrates a common pattern: subscribing to a status column change and applying conditional read-only logic, plus an `addOnSave` async validation.

```js
// Form library: Technosoft.Yana.Grid.js (load order: 1)
// Consumer script:              (load order: 2)

/**
 * Form OnLoad handler. Bind this to the form's OnLoad event in the form designer.
 * @param {ExecutionContext} executionContext
 */
async function onFormLoad(executionContext) {
    var grid = await window.top.YanaEditableGrid.getEditableGrid(
        executionContext,
        "xts_orderlines_grid"   // replace with your grid control name
    );

    if (!grid) {
        // Grid not ready within 60 seconds — skip registration.
        return;
    }

    // Subscribe to status column changes.
    grid.addOnChange("xts_status", onStatusChange);

    // Subscribe to customer lookup changes.
    grid.addOnChange("xts_customerid", onCustomerChange);

    // Subscribe to save lifecycle for async validation.
    grid.addOnSave(onBeforeSave);
}

/**
 * Fired when xts_status changes on any row.
 * Sets the unit price cell read-only when status is "Confirmed" (value 100000001).
 * @param {ExecutionContext} instance
 * @param {object} eventContext
 */
function onStatusChange(instance, eventContext) {
    var row = eventContext.data.row;
    var cell = eventContext.data.cell;

    if (!row || !cell) return;

    var statusValue = cell.getValue();
    var priceCell = row.getCell("xts_unitprice");
    if (!priceCell) return;

    if (statusValue === 100000001) {
        // Status = Confirmed — lock the price cell.
        priceCell.setReadOnly(true);
        priceCell.setNotification("Unit price cannot be changed after confirmation.");
    } else {
        priceCell.setReadOnly(false);
        priceCell.clearNotification();
    }
}

/**
 * Fired before each row save.
 * Rejects (with error dialog) if quantity is zero.
 * Note: throwing does NOT prevent save; it surfaces an error dialog and save continues.
 * Use addOnChange + setNotification for pre-save field validation instead.
 * @param {ExecutionContext} instance
 * @param {object} eventContext
 */
async function onBeforeSave(instance, eventContext) {
    var row = eventContext.data.row;
    if (!row) return;

    var qtyCell = row.getCell("xts_quantity");
    if (!qtyCell) return;

    var qty = qtyCell.getValue();
    if (qty !== null && qty === 0) {
        throw new Error("Quantity must be greater than zero.");
    }
}

/**
 * Fired when the xts_customerid LOOKUP changes on any row.
 * A lookup cell value is an object { id, name, data } — read the record GUID
 * from .id and the display name from .name (.data is only present for a value
 * just chosen via the in-cell search, so don't depend on it here).
 * @param {ExecutionContext} instance
 * @param {object} eventContext
 */
function onCustomerChange(instance, eventContext) {
    var row = eventContext.data.row;
    var cell = eventContext.data.cell;

    if (!row || !cell) return;

    var customer = cell.getValue();          // { id, name, data } or null
    if (!customer) return;

    var customerId = customer.id;            // the Dataverse GUID
    var customerName = customer.name;        // the display name
    console.log("Customer changed to", customerName, "(" + customerId + ")");
}
```

### Worked example — row events and row interaction

This example reacts to committed and removed rows, and manipulates a row directly (outside any event).

```js
async function onFormLoad(executionContext) {
    var grid = await window.top.YanaEditableGrid.getEditableGrid(
        executionContext,
        "xts_orderlines_grid"
    );
    if (!grid) return;

    // Fires AFTER each single row commits (auto-save, Save button, or row.save()).
    grid.addOnRowSave(function (instance, ctx) {
        var row = ctx.data.row;
        if (row.isNew()) {
            // Newly created — getRowId() is the real Dataverse GUID.
            console.log("Order line created:", row.getRowId());
        } else {
            console.log("Order line updated:", row.getRowId());
        }
    });

    // Fires AFTER a row is removed (Ctrl+Delete, Delete action, or row.delete()).
    grid.addOnRowDelete(function (instance, ctx) {
        console.log("Order line removed:", ctx.data.row.getRowId());
    });
}

/**
 * Lock a specific row and flag it — e.g. when an order line is fulfilled.
 * Call from your own logic with the row id you want to act on.
 */
function lockFulfilledRow(grid, rowId) {
    var row = grid.getRow(rowId);
    if (!row) return;

    row.setReadOnly(true);                       // all cells read-only
    row.setHighlight(true);                      // visual highlight
    row.setNotification("Fulfilled — locked.", { // row-scoped indicator
        type: "info",
        title: "Locked"
    });

    var values = row.getValues();                // { xts_quantity: 3, xts_unitprice: 10, ... }
    console.log("Locked row values:", values);
}
```

---

## Limitations

| Limitation | Detail |
|-----------|--------|
| `getEditableGrid` timeout | 60 seconds. If the grid has not initialized within this window, the Promise resolves with `null`. |
| `addOnSave` completion timeout | 20 seconds. If the handler does not resolve within 20 seconds, the grid surfaces a `Common.SaveEventTimeout` error dialog and continues. |
| `row.save()` / `row.delete()` ack timeout | 6 seconds. If the grid does not acknowledge the operation within 6 seconds, the returned Promise rejects with a timeout message. |
| `addOnRowDelete` cancelability | Not cancelable. It fires *after* removal, so a handler cannot block the delete. The platform confirmation dialog (shown for existing records) is the only pre-delete gate. |
| Error dialog | Handler exceptions surface via `parent.Xrm.Navigation.openErrorDialog` with the error message and stack trace. |
| Message protocol | All communication uses JSON-stringified `postMessage` between the form window and the grid iframe. The library abstracts this, but cross-origin restrictions apply when grids are embedded in unusual iframe configurations. |
| Load order | `Technosoft.Yana.Grid.js` must be listed as a form library before any script that calls `window.top.YanaEditableGrid`. Incorrect load order results in `window.top.YanaEditableGrid` being `undefined`. |
| Cross-grid events | There is no cross-grid event surface. Each `EditableGrid` instance manages its own event subscriptions independently. |
| Column availability | `row.getCell(schemaName)` returns `undefined` if the column is not included in the bound view. Ensure required columns are present in the view before calling `getCell`. |
| `setTextFormat` scope | Display-only formatting. Read-only cells show the pattern as static text; editable **date** inputs display the pattern natively; editable **numeric** inputs keep the platform-formatted value. Typed date text is parsed by the platform in the user's locale format. |
| `setIcon` names | Icon names must exist in the Fluent UI 8 icon set (case-sensitive). An unknown name renders nothing — it does not error. |

---

## Versioning

The JS SDK is versioned together with the umbrella solution `CORE Custom Control`. The API surface documented here corresponds to the version of the solution currently installed in your environment. See `yanagrid-releases.md` for a list of releases and any SDK-affecting changes between versions.

---

## See also

- `yanagrid-api.md` — manifest properties and behavior contracts for YanaGrid (XML config, property reference)
- `yanagrid-install.md` — importing `CORE Custom Control` and binding YanaGrid to a form
- `plugin-install.md` — Claude Code plugin install steps for external developers

---

> **Bundle metadata** — generated 2026-07-31 from `.public-docs/yanagrid-events.md` for plugin version 1.5.0.