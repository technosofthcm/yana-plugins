# technosofthcm/yana-plugins

Claude Code plugin marketplace for **Yana** — Technosoft's Dealer Management System. Hosts the public SDKs and tooling that partners and customers use when building on Yana.

## Install the marketplace

In any Claude Code session:

```
/plugin marketplace add technosofthcm/yana-plugins
```

Then install individual plugins as needed.

## Available plugins

| Plugin | Description | Audience |
|--------|-------------|----------|
| [`yana-pcf-sdk`](plugins/yana-pcf-sdk) | Reference docs + auto-loading skills for integrating **YanaGrid** and **YanaQuickView** into Power Platform solutions | External developers integrating Yana PCF controls |

### `yana-pcf-sdk`

```
/plugin install yana-pcf-sdk@technosofthcm
```

Ships three skills that auto-trigger on natural-language questions:

- **`yana-pcf-integration`** — install, sub-grid binding, form deployment, migration from legacy solutions, seeding `xts_pluginconfiguration`.
- **`yana-pcf-api-reference`** — manifest properties, behavior contracts, configuration XML shape, error messages.
- **`yana-pcf-features`** — what the controls do, how features behave, per-version changelog.

Backed by 9 reference documents bundled from upstream `.public-docs/` at release time. Plugin version pegs to the umbrella `TechnosoftDmsCoreComponents` Dataverse solution version.

See [`plugins/yana-pcf-sdk/README.md`](plugins/yana-pcf-sdk/README.md) for full details.

## What this marketplace does **not** ship

- **Yana PCF control binaries** — the `TechnosoftDmsCoreComponents` managed solution `.zip` is distributed separately under Technosoft's commercial terms. Request it from your Technosoft contact.
- **Source code for the controls** — internal implementation is not published here.
- **Internal-only plugins** — those live in a private marketplace.

## Versioning

Each plugin pegs to its upstream artifact's version. `yana-pcf-sdk@X.Y.Z` documents the surface of `TechnosoftDmsCoreComponents@X.Y.Z`. Always install the plugin version matching the solution version running in your target environment.

## License

Plugin documentation, skills, and templates in this repository are licensed under **Apache License 2.0**. Per-plugin `LICENSE` and `NOTICE` files apply where present.

The Yana product itself, including PCF control binaries, is governed by Technosoft's commercial terms and is **not** covered by this repository's license.

## Issues and support

- **Plugin issues** (skill triggers, reference doc bugs): file at <https://github.com/technosofthcm/yana-plugins/issues>.
- **Control behavior, solution import, or product questions**: contact the Technosoft DMS Core team through your normal support channel.

## Contributing

Plugins in this repository are generated from internal source-of-truth content (`.public-docs/` in the relevant control repo) and bundled at release time. External pull requests against bundled `references/` are not accepted — please file an issue describing the doc gap instead.
