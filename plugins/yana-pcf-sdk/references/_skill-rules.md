# Yana PCF SDK — Shared Skill Rules

Plugin-internal reference loaded by every `yana-pcf-sdk` skill. Not part of the external knowledge base; the leading underscore signals "internal" and the bundle script preserves it across re-bundles.

## Path resolution

Every skill resolves bundled docs via `${CLAUDE_SKILL_DIR}/../../references/<file>.md`. Claude Code substitutes `${CLAUDE_SKILL_DIR}` to the skill's own folder before the skill body is sent to the model, so the final path is absolute and resolves regardless of the user's current working directory. When reading a bundled doc, use the `Read` tool with `offset` / `limit` to load only the relevant §section — do not dump the full file.

## Routing matrix

| User intent | Owning skill |
|-------------|--------------|
| YanaGrid: subscribe to events, JS SDK, `getEditableGrid`, `addOnChange`, `addOnSave`, `EditableGrid` / `Row` / `Cell` API, form-level JS | `yanagrid-events` |
| YanaGrid: manifest property, behavior contract, configuration XML shape, error message, compatibility, limitations | `yanagrid-api` |
| YanaGrid: install, sub-grid binding, form deployment, migration from legacy, WebResource install | `yanagrid-install` |
| YanaGrid: what it does, end-user / implementer how-to, features, per-version changelog | `yanagrid-manual` |
| YanaQuickView: manifest property, behavior contract, configuration XML shape, error message, compatibility, limitations | `yanaquickview-api` |
| YanaQuickView: install, embed, form deployment, seeding `xts_pluginconfiguration` | `yanaquickview-install` |
| YanaQuickView: what it does, end-user / implementer how-to, features, per-version changelog | `yanaquickview-manual` |

If a question crosses two surfaces, the owning skill answers and references the sibling skill for the secondary aspect rather than reproducing it.

## Anti-keyword routing

When a query contains BOTH control-name terms AND topic terms, route by TOPIC first:

| If query contains | Route to |
|-------------------|----------|
| `event`, `subscribe`, `listen`, `handler`, `onChange`, `onSave`, `onLoad`, `onNew`, `addOn*`, `cell.setValue`, `setRowHighlight`, `setReadOnly` (programmatically), `getEditableGrid`, `YanaEditableGrid` | `yanagrid-events` |
| `install`, `deploy`, `import solution`, `form binding`, `sub-grid`, `WebResource`, `migrate` | `yanagrid-install` or `yanaquickview-install` (by control name) |
| `manifest property`, `Formula.`, `xts_pluginconfiguration`, `error code`, `compatibility`, `limitations`, `configuration XML` | `yanagrid-api` or `yanaquickview-api` (by control name) |
| `what does it do`, `features`, `overview`, `changelog`, `release notes`, `v1.X`, `migration notes` | `yanagrid-manual` or `yanaquickview-manual` (by control name) |

If query has NO control-name term, infer from feature keywords:
- `Quick View toolbar`, `parent rollup`, `auto-save`, `grouping`, `footer total`, `formula` → Grid
- `accordion`, `selectedQuery`, `FamilyTreeConfig`, `quickViewConfigName` → QuickView

## Answer rules

1. **Cite the §section verbatim** — answers say "per `yanagrid-install.md` §Step 5". External developers must be able to verify in writing.
2. **No invented surface.** A property, behavior, error, or feature absent from the bundled `references/` does not exist on the published API — say so explicitly.
3. **Disclose required-vs-optional and default value** when describing a manifest property.
4. **Copy XML recipes verbatim** from the §Configuration recipes block — they are tested.
5. **Quote error messages verbatim** from §Errors tables — they are the actual English (1033) resource strings.
6. **Flag version mismatch.** `yana-pcf-sdk@X.Y.Z` documents `TechnosoftDmsCoreComponents@X.Y.Z`. If the user runs a different umbrella version, note the doc-drift risk and direct them to the matching `*-releases.md`.
7. **No internal implementation.** When asked about internals, respond: "Internal not part of the published API. Behavior contract in `<control>-api.md`; functional behavior in `<control>-manual.md`; JS event surface in `yanagrid-events.md` (Grid only — YanaQuickView has no event API)."
8. **Preserve numbered-table formatting** when emitting step-by-step instructions — copy the structure from the source doc, not just the content.
9. **Event handlers run inside the host form's window context.** The entry point is `window.top.YanaEditableGrid` (from `Technosoft.Yana.Grid.js`). Never reference internal React or Redux state. All public API surface is on the `Controls`, `EditableGrid`, `Row`, and `Cell` classes documented in `yanagrid-events.md`.
