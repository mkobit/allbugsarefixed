<!--
  IMPORTANT: After creating this file, hydrate it into Beads:
  bd mol pour openspec-sync --var change_name=hosting-provider-decision
  Note: Manually add label meta:openspec:hosting-provider-decision to the poured Expand Tasks bead and all child task beads.
  Checkboxes here are a human-readable index; bead status is the source of truth.
-->

## 1. Hosting decision and follow-up epics

- [x] 1.1 Document decision to select Cloudflare Pages over GitHub Pages and CloudFront in OpenSpec change proposal and design.
  Validation: `bun run openspec:validate hosting-provider-decision` passes cleanly.
- [x] 1.2 File follow-up implementation epic `abf-zdv.3.2` for Cloudflare Pages setup and migration.
  Validation: `bd show abf-zdv.3.2` confirms epic is created with description and acceptance criteria.
