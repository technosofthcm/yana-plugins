---
name: yanagrid-events
description: Used when subscribing to YanaGrid lifecycle events from form-level JavaScript, or programmatically reading/manipulating grid cells via Technosoft.Yana.Grid.js — NOT for manifest properties or configuration XML.
when_to_use: events, what events, list events, available events, exposed events, lifecycle events, grid events, events on yana grid, events I can use, JS API, programmatic API, integration events, subscribe, listen, event handler, onLoad, onChange, onSave, onNew, addOnChange, addOnSave, addOnLoad, addOnNew, addOnNewForm, addOnQuickView, addOnRowSave, removeOnRowSave, addOnRowDelete, removeOnRowDelete, form script, web resource, executionContext, getEditableGrid, setValue, setNotification, setRowHighlight, setReadOnly, cell.setValue, EditableGrid, Cell, Row, YanaEditableGrid, JS library, programmatic, custom logic, form-level JS, getOptions, addOption, removeOption, clearOptions, resetOptions, option-set filtering, dependent choice, addButton, removeButton, setButtonDisabled, setButtonVisible, addOnButtonClick, removeOnButtonClick, custom command button, setTextFormat, setIcon, cell styling, cell render, clear cell value.
---

# YanaGrid Events — JS SDK

Answer questions about subscribing to YanaGrid lifecycle events from form-level JavaScript using `Technosoft.Yana.Grid.js`, and about reading or manipulating cells via the `EditableGrid` / `Row` / `Cell` API.

> Apply shared rules in `${CLAUDE_SKILL_DIR}/../../references/_skill-rules.md`.

For YanaGrid manifest properties, behavior contracts, config XML, or error codes → `yanagrid-api`.
For installing TechnosoftDmsCoreComponents and binding the grid control → `yanagrid-install`.
For end-user features, changelogs, or what YanaGrid does functionally → `yanagrid-manual`.

## Decision tree

All paths resolve under `${CLAUDE_SKILL_DIR}/../../references/`. Use `Read` with `offset` / `limit` for the matching §section.

| User asks | File | §Section |
|-----------|------|----------|
| "How do I install the JS library?" / WebResource upload | `yanagrid-events.md` | §Install |
| "How do I get a grid handle?" / `getEditableGrid` | `yanagrid-events.md` | §Entry point |
| `addOnLoad` / "when grid loads" | `yanagrid-events.md` | §addOnLoad |
| `addOnNew` / "new inline row" | `yanagrid-events.md` | §addOnNew |
| `addOnNewForm` / "new form dialog" | `yanagrid-events.md` | §addOnNewForm |
| `addOnQuickView` / "quick view opened" | `yanagrid-events.md` | §addOnQuickView |
| `addOnChange` / "column changed" | `yanagrid-events.md` | §addOnChange |
| `addOnSave` / "before save" / "async validation" | `yanagrid-events.md` | §addOnSave |
| `addOnRowSave` / `removeOnRowSave` | `yanagrid-events.md` | §`addOnRowSave` / `removeOnRowSave` (since v1.5.0) |
| `addOnRowDelete` / `removeOnRowDelete` | `yanagrid-events.md` | §`addOnRowDelete` / `removeOnRowDelete` (since v1.5.0) |
| `EditableGrid` methods / `refresh` / `setRowHighlight` / `setReadOnlyColumns` | `yanagrid-events.md` | §EditableGrid reference |
| Custom command buttons / `addButton` / `addOnButtonClick` | `yanagrid-events.md` | §Custom command buttons (since v1.5.0) |
| `Row.getCell` / row reference | `yanagrid-events.md` | §Row reference |
| `Cell.getValue` / `setValue` / `setReadOnly` / `setNotification` / `addPreSearch` | `yanagrid-events.md` | §Cell reference |
| Option-set choice filtering / `getOptions` / `addOption` / dependent choice | `yanagrid-events.md` | §Option-set choice filtering (since v1.5.0) |
| Cell styling / `setTextFormat` / `setIcon` | `yanagrid-events.md` | §Styling (cell render, since v1.5.0) |
| Clearing a cell value / `setValue` semantics by type | `yanagrid-events.md` | §`setValue` details |
| Full working example / form script scaffold | `yanagrid-events.md` | §Worked example |
| Row events worked example / row interaction | `yanagrid-events.md` | §Worked example — row events and row interaction |
| Timeouts / `Common.SaveEventTimeout` / known limits | `yanagrid-events.md` | §Limitations |
| JS SDK version / which umbrella version ships SDK | `yanagrid-events.md` | §Versioning |
| "Install the JS library" step in install guide | `yanagrid-install.md` | §Step 2 — Install Technosoft.Yana.Grid.js WebResource |
