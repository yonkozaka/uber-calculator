## 2024-05-24 - Contextual confirmations and screen-reader labels for deletion actions
**Learning:** Icon-only buttons or repetitive text buttons (like a list of "Delete" buttons) without proper context make it difficult for screen reader users to identify which item they're taking action on. Also, instant destructive actions without confirmation can lead to data loss and poor user experience, particularly in mobile or touch environments where accidental taps are common.
**Action:** Added a `confirm` dialog that mentions the specific shift's date before deleting a history entry. Also added an `aria-label` to the delete button in the UI layer that dynamically includes the shift's date to provide context for screen readers.

## 2025-05-25 - Auto-selecting numeric inputs on focus
**Learning:** In data-heavy calculator interfaces, users frequently need to completely replace existing numeric values. Forcing them to manually delete existing digits or highlight them creates friction. Auto-selecting text on focus is a critical UX pattern that makes data entry significantly smoother.
**Action:** Attached a global focus event listener to all `input[type="number"]` elements that calls `this.select()`, instantly selecting the entire value when the user tabs into or clicks the field.
## 2025-05-25 - Prevent accidental data loss on global reset actions
**Learning:** Destructive actions that clear substantial amounts of user input, like a "Reset All" button in a complex form, can lead to significant frustration if clicked accidentally. This is especially true on mobile or smaller screens where mis-taps are more frequent. Providing a confirmation step serves as a critical safety net for these global actions.
**Action:** Added a native `confirm()` prompt inside the `resetForm` handler to ensure intentionality before wiping all data and localStorage state.

## 2025-05-28 - ARIA live regions for dynamically injected alerts
**Learning:** In single-page applications where validation messages, alerts, and status indicators (like "Live calculation" or "Shift saved") are dynamically injected into the DOM without a page reload, screen readers will completely ignore these critical updates unless they are wrapped in an ARIA live region. Users relying on assistive technology are left unaware of successful actions or critical errors.
**Action:** Added `role="alert" aria-live="assertive" aria-atomic="true"` to dynamic error/warning containers, and `role="status" aria-live="polite" aria-atomic="true"` to non-intrusive status indicators, ensuring screen readers announce these DOM updates immediately.
## 2024-05-24 - Missing Disabled States on UI Action Buttons
**Learning:** The application's UI components previously completely lacked `disabled` styles for action buttons. Since `renderHistory` dynamically displays shift entries, the absence of a visually disabled "Clear history" or "Export history" button when history is empty caused poor user feedback. Adding visual and functional disabled states explicitly improves clear interactive states.
**Action:** When creating new action buttons or bulk actions that depend on data existence, explicitly add `.disabled` state logic in the UI render layer and corresponding `opacity: 0.5; cursor: not-allowed;` CSS overrides to ensure clear feedback.

## 2025-05-30 - WAI-ARIA tab keyboard navigation
**Learning:** Custom tab interfaces often lack proper keyboard navigation out of the box. Users relying on keyboards need to navigate between tabs using arrow keys, rather than tabbing through every single unselected tab option.
**Action:** Implemented the W3C automatic activation pattern for tabs. Added roving `tabindex` to ensure only the active tab is in the focus order (`0`), while setting inactive tabs to `-1`. Added a `keydown` listener handling `ArrowRight`, `ArrowLeft`, `Home`, and `End` keys to programmatically switch active tabs and focus them.
## 2024-06-01 - Add confirmation dialog to destructive actions
**Learning:** Destructive actions like 'Reset All' can lead to accidental data loss and frustration if they do not require user confirmation.
**Action:** Always wrap destructive form reset or clear functions with a confirmation dialog.
