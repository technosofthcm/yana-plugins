# YanaGrid — JavaScript SDK Events Reference

`Technosoft.Yana.Grid.js` is a JavaScript WebResource that lets form-level scripts interact with embedded YanaGrid controls from the host form's execution context. The library is intended for external developers who need to subscribe to grid lifecycle events, read row and cell state, or programmatically manipulate cells from a Dataverse model-driven form script.

---

## Overview

`Technosoft.Yana.Grid.js` ships as a Dataverse WebResource. Once it is loaded as a form library, it exposes `window.top.YanaEditableGrid` — an instance of the `Controls` class. Form scripts call `getEditableGrid` on this object to obtain an `EditableGrid` handle for the named grid control embedded on the form.

Communication between the form-level library and the grid control uses a postMessage-based protocol. Messages are JSON-stringified and exchanged across the iframe boundary. The library abstracts this protocol entirely; consumer scripts only interact with the `EditableGrid`, `Row`, and `Cell` objects documented here.

The library runs in the host form's window context (`window.top`). It must be loaded before any consumer form script that calls `window.top.YanaEditableGrid`.

---

## Install

### Path A — Umbrella solution `TechnosoftDmsCoreComponents` ≥ `v_sdk_bundled`

Starting with version `v_sdk_bundled`, `Technosoft.Yana.Grid.js` ships as a WebResource inside the `TechnosoftDmsCoreComponents` managed solution. If your environment already has this or a newer version imported, the JS file is available under the publisher prefix — no manual upload is required.

To use it:

1. Open the form designer for the form that hosts the YanaGrid control.
2. In the **Events** tab, add `Technosoft.Yana.Grid.js` as a form library.
3. Set the library's load order so it runs **before** your consumer form script.
4. Save and publish the form.

### Path B — Older umbrella version, or testing

If your `TechnosoftDmsCoreComponents` version predates `v_sdk_bundled`, or you want to test with a local copy, upload the file manually:

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

To check which path applies: in **make.powerapps.com** → **Solutions** → open `TechnosoftDmsCoreComponents` → look for a WebResource entry for the Yana Grid SDK JavaScript file.

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
| `addOnSave` | `(handler) → void` | Subscribe to row-save lifecycle. |
| `removeOnSave` | `(handler) → void` | Unsubscribe. |

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

---

## Row reference

A `Row` represents a single grid row returned from `getRows()`, `getRow()`, or an event's `eventContext.data.row`.

| Member | Type | Description |
|--------|------|-------------|
| `rowId` | `string` | Unique identifier for the row within the grid. |
| `getCell(schemaName)` | `(schemaName: string) → Cell \| undefined` | Return the `Cell` for the given column logical name, or `undefined` if the column is not present in the grid. |

---

## Cell reference

A `Cell` represents a single column value within a row. Obtained via `row.getCell(schemaName)` or from `eventContext.data.cell` in change events.

### Reading state

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `getValue` | `() → any` | column value or `null` | Current cell value. `DateAndTime` columns return a `Date` object; all other types return the raw value. Returns `null` when empty. |
| `getType` | `() → string` | type string | Column type as reported by the PCF framework (e.g., `"SingleLine.Text"`, `"Lookup.Simple"`, `"DateAndTime.DateOnly"`). |
| `getDisabled` | `() → boolean` | `boolean` | Whether the cell is currently disabled. |
| `getReadOnly` | `() → boolean` | `boolean` | Whether the cell is currently read-only. |
| `getRequiredLevel` | `() → boolean` | `boolean` | Whether the cell is required (`true`) or optional (`false`). |
| `getReadOnlyColumns` | `() → string[]` | array | Read-only column names that apply in the row context of this cell. |
| `getEditableGridId` | `() → string` | `string` | Logical name of the grid control this cell belongs to. |

### Setting state

| Method | Signature | Description |
|--------|-----------|-------------|
| `setValue` | `(newValue: any) → Promise<any>` | Set the cell's value. See below. |
| `setDisabled` | `(disabled: boolean) → void` | Enable or disable the cell. Has no effect if the cell is system-disabled. |
| `setReadOnly` | `(readonly: boolean) → void` | Set the cell's read-only state. Has no effect if the cell is system-disabled. |
| `setRequiredLevel` | `(level: 'required' \| 'none') → void` | Set whether the cell is required. Values outside `'required'` and `'none'` are ignored. |
| `setReadOnlyColumns` | `(columnNames: string[]) → void` | Set read-only column names in the row context of this cell. |

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

**Lookup fields:** the resolved value is the normalized lookup reference returned by the platform, which may differ from the raw value passed in.

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
```

---

## Limitations

| Limitation | Detail |
|-----------|--------|
| `getEditableGrid` timeout | 60 seconds. If the grid has not initialized within this window, the Promise resolves with `null`. |
| `addOnSave` completion timeout | 20 seconds. If the handler does not resolve within 20 seconds, the grid surfaces a `Common.SaveEventTimeout` error dialog and continues. |
| Error dialog | Handler exceptions surface via `parent.Xrm.Navigation.openErrorDialog` with the error message and stack trace. |
| Message protocol | All communication uses JSON-stringified `postMessage` between the form window and the grid iframe. The library abstracts this, but cross-origin restrictions apply when grids are embedded in unusual iframe configurations. |
| Load order | `Technosoft.Yana.Grid.js` must be listed as a form library before any script that calls `window.top.YanaEditableGrid`. Incorrect load order results in `window.top.YanaEditableGrid` being `undefined`. |
| Cross-grid events | There is no cross-grid event surface. Each `EditableGrid` instance manages its own event subscriptions independently. |
| Column availability | `row.getCell(schemaName)` returns `undefined` if the column is not included in the bound view. Ensure required columns are present in the view before calling `getCell`. |

---

## Versioning

The JS SDK is versioned together with the umbrella solution `TechnosoftDmsCoreComponents`. The API surface documented here corresponds to the version of the solution currently installed in your environment. See `yanagrid-releases.md` for a list of releases and any SDK-affecting changes between versions.

---

## See also

- `yanagrid-api.md` — manifest properties and behavior contracts for YanaGrid (XML config, property reference)
- `yanagrid-install.md` — importing `TechnosoftDmsCoreComponents` and binding YanaGrid to a form
- `plugin-install.md` — Claude Code plugin install steps for external developers

---

> **Bundle metadata** — generated 2026-05-13 from `.public-docs/yanagrid-events.md` for plugin version 2.0.0.