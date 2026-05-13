# yana-pcf-events

## Purpose

Route an external developer's JavaScript SDK question to the right §section of `yanagrid-events.md` — covering how to install `Technosoft.Yana.Grid.js`, obtain a grid handle via `getEditableGrid`, subscribe to lifecycle events (`addOnLoad`, `addOnNew`, `addOnNewForm`, `addOnQuickView`, `addOnChange`, `addOnSave`), and read or manipulate cells through the `EditableGrid` / `Row` / `Cell` API.

## Pain Points

- Without this skill, Claude would either invent a JavaScript API surface that doesn't match the published SDK, or send event-subscription questions to `yana-pcf-api-reference` (which covers XML manifest properties, not JS events).
- `addOnSave` semantics are subtle: throwing from the handler does not block save — it shows an error dialog and save continues. Routing to `yanagrid-events.md §addOnSave` ensures the correct behavior is communicated.
- `getEditableGrid` resolves `null` on timeout (not reject) — misrouted answers often say "catch the rejection", which is incorrect.
- Two install paths (Path A umbrella-bundled vs. Path B manual upload) are context-dependent; the skill routes to `§Install` which covers both.

## Activation profile

| Field | Value |
|-------|-------|
| `description` | "Used when subscribing to YanaGrid lifecycle events from form-level JavaScript, or programmatically reading/manipulating grid cells via Technosoft.Yana.Grid.js." |
| `when_to_use` | subscribe, listen, event handler, onLoad, onChange, onSave, onNew, addOnChange, addOnSave, form script, web resource, JS library, executionContext, getEditableGrid, setValue, setNotification, refresh grid, setRowHighlight, setReadOnly column, cell.setValue, programmatic, custom logic, form-level JS, YanaEditableGrid, EditableGrid, Cell, Row |
| Loads | matching §section of `yanagrid-events.md` + shared `_skill-rules.md` |

## Changelog

### 2026-05-13 — Initial version

- Created to cover the JS SDK event API surface exposed by `Technosoft.Yana.Grid.js`.
- Decision tree routes to all §sections of `yanagrid-events.md` plus `yanagrid-install.md §Step 3` for install questions.
- Activation keywords cover all public event names and `EditableGrid` / `Row` / `Cell` method names.
