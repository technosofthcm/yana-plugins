# yana-pcf-sdk

External developer SDK for **Yana PCF controls** — bundle of reference documentation and skills that help you integrate **YanaGrid** and **YanaQuickView** into a Power Platform customer solution.

## Install

In Claude Code:

```
/plugin marketplace add technosofthcm/yana-plugins
/plugin install yana-pcf-sdk@technosofthcm
```

Then ask any integration question — the right skill auto-loads from your phrasing and reads the relevant reference doc into context. You can also run `/yana-grid-event-handler` to scaffold a complete form-script JS file wired to the YanaGrid event API.

## What's inside

| Path | Contents |
|------|----------|
| `skills/yanagrid-events/` | Auto-loads on YanaGrid JavaScript event questions: `addOnLoad`, `addOnChange`, `addOnSave`, `getEditableGrid`, `EditableGrid` / `Row` / `Cell` API, JS SDK install |
| `skills/yanagrid-api/` | Auto-loads on YanaGrid manifest property, behavior contract, config XML, error code, or compatibility questions |
| `skills/yanagrid-install/` | Auto-loads on YanaGrid install, sub-grid binding, form deployment, WebResource upload, or legacy migration questions |
| `skills/yanagrid-manual/` | Auto-loads on YanaGrid features, end-user / implementer how-to, and version changelog questions |
| `skills/yanaquickview-api/` | Auto-loads on YanaQuickView manifest property, config XML, error code, or compatibility questions (config-only — no events) |
| `skills/yanaquickview-install/` | Auto-loads on YanaQuickView install, embedding, form binding, or xts_pluginconfiguration seed questions |
| `skills/yanaquickview-manual/` | Auto-loads on YanaQuickView features, accordion behavior, end-user how-to, and version changelog questions |
| `commands/yana-grid-event-handler.md` | Scaffold command — generates a ready-to-upload form-script JS file wired to YanaGrid events |
| `references/` | API + install + events + manual + releases reference docs (bundled from upstream at release time) |
| `references/sdk/` | `Technosoft.Yana.Grid.js` — JS SDK WebResource (bundled from upstream at release time; upload this if your umbrella solution predates `v_sdk_bundled`) |

> **Note:** YanaQuickView has no JavaScript event API — there is no `yanaquickview-events` skill.

## Event-driven workflow

Starting with `TechnosoftDmsCoreComponents` v`v_sdk_bundled`, you can subscribe to grid lifecycle events from a standard Dataverse form script. Load `Technosoft.Yana.Grid.js` as a form library, then call `window.top.YanaEditableGrid.getEditableGrid(executionContext, gridName)` to get a handle. From there you can wire `addOnLoad`, `addOnChange`, `addOnSave`, and other events, and read or set cell values via the `Row` and `Cell` API.

Ask the `yanagrid-events` skill any question about the JS SDK, or run `/yana-grid-event-handler` to get a scaffolded form script in seconds.

## Audience

External developers integrating Yana PCF controls into their own (or their customers') Power Platform solutions. **Not** for:

- End users of Yana-powered screens → use the **claude.ai Project** for user-manual chat.
- Internal Yana contributors → use the private `yana-pcf-dev` plugin.

## What this plugin does NOT include

- The Yana PCF control binaries themselves — request the `TechnosoftDmsCoreComponents` solution `.zip` directly from Technosoft.
- Source code for the controls — internal implementation is not published.
- Production deployment automation — you own your pipelines.

## Versioning

`yana-pcf-sdk@X.Y.Z` documents the surface of `TechnosoftDmsCoreComponents@X.Y.Z`. Install the plugin version matching the solution version your customer environment runs.

## License

Apache License 2.0 — see [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE).

The plugin license covers only the documentation and skills here. The PCF control binaries are distributed separately under Technosoft commercial terms.

## Issues

File at the marketplace repository: <https://github.com/technosofthcm/yana-plugins/issues>

For control behavior or solution import issues, contact the Technosoft DMS Core team directly.
