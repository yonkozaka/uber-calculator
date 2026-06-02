## 2024-05-24 - Contextual confirmations and screen-reader labels for deletion actions
**Learning:** Icon-only buttons or repetitive text buttons (like a list of "Delete" buttons) without proper context make it difficult for screen reader users to identify which item they're taking action on. Also, instant destructive actions without confirmation can lead to data loss and poor user experience, particularly in mobile or touch environments where accidental taps are common.
**Action:** Added a `confirm` dialog that mentions the specific shift's date before deleting a history entry. Also added an `aria-label` to the delete button in the UI layer that dynamically includes the shift's date to provide context for screen readers.

## 2025-05-25 - Auto-selecting numeric inputs on focus
**Learning:** In data-heavy calculator interfaces, users frequently need to completely replace existing numeric values. Forcing them to manually delete existing digits or highlight them creates friction. Auto-selecting text on focus is a critical UX pattern that makes data entry significantly smoother.
**Action:** Attached a global focus event listener to all `input[type="number"]` elements that calls `this.select()`, instantly selecting the entire value when the user tabs into or clicks the field.
## 2025-05-25 - Prevent accidental data loss on global reset actions
**Learning:** Destructive actions that clear substantial amounts of user input, like a "Reset All" button in a complex form, can lead to significant frustration if clicked accidentally. This is especially true on mobile or smaller screens where mis-taps are more frequent. Providing a confirmation step serves as a critical safety net for these global actions.
**Action:** Added a native `confirm()` prompt inside the `resetForm` handler to ensure intentionality before wiping all data and localStorage state.

## 2026-06-02 - Tab panel accessible naming
**Learning:** While `aria-controls` explicitly links a tab button to a tab panel, it only provides a programmatic relationship (telling screen readers "this button controls this panel"). It does NOT automatically give the panel an accessible name. Without a name, screen reader users entering the panel may just hear "tab panel" without knowing which panel they are in.
**Action:** Always complement `aria-controls` on the tab with `aria-labelledby` on the `role="tabpanel"` element, pointing back to the tab's ID. This ensures the panel announces its purpose (e.g., "Active Shift tab panel") when focused.
