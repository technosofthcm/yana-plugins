# YanaGrid — Installation Guide

This guide walks an implementer through installing **YanaGrid v1.5.0** into a Microsoft Power Platform environment and binding the control to a form or sub-grid.

YanaGrid ships inside the umbrella Dataverse solution **CORE Custom Control** alongside YanaQuickView and any future Yana core PCF controls.

---

## Prerequisites

| Item | Required |
|------|----------|
| Microsoft Power Platform environment (Dataverse online) | yes |
| System Administrator or System Customizer role | yes |
| Solution import permission on the target environment | yes |
| `CORECustomControl` managed solution file (`.zip`) | yes — provided by Technosoft |

---

## Step 1 — Import the umbrella solution

1. Sign in to **make.powerapps.com** and select the target environment.
2. Open **Solutions** → **Import solution**.
3. Browse to and select `CORECustomControl_<version>_managed.zip`.
4. On the **Solution information** page, confirm:
   - Display name: `CORE Custom Control`
   - Publisher: `TECHNOSOFT_DMS_CORE`
5. Click **Next** → **Import**. The import runs asynchronously; wait for the success notification.

---

## Step 2 — Install `Technosoft.Yana.Grid.js` WebResource (optional — JS event API)

Skip this step if you do not intend to subscribe to YanaGrid lifecycle events from a form script. If you plan to call `window.top.YanaEditableGrid.getEditableGrid` from a form-level web resource, complete this step first.

### Path A — Umbrella solution ≥ `v_sdk_bundled`

Starting with version `v_sdk_bundled`, the `Technosoft.Yana.Grid.js` WebResource ships inside `CORE Custom Control`. No upload is required.

1. In the form designer for the form that hosts YanaGrid, open the **Events** tab.
2. Under **Form Libraries**, add `Technosoft.Yana.Grid.js` (listed under the `CORE Custom Control` solution's WebResources).
3. Set its load order to run **before** your consumer form script.
4. Save and publish the form.

### Path B — Older umbrella version, or manual install

If your environment's `CORE Custom Control` version predates `v_sdk_bundled`:

1. Obtain `Technosoft.Yana.Grid.js` from the `references/sdk/` folder inside the `yana-pcf-sdk` Claude Code plugin (see `plugin-install.md`).
2. In **make.powerapps.com** → your solution → **+ New** → **Web resource**:
   - **Name**: a name under your publisher prefix (e.g., `app_TechnosoftYanaGrid`).
   - **Display name**: `Technosoft Yana Grid SDK`.
   - **Type**: **Script (JScript)**.
   - Upload the JS file.
3. Save and publish the WebResource.
4. In the form designer, add it as a form library in the **Events** tab, loaded before your consumer form script.

For the full event API and a worked example, see `yanagrid-events.md §Install`.

---

## Step 3 — Bind YanaGrid to a sub-grid or home grid

The most common use of YanaGrid is replacing the default editable grid on a parent record's sub-grid.

### A — Sub-grid on a form

1. Open the form designer for the parent entity (e.g. Quote, Work Order).
2. Select the sub-grid you want to replace.
3. In the right-hand pane, open **Components** → **Get more components**.
4. Find **YanaGrid** (publisher `TECHNOSOFT_DMS_CORE`) and add it.
5. With the sub-grid selected, switch to the **Properties** tab and choose **YanaGrid** under **Controls**.
6. Enable the control for **Web**, **Phone**, and **Tablet** as required.
7. Set the manifest properties (see Step 5).
8. **Save** and **Publish** the form.

### B — Home grid (view-level)

1. In the solution, open the target entity's **Views** node.
2. Select **Public Views** → choose the view → open the view designer.
3. Open **Components** → **Custom controls** → add **YanaGrid**.
4. Enable for **Web**, **Phone**, **Tablet** as required.
5. Set the manifest properties (see Step 5).
6. **Save** and **Publish**.

---

## Step 4 — Configure the bound dataset

YanaGrid binds to a dataset, so no manual column mapping is required. The columns that appear in the grid come from the selected view.

- Verify the view contains the columns you want editable.
- Add or remove columns by editing the underlying view (not the control).
- The view selector and quick-find search bar are rendered when `displayViewSelector` and `displayQuickFind` are enabled on the dataset (default).

---

## Step 5 — Set manifest properties

Set each property in the **Properties** panel on the form designer. All properties are optional except the bound dataset.

| Property | Suggested starter value | Purpose |
|----------|-------------------------|---------|
| `autoSaveRecord` | `false` (start manual; flip to `true` after smoke test) | Save row on blur |
| `footerAggregateColumns` | _empty_ or `"xts_amount:sum"` | Footer totals |
| `calculationFormulas` | _empty_ | In-grid calculations |
| `readOnlyColumns` | _empty_ | Lock specific columns |
| `readOnlyStatus` | _empty_ | Lock rows by statuscode |
| `parentUpdateFormulas` | _empty_ | Roll up to parent record |

> **Grouping** is always available — no property needed. Users group rows from the column header menu. See `yanagrid-api.md` → **Grouping** for details.

For full syntax and behavior of each property, see `yanagrid-api.md` → **Property reference**.

---

## Step 6 — Seed Quick View configuration (optional)

The Grid toolbar's **Quick View** button activates automatically when an `xts_pluginconfiguration` record exists for the bound entity. Skip this step if you do not want a Quick View dialog.

### Create the configuration record

1. Open the **`xts_pluginconfiguration`** table in maker portal or via the model-driven app.
2. **+ New** record.
3. Set the entity-lookup column to the entity that hosts the Grid.
4. Paste the configuration XML into the `xts_configuration` column (multiline text). See the **Configuration shape** section in `yanagrid-api.md`.
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
            <condition attribute="xts_parent_record_lookup" operator="eq" value="CurrentRecordId" />
          </filter>
        </entity>
      </fetch>
    </Query>
  </FamilyTreeConfig>
</Configurations>
```

### Refresh and verify

After saving the configuration record, refresh the host form. The Quick View icon should appear on the Grid toolbar between the View button and the rest of the toolbar.

---

## Step 7 — Verify the install

| # | Verification |
|---|--------------|
| 1 | Open a record whose form hosts the Grid; the grid renders without errors. |
| 2 | Add a new row, edit a cell, save — the row persists in Dataverse. |
| 3 | If `autoSaveRecord=true`, leaving the row commits the change. |
| 4 | If `footerAggregateColumns` is set, the footer row shows the aggregate. |
| 5 | The column header menu offers **Group by this column** (grouping is always available). When a column is grouped, the **Grouped by** chip on the command bar shows **Expand all**, **Collapse all**, and **Remove** controls. |
| 6 | With `footerAggregateColumns` set, group by a column and confirm each group heading shows the same aggregates as the footer, calculated for that group's records only. |
| 7 | If Quick View is configured, the toolbar shows the Quick View icon and clicking it opens the accordion dialog. |
| 8 | If `parentUpdateFormulas` is set, saving a row updates the parent form fields. |

---

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---------|--------------|------------|
| Grid does not appear | Control not enabled for the active form factor (Web/Phone/Tablet) | Re-open form designer → enable for required form factor → publish |
| Quick View icon missing | No `xts_pluginconfiguration` record for the entity, or configuration XML invalid | Seed the configuration record; validate the XML in `xts_configuration` |
| Save error: "Formula must contain an equals sign (=)" | `calculationFormulas` entry missing `=` | Fix the formula syntax — see `yanagrid-api.md` → Errors |
| Aggregate row missing | Listed columns are not numeric | Aggregations require numeric columns; non-numeric entries are silently dropped |
| Parent form fields not updating after row save | Parent form has unsaved changes blocking refresh | Save the parent form first, then re-save the row |

For issues not listed here, see `yanagrid-manual.md` → **Support** for the support contact.

---

## See also

- `yanagrid-api.md` — manifest properties and behavior contracts
- `yanagrid-manual.md` — end-user and implementer how-to
- `yanagrid-releases.md` — version history
- `yanaquickview-install.md` — installing the standalone QuickView control
- `plugin-install.md` — Claude Code plugin for developers

---

> **Bundle metadata** — generated 2026-09-04 from `.public-docs/yanagrid-install.md` for plugin version 1.4.0.