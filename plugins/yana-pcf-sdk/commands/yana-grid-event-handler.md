---
description: Scaffold a JS web-resource form script that subscribes to YanaGrid events.
---

Scaffold a complete JavaScript form-script web resource for a YanaGrid event integration.

## Steps

### 1. Gather inputs

Ask the user the following questions before generating any code:

1. **Grid control name** — the logical name of the YanaGrid control as set in the form designer (e.g., `xts_orderlines_grid`).
2. **Events to wire** — which lifecycle events to subscribe to. Ask the user to select one or more:
   - `onLoad` — grid finished loading or refreshing
   - `onNew` — user added an inline new row
   - `onNewForm` — user added a row via the new-record form dialog
   - `onQuickView` — user opened the Quick View dialog for a row
   - `onChange` — a column value changed
   - `onSave` — a row is being saved
3. **Column names for onChange** — if `onChange` is selected, ask for the logical name(s) of the column(s) to watch (comma-separated, e.g., `xts_status, xts_type`). Skip if `onChange` was not selected.

### 2. Generate the script

Emit a self-contained JavaScript file with the following structure:

- A JSDoc file header describing the script's purpose, the form it is intended for, and the grid control name.
- A form `OnLoad` async function named `onFormLoad(executionContext)` that:
  1. Calls `await window.top.YanaEditableGrid.getEditableGrid(executionContext, "<gridName>")`.
  2. Null-checks the result and returns early if null.
  3. Calls `grid.add<EventName>(handler)` for each selected event.
  4. For `onChange`, calls `grid.addOnChange("<columnName>", handler)` for each column name provided.
- One handler function per selected event, using the naming convention `on<EventName>` (e.g., `onLoad`, `onChange`, `onSave`).
- Each handler has signature `function handlerName(instance, eventContext)` (or `async function` when appropriate for `onSave`).
- Each handler body contains a `// TODO: implement` comment and demonstrates accessing the most relevant `eventContext.data` properties for that event (e.g., `eventContext.data.row`, `eventContext.data.cell`).
- A JSDoc block on each handler documenting `@param {ExecutionContext} instance` and `@param {object} eventContext`.

Use the exact API surface from `yanagrid-events.md`:
- Entry point: `window.top.YanaEditableGrid.getEditableGrid(executionContext, gridId)`
- Handler signature: `function(instance, eventContext)`
- `eventContext` shape: `{ gridId, eventName, data: { parentEntity, table, row?, cell? } }`

### 3. Print upload instructions

After the code block, print a short numbered list:

1. Copy the generated code into a new `.js` file.
2. Follow the install steps in `yanagrid-events.md §Install` to upload it as a WebResource (type: Script/JScript) in your Dataverse solution.
3. Add `Technosoft.Yana.Grid.js` as a form library (load order: before this script). See `yanagrid-events.md §Install`.
4. Add this script as a form library and bind `onFormLoad` to the form's **OnLoad** event.
5. Save and publish the form.
