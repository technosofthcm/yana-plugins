# Claude Code Plugin — `yana-pcf-sdk`

`yana-pcf-sdk` is a Claude Code plugin that helps external developers integrate Yana PCF controls (YanaGrid, YanaQuickView) into their Power Platform solutions. The plugin bundles:

- **Reference documentation** for the public API surface of every Yana PCF control.
- **Slash commands** that scaffold integration boilerplate.
- **Skills** that load the right context automatically when you ask a question about installation, configuration, or behavior.

This plugin is for developers integrating Yana controls into their own customer solutions. End users and implementers configuring forms should use the claude.ai Project instead.

---

## Prerequisites

| Item | Required |
|------|----------|
| Claude Code (CLI, desktop, web, or IDE extension) | yes |
| `pac` (Power Platform CLI) | recommended — used when the integration skill suggests checklist steps |
| A Power Platform environment to receive the umbrella solution | yes |
| `CORE Custom Control` managed solution | yes — request from Technosoft |

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

## Commands & skills

The plugin ships slash commands (scaffolding integrations) and auto-loading skills (install + API reference). Command names, argument syntax, and skill triggers are defined in the plugin's `plugin.json` and may change between versions.

**Canonical reference:** [github.com/technosofthcm/yana-plugins](https://github.com/technosofthcm/yana-plugins) — see the `yana-pcf-sdk` plugin folder for `plugin.json`, README, and `skills/`.

**After install** run `/help yana-pcf-sdk` in Claude Code for the current command list and per-command help.

---

## Versioning

The plugin version tracks the umbrella solution version. For example, `yana-pcf-sdk@1.4.0` documents the surface of `CORE Custom Control` v1.4.0. Always install the plugin version matching the solution version your customer environment is on.

---

## License

`yana-pcf-sdk` is licensed under **Apache License 2.0**. See the `LICENSE` and `NOTICE` files in the plugin repository.

The PCF control binaries inside `CORE Custom Control` are distributed separately under Technosoft's commercial terms — they are **not** covered by the plugin license.

---

## Support

- For plugin issues (skill triggers, reference doc bugs): file an issue at `https://github.com/technosofthcm/yana-plugins`.
- For control behavior or solution import issues: contact the Technosoft DMS Core team.

---

## See also

- `yanagrid-api.md`, `yanagrid-install.md`, `yanagrid-manual.md`, `yanagrid-releases.md`
- `yanaquickview-api.md`, `yanaquickview-install.md`, `yanaquickview-manual.md`, `yanaquickview-releases.md`

---

> **Bundle metadata** — generated 2026-09-04 from `.public-docs/plugin-install.md` for plugin version 1.4.0.