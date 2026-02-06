# Specification

## Summary
**Goal:** Make Stripe live/test status and overall site operational status unmistakably clear in the Admin Stripe Config tab, with auto-refreshing state and a visual globe indicator.

**Planned changes:**
- Add an always-visible “Stripe Mode Status” indicator next to the existing Stripe test/live control, showing a green LED-style dot + “Live payments active” label for Live, and a red dot + “Test mode — sandbox only” label for Test.
- Add a “Site Operational Status” section within the Stripe Config tab that displays exactly one of three plain-English states: Operational/Accepting funds, Test mode, or Standby (based on Stripe verification status + Stripe mode).
- Add a globe status icon component in the Site Operational Status section: colored/glowing and continuously spinning when Operational/Accepting funds; gray/unlit and static when Test mode or Standby.
- Ensure the Stripe verification status driving these indicators auto-refreshes periodically while the Stripe Config tab is open, updating the UI without a full page reload.

**User-visible outcome:** Admins can instantly tell whether Stripe is in Live or Test mode and whether the site is operational/accepting funds, test-only, or on standby, with a clear animated globe indicator that stays up to date while the page is open.
