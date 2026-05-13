---
name: yana-pcf-events
description: Used when subscribing to YanaGrid lifecycle events from form-level JavaScript, or programmatically reading/manipulating grid cells via Technosoft.Yana.Grid.js.
when_to_use: subscribe, listen, event handler, onLoad, onChange, onSave, onNew, addOnChange, addOnSave, addOnLoad, addOnNew, addOnNewForm, addOnQuickView, form script, web resource, JS library, executionContext, getEditableGrid, setValue, setNotification, refresh grid, setRowHighlight, setReadOnly column, cell.setValue, programmatic, custom logic, form-level JS, YanaEditableGrid, EditableGrid, Cell, Row.
---

# Yana PCF Events — JS SDK

Answer questions about subscribing to YanaGrid lifecycle events from form-level JavaScript using `Technosoft.Yana.Grid.js`, and about reading or manipulating cells via the `EditableGrid` / `Row` / `Cell` API.

> Apply the shared rules in `${CLAUDE_SKILL_DIR}/../../references/_skill-rules.md` before answering.

For manifest XML configuration → `yana-pcf-api-reference`.
For installing `TechnosoftDmsCoreComponents` and binding the grid control → `yana-pcf-integration`.
For end-user features, changelogs, or what YanaGrid does functionally → `yana-pcf-features`.

## Decision tree

All file names below resolve under `${CLAUDE_SKILL_DIR}/../../references/`. Use `Read` with `offset` / `limit` for the matching §section.

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
| `EditableGrid` methods / `refresh` / `setRowHighlight` / `setReadOnlyColumns` | `yanagrid-events.md` | §EditableGrid reference |
| `Row.getCell` / row reference | `yanagrid-events.md` | §Row reference |
| `Cell.getValue` / `setValue` / `setReadOnly` / `setNotification` / `addPreSearch` | `yanagrid-events.md` | §Cell reference |
| Full working example / form script scaffold | `yanagrid-events.md` | §Worked example |
| Timeouts / `Common.SaveEventTimeout` / known limits | `yanagrid-events.md` | §Limitations |
| JS SDK version / which umbrella version ships SDK | `yanagrid-events.md` | §Versioning |
| "Install the JS library" step in install guide | `yanagrid-install.md` | §Step 3 |
