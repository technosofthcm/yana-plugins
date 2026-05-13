# Claude Code Plugin — `yana-pcf-sdk`

`yana-pcf-sdk` is a Claude Code plugin that helps external developers integrate Yana PCF controls (YanaGrid, YanaQuickView) into their Power Platform solutions. The plugin bundles:

- **Reference documentation** for the public API surface of every Yana PCF control.
- **Skills** that load the right reference into context automatically when you ask a question about installation, binding, configuration, or behavior.

Three entry points are available: auto-loading skills (triggered by phrasing your question naturally) and the `/yana-grid-event-handler` scaffold command.

This plugin is for developers integrating Yana controls into their own customer solutions. End users and implementers configuring forms should use the claude.ai Project instead.

---

## Prerequisites

| Item | Required |
|------|----------|
| Claude Code (CLI, desktop, web, or IDE extension) | yes |
| `pac` (Power Platform CLI) | recommended — used when the integration skill suggests checklist steps |
| A Power Platform environment to receive the umbrella solution | yes |
| `TechnosoftDmsCoreComponents` managed solution | yes — request from Technosoft |

---

## Installation

In a Claude Code session:

```
/plugin marketplace add technosofthcm/yana-plugins
/plugin install yana-pcf-sdk@technosofthcm
```

You should see `yana-pcf-sdk` listed as installed when you run `/plugin list`.

To update:

```
/plugin update yana-pcf-sdk@technosofthcm
```

To uninstall:

```
/plugin uninstall yana-pcf-sdk
```

---

## Skills

The plugin ships seven auto-loading skills. Skill triggers are defined in each skill's `SKILL.md` and may evolve between versions.

| Skill | Auto-loads when you ask about | Reads from `references/` |
|-------|-------------------------------|--------------------------|
| `yanagrid-events` | YanaGrid JavaScript event subscription, `getEditableGrid`, `addOnLoad`, `addOnChange`, `addOnSave`, `EditableGrid` / `Row` / `Cell` API, JS SDK install | `yanagrid-events.md` |
| `yanagrid-api` | YanaGrid manifest properties, behavior contracts, configuration XML shape, error messages, compatibility, limitations | `yanagrid-api.md` |
| `yanagrid-install` | YanaGrid install, sub-grid / home grid binding, form deployment, WebResource upload, legacy migration | `yanagrid-install.md`, this file |
| `yanagrid-manual` | YanaGrid features, end-user / implementer how-to, release notes, changelog | `yanagrid-manual.md`, `yanagrid-releases.md` |
| `yanaquickview-api` | YanaQuickView manifest properties, configuration XML shape, error messages, compatibility, limitations | `yanaquickview-api.md` |
| `yanaquickview-install` | YanaQuickView install, embedding, form binding, seeding `xts_pluginconfiguration` | `yanaquickview-install.md`, this file |
| `yanaquickview-manual` | YanaQuickView features, end-user how-to, release notes, changelog | `yanaquickview-manual.md`, `yanaquickview-releases.md` |

Skills load automatically based on your question — you do not invoke them by name. Each skill reads only the §section it needs from the matching reference doc, so the conversation stays focused.

> **Note:** YanaQuickView has no JavaScript event API — there is no `yanaquickview-events` skill.

## Commands

| Command | Purpose |
|---------|---------|
| `/yana-grid-event-handler` | Scaffold a JavaScript web-resource form script that subscribes to YanaGrid events. Prompts for grid control name, event selection, and column names, then emits a ready-to-upload JS file. |

**Canonical reference:** [github.com/technosofthcm/yana-plugins](https://github.com/technosofthcm/yana-plugins) — see the `yana-pcf-sdk` plugin folder for `plugin.json`, README, and `skills/`.

---

## Versioning

The plugin version tracks the umbrella solution version. For example, `yana-pcf-sdk@1.4.0` documents the surface of `TechnosoftDmsCoreComponents@1.4.0`. Always install the plugin version matching the solution version your customer environment is on.

---

## License

`yana-pcf-sdk` is licensed under **Apache License 2.0**. See the `LICENSE` and `NOTICE` files in the plugin repository.

The PCF control binaries inside `TechnosoftDmsCoreComponents` are distributed separately under Technosoft's commercial terms — they are **not** covered by the plugin license.

---

## Support

- For plugin issues (skill triggers, reference doc bugs): file an issue at `https://github.com/technosofthcm/yana-plugins`.
- For control behavior or solution import issues: contact the Technosoft DMS Core team.

---

## See also

- `yanagrid-api.md`, `yanagrid-install.md`, `yanagrid-manual.md`, `yanagrid-releases.md`
- `yanaquickview-api.md`, `yanaquickview-install.md`, `yanaquickview-manual.md`, `yanaquickview-releases.md`

---

> **Bundle metadata** — generated 2026-05-13 from `.public-docs/plugin-install.md` for plugin version 2.0.0.