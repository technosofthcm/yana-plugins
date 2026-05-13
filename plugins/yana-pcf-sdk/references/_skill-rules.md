# Yana PCF SDK — Shared Skill Rules

Plugin-internal reference loaded by every `yana-pcf-sdk` skill. Not part of the external knowledge base; the leading underscore signals "internal" and the bundle script preserves it across re-bundles.

## Path resolution

Every skill resolves bundled docs via `${CLAUDE_SKILL_DIR}/../../references/<file>.md`. Claude Code substitutes `${CLAUDE_SKILL_DIR}` to the skill's own folder before the skill body is sent to the model, so the final path is absolute and resolves regardless of the user's current working directory. When reading a bundled doc, use the `Read` tool with `offset` / `limit` to load only the relevant §section — do not dump the full file.

## Routing matrix

| User intent | Owning skill |
|-------------|--------------|
| Install, sub-grid binding, form deployment, migration, seeding `xts_pluginconfiguration` | `yana-pcf-integration` |
| Manifest property name, behavior contract, configuration XML shape, error message lookup | `yana-pcf-api-reference` |
| What the control does, end-user / implementer how-to, per-version changelog | `yana-pcf-features` |

If a question crosses two surfaces, the owning skill answers and references the sibling skill for the secondary aspect rather than reproducing it.

## Answer rules

1. **Cite the §section verbatim** — answers say "per `yanagrid-install.md` §Step 5". External developers must be able to verify in writing.
2. **No invented surface.** A property, behavior, error, or feature absent from the bundled `references/` does not exist on the published API — say so explicitly.
3. **Disclose required-vs-optional and default value** when describing a manifest property.
4. **Copy XML recipes verbatim** from the §Configuration recipes block — they are tested.
5. **Quote error messages verbatim** from §Errors tables — they are the actual English (1033) resource strings.
6. **Flag version mismatch.** `yana-pcf-sdk@X.Y.Z` documents `TechnosoftDmsCoreComponents@X.Y.Z`. If the user runs a different umbrella version, note the doc-drift risk and direct them to the matching `*-releases.md`.
7. **No internal implementation.** When asked about internals, respond: "Internal not part of the published API. Behavior contract in `<control>-api.md`; functional behavior in `<control>-manual.md`."
8. **Preserve numbered-table formatting** when emitting step-by-step instructions — copy the structure from the source doc, not just the content.
