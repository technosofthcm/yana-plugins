# yana-pcf-features

## Purpose

Answer "what does YanaGrid / YanaQuickView do", "how does <feature> behave", and "what's new in vX.Y" questions by routing to the right §section of `*-manual.md` and `*-releases.md`. Distinguishes end-user (Part A) from implementer (Part B) wording so that the answer matches the asker's role.

## Pain Points

- Without this skill, Claude would either invent feature behavior or conflate end-user clicks with maker-level configuration choices.
- Release notes are version-anchored — questions like "what's new in v1.4" need to be grounded in `<control>-releases.md` §vX.Y, not in the model's training cut.
- Migration / breaking-change questions cross install + release-notes territory; this skill keeps the boundary explicit by routing breaking-change Qs to `<control>-releases.md` while deferring install steps to `yana-pcf-integration`.

## Activation profile

| Field | Value |
|-------|-------|
| `description` | "Used when asking what YanaGrid / YanaQuickView do, how features work, or what changed across versions." |
| `when_to_use` | features, capabilities, edit a cell, save changes, group rows, footer totals, parent rollup, auto-save, validation, paging, calculation formula, keyboard navigation, accordion sections, fullscreen, what's new, version numbers (v1.0–v1.4), release notes, changelog, migration notes, breaking change |
| Loads | matching §section of `yanagrid-manual.md` / `yanaquickview-manual.md` / `yanagrid-releases.md` / `yanaquickview-releases.md` + shared `_skill-rules.md` |

## Changelog

### 2026-05-13 — Initial skill + skill-creator alignment

- Created skill alongside `yana-pcf-integration` and `yana-pcf-api-reference` to extend the plugin scope to functional Q&A (bundle adds `*-manual.md` and `*-releases.md`).
- Split `description` and `when_to_use` per Claude Code skills schema; description <200 char, third-person.
- Used shared `_skill-rules.md` from inception; decision tree uses bare filenames under declared `${CLAUDE_SKILL_DIR}/../../references/` prefix.
