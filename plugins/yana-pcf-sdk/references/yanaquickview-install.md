# YanaQuickView — Installation Guide

This guide walks an implementer through installing the **standalone YanaQuickView v1.0.0** PCF control and embedding it on a Power Apps form, ribbon, or custom page.

YanaQuickView ships inside the umbrella Dataverse solution **CORE Custom Control** alongside YanaGrid.

---

## Prerequisites

| Item | Required |
|------|----------|
| Microsoft Power Platform environment (Dataverse online) | yes |
| System Administrator or System Customizer role | yes |
| `CORECustomControl` managed solution file (`.zip`) | yes — provided by Technosoft |
| `xts_pluginconfiguration` table available in the target environment | yes — included in the solution |

> If you have already installed YanaGrid v1.4.0, the umbrella solution is already imported and YanaQuickView is available. Skip to **Step 2**.

---

## Step 1 — Import the umbrella solution

Same as the YanaGrid install — see `yanagrid-install.md` → **Step 1 (Import)**. Both controls ship in the same solution.

---

## Step 2 — Decide the embedding context

Choose one:

| Context | Use case | Steps |
|---------|----------|-------|
| **Form section** | Show related-entity overview on a parent record | Section A below |
| **Ribbon button** (custom page) | Quick View from a list grid toolbar | Section B below |
| **Custom page** | Standalone dashboard or app page | Section C below |

### A — Form section

1. Open the form designer for the parent entity.
2. Add a one-column section to the form.
3. Add a single-line text column to the section — this is the bound `selectedQuery` output. The column can be hidden via Field Properties → Display → Visible by default = unchecked.
4. With the column selected, switch to the **Components** tab in the right pane.
5. Add component → **YanaQuickView** (publisher `TECHNOSOFT_DMS_CORE`).
6. Enable for **Web**, **Phone**, **Tablet** as required.
7. Set `quickViewConfigName` (optional) — leaves empty to use the first config block found.
8. Save and publish.

### B — Ribbon button via custom page

1. Build a model-driven app **custom page** that hosts the control bound to the current record context.
2. Add the YanaQuickView component to the page.
3. Bind `selectedQuery` to a Power Fx variable or a hidden text label.
4. Use **Ribbon Workbench** or the modern command designer to add a button on the target entity's grid that opens the custom page in a side dialog.

### C — Custom page (standalone)

1. Add YanaQuickView to a custom page in your app.
2. Bind `selectedQuery` to a Power Fx variable.
3. Bind the configuration name as needed.

---

## Step 3 — Seed the configuration record

The control is data-driven — it needs a configuration record before it can render anything.

1. Open the **`xts_pluginconfiguration`** table.
2. **+ New** record.
3. Set the entity-lookup column to the entity whose data Quick View will display.
4. Paste the `<Configurations>` XML into the `xts_configuration` column. See `yanaquickview-api.md` → **Configuration shape**.
5. Save.

### Configuration template

```xml
<Configurations>
  <FamilyTreeConfig>
    <Query>
      <fetch>
        <entity name="xts_related_entity_logical_name">
          <attribute name="xts_column1" />
          <attribute name="xts_column2" minwidth="170px" />
          <filter>
            <condition attribute="xts_parent_lookup" operator="eq" value="CurrentRecordId" />
          </filter>
        </entity>
      </fetch>
    </Query>
  </FamilyTreeConfig>
</Configurations>
```

Repeat `<Query>` blocks for additional accordion sections.

---

## Step 4 — Verify

| # | Verification |
|---|--------------|
| 1 | Open a host record; the YanaQuickView section renders without error. |
| 2 | All `<Query>` blocks appear as accordion sections. |
| 3 | The first section is expanded; the rest are collapsed. |
| 4 | Each section fetches and renders rows (or shows the empty/error state). |
| 5 | Placeholders (`CurrentRecordId`, `CurrentUserId`) are substituted with live values. |
| 6 | Failed sections show a Retry button that re-runs only that section. |
| 7 | If `selectedQuery` is bound, changing the active section updates the bound column. |

---

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---------|--------------|------------|
| Control renders but accordion is empty | No `xts_pluginconfiguration` record for the entity | Seed the configuration record |
| All sections show error state | Configuration XML is malformed | Validate the XML in `xts_configuration` |
| Section shows error, others load fine | FetchXML in that `<Query>` is invalid | Test the FetchXML in the Advanced Find or a query tool |
| `CurrentRecordId` returns empty | Host context does not provide a record id (e.g. unsaved new record) | Save the host record first; or design configuration without record-scope |
| Wrong configuration block read | `quickViewConfigName` empty and multiple `<*Config>` blocks exist | Set `quickViewConfigName` to the intended block tag name |

For issues not listed here, see `yanaquickview-manual.md` → **Support** for the support contact.

---

## See also

- `yanaquickview-api.md` — manifest properties and configuration shape
- `yanaquickview-manual.md` — end-user + implementer how-to
- `yanaquickview-releases.md` — version history
- `yanagrid-install.md` — Grid install + Grid-embedded Quick View
- `plugin-install.md` — Claude Code plugin for developers

---

> **Bundle metadata** — generated 2026-09-04 from `.public-docs/yanaquickview-install.md` for plugin version 1.4.0.