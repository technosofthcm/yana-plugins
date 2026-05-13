# YanaQuickView — API Reference

YanaQuickView is a standalone virtual PCF control that renders a configurable accordion of read-only related-entity grids. Configuration is XML-driven — adding a new entity layout does not require code deployment.

The same component is embedded inside the YanaGrid toolbar (see `yanagrid-api.md` → Quick View properties). This document covers the **standalone** control only.

This document is the **public API surface** — manifest properties, behavior contracts, configuration shape, error conditions. It does not describe internal implementation.

---

## At a glance

| Property | Type | Binding | Required | Default | Summary |
|----------|------|---------|----------|---------|---------|
| `selectedQuery` | SingleLine.Text | bound | no | — | Bound output — name of the currently selected FetchXML view. |
| `quickViewConfigName` | SingleLine.Text | input | no | `""` | Name of the configuration block to load from `xts_pluginconfiguration`. |

The control has only two manifest properties. The bulk of behavior is driven by the configuration XML record.

---

## Property reference

### `quickViewConfigName`

Names the configuration block inside `xts_pluginconfiguration` that the control reads. The control queries `xts_pluginconfiguration` by entity name + this property value.

- **Format**: `SingleLine.Text` (input). Expected to match an XML wrapper tag inside the configuration record (commonly `FamilyTreeConfig` or `YanaGridConfig`).
- **Default**: `""` — when empty, the control falls back to the entity's default configuration block (first `<*Config>` element under `<Configurations>`).
- **Example**: `"FamilyTreeConfig"`

### `selectedQuery`

Output property — bound to a column on the host entity to receive the name of the currently selected FetchXML query. Useful when embedding the control on a form where the host needs to react to query changes.

- **Format**: `SingleLine.Text` (bound). The control writes; the host reads.
- **Behavior**: Updated when the user selects a different accordion section. Empty when no section is active.

---

## Configuration shape

Configuration is stored in the Dataverse table `xts_pluginconfiguration`, column `xts_configuration`, matched by entity name.

```xml
<Configurations>
  <FamilyTreeConfig>
    <Query>
      <fetch>
        <entity name="xts_vehicleinformation">
          <attribute name="xts_chassisnumber" />
          <attribute name="xts_productsegment1id" minwidth="170px" />
          <link-entity name="xts_customer" from="xts_customerid" to="xts_customerid" alias="cus">
            <attribute name="xts_name" />
            <filter>
              <condition attribute="xts_recordid" operator="eq" value="CurrentRecordId" />
            </filter>
          </link-entity>
        </entity>
      </fetch>
    </Query>
    <Query>
      <!-- second accordion section -->
    </Query>
  </FamilyTreeConfig>
</Configurations>
```

### Element reference

| Element / Attribute | Purpose |
|---------------------|---------|
| `<Configurations>` | Root wrapper. |
| `<FamilyTreeConfig>` / `<YanaGridConfig>` / custom | Configuration block. The block name must match the `quickViewConfigName` property. |
| `<Query>` | One accordion section per `<Query>` element. |
| `<fetch>` | Standard Dataverse FetchXML query. |
| `<attribute name="...">` | Column to display. Dataverse display name is used as the header. |
| `minwidth="170px"` | Optional minimum column width hint on `<attribute>`. |

### Placeholders

Inside `<condition value="...">`, two literal placeholders are substituted at runtime:

| Placeholder | Substitution |
|-------------|--------------|
| `CurrentRecordId` | The current host record's id. |
| `CurrentUserId` | The current user's id. |

Placeholders enable a single `xts_pluginconfiguration` record to serve every instance of the control across all records.

---

## Behavior contracts

### Load lifecycle

1. Control initializes with the host entity name and `quickViewConfigName`.
2. Control queries `xts_pluginconfiguration` for the matching record.
3. Each `<Query>` is resolved into a FetchXML request — placeholders substituted at this point.
4. All sections fetch data **in parallel**.
5. The first section is rendered expanded; the rest are collapsed.
6. Sections render independently — a failed section does not block siblings.

### Per-section states

| State | Trigger | UI |
|-------|---------|----|
| Loading | Section actively fetching | Shimmer placeholder |
| Empty | Fetch returned zero rows | "No data available" message |
| Error | Fetch failed | Error message + Retry button (retry re-runs only that section) |
| Loaded | Fetch returned rows | Fluent UI `DetailsList` with column headers and rows |

### Display rules

- Grids are **read-only** — no inline edit, no sort, no filter.
- Currency, date, and lookup values are presented using their Dataverse-formatted strings.
- Column headers come from the Dataverse attribute display name unless overridden.
- `minwidth` attribute on `<attribute>` sets minimum column width.

### Service isolation

Each control instance has its own service instance (`QuickViewService` per `controlId`). Multiple QuickView controls on the same form do not share state.

---

## Configuration recipes

### Single entity, single section

```xml
<Configurations>
  <FamilyTreeConfig>
    <Query>
      <fetch>
        <entity name="xts_customer">
          <attribute name="xts_name" />
          <attribute name="xts_phone" />
          <filter>
            <condition attribute="xts_recordid" operator="eq" value="CurrentRecordId" />
          </filter>
        </entity>
      </fetch>
    </Query>
  </FamilyTreeConfig>
</Configurations>
```

### Multi-section family-tree view

```xml
<Configurations>
  <FamilyTreeConfig>
    <Query><!-- Section 1: parent vehicle --></Query>
    <Query><!-- Section 2: warranty claims --></Query>
    <Query><!-- Section 3: service history --></Query>
  </FamilyTreeConfig>
</Configurations>
```

### Filter by current user

```xml
<condition attribute="xts_assignedto" operator="eq" value="CurrentUserId" />
```

---

## Compatibility

| Item | Supported |
|------|-----------|
| Power Apps model-driven apps | yes |
| Power Apps canvas apps | no |
| Dataverse online | yes |
| Dataverse on-premise | not tested |
| Embedding contexts | form section, custom form, ribbon button (via custom page) |
| Browsers | Chromium-based (Edge, Chrome), Firefox latest |
| Framework | React 16.8.6, Fluent UI 8.29.0 |
| External services | none |
| Required platform features | `Utility`, `WebAPI` |

---

## Limitations

- Read-only display. No inline edit, no sort, no filter.
- Configuration changes require editing the `xts_pluginconfiguration` record. Reload required for changes to take effect.
- Placeholders are limited to `CurrentRecordId` and `CurrentUserId`. No formula evaluation in `<condition value>`.
- Custom column header overrides not supported in v1.0.0 — headers are taken from Dataverse metadata.

---

## Errors

| Condition | Surface | Resolution |
|-----------|---------|------------|
| `xts_pluginconfiguration` record not found | Empty accordion + console warning | Seed configuration record for the entity |
| `quickViewConfigName` not present in record | Falls back to first config block | Set `quickViewConfigName` to a valid block name |
| FetchXML query invalid | Section shows error state + Retry | Fix FetchXML; common cause: invalid `link-entity` aliases |
| Placeholder substitution failed | Section shows error state | Ensure host context provides a valid record id |
| Configuration XML malformed | All sections empty | Validate XML in the `xts_configuration` column |

---

## Event surface

YanaQuickView is read-only and config-driven; it exposes no JavaScript event API. Integration with the host form is via the `selectedQuery` output binding only. For event-driven integration with an editable grid, see `yanagrid-events.md`.

---

## Versioning

| Version | Status | Namespace |
|---------|--------|-----------|
| 1.0.0 | Initial release — ships in `TechnosoftDmsCoreComponents` umbrella solution v1.4.0 | `Technosoft.DMS.XRM.CustomControl.QuickView` |

See `yanaquickview-releases.md` for change history.

---

## See also

- `yanaquickview-manual.md` — end-user + implementer how-to
- `yanaquickview-install.md` — install + form embedding
- `yanaquickview-releases.md` — version history
- `yanagrid-api.md` — Quick View embedded in Grid toolbar (Quick View properties section)

---

> **Bundle metadata** — generated 2026-05-13 from `.public-docs/yanaquickview-api.md` for plugin version 2.0.0.