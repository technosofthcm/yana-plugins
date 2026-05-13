# yana-pcf-sdk

External developer SDK for **Yana PCF controls** — bundle of reference documentation and skills that help you integrate **YanaGrid** and **YanaQuickView** into a Power Platform customer solution.

## Install

In Claude Code:

```
/plugin marketplace add technosofthcm/yana-plugins
/plugin install yana-pcf-sdk@technosofthcm
```

Then ask any integration question — the right skill auto-loads from your phrasing and reads the relevant reference doc into context. There are no slash commands; everything goes through skills.

## What's inside

| Path | Contents |
|------|----------|
| `skills/yana-pcf-integration/` | Auto-loads on install / deploy / binding / migration questions |
| `skills/yana-pcf-api-reference/` | Auto-loads on manifest / behavior / property / error questions |
| `skills/yana-pcf-features/` | Auto-loads on function / feature / capability / version-history questions |
| `references/` | API + install + manual + releases reference docs (bundled from upstream at release time) |

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
