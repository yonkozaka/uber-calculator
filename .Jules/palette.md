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

## 2026-06-02 - Visible Keyboard Focus Indicators
**Learning:** Setting `outline: 2px solid transparent;` for `focus-visible` states effectively hides the focus ring from keyboard users, creating a significant accessibility barrier. Keyboard navigation relies on clear, visible focus indicators to show which element is currently active.
**Action:** Replaced transparent outlines with a visible color (`var(--primary)`) for all interactive elements like buttons, tip dots, and advisor chips, and ensured custom UI elements like tab buttons also have explicit, visible `focus-visible` styles.
## 2026-06-02 - Premium UI Form Elements
**Learning:** Solid borders and flat white/grey backgrounds on input fields can make forms feel harsh and dated, particularly in dark mode interfaces. Updating form elements to use translucent backgrounds (e.g., `rgba(255, 255, 255, 0.03)`), faint borders, and sharp box-shadows on focus dramatically increases the perceived quality of the application, bringing it closer to modern SaaS design systems.
**Action:** Always favor subtle `rgba` border colors, soft glass-like backgrounds, and `box-shadow` inset details over rigid solid colors when designing premium forms.
## 2026-06-02 - Logo and Branding Update
**Learning:** Adding a real `<img>` element instead of a CSS `background-image` for logos improves both semantics and accessibility, allowing screen readers to process `alt` text. Removing deprecated references avoids 404 resource errors.
**Action:** When updating logos, use `<img src="..." alt="...">` inside container elements rather than CSS backgrounds, and ensure old image files are correctly deleted and decoupled from CSS.

## 2025-06-02 - WAI-ARIA tabpanel linking and focusability
**Learning:** Screen readers and keyboard users require explicit links between a tab and its content panel. Additionally, tab panels themselves should be focusable so users can easily read their content via keyboard navigation after activating a tab.
**Action:** Added `id` attributes to `role="tab"` buttons, and added `aria-labelledby` and `tabindex="0"` to the corresponding `role="tabpanel"` container elements to link them together and make panels keyboard focusable.

## 2026-06-03 - Button Action Feedback
**Learning:** Actions that do not navigate to a new page or show a prominent modal (e.g., saving a shift, exporting data) often leave users wondering if the action succeeded. A quick, momentary change in the button's text or style provides immediate, satisfying confirmation.
**Action:** Always provide brief, momentary visual feedback on action buttons when a background process completes successfully, rather than relying solely on separate toast notifications or silent state changes.

## 2024-06-04 - Enter key submission for form-less inputs
**Learning:** In applications where inputs aren't wrapped in native `<form>` tags, pressing the `Enter` key often does nothing. For data-entry intensive interfaces like calculators, this breaks user expectations and forces unnecessary mouse interactions or complex tabbing to reach the submit button.
**Action:** Always manually implement `Enter` key handling on inputs (e.g., via `keydown` listeners) when native `<form>` submission isn't applicable, routing the action to the primary action button to ensure a smooth, keyboard-friendly data entry flow.

## 2026-06-05 - Character counts for bounded inputs
**Learning:** For text inputs with a hard `maxlength` (like the AI advisor input), users can unexpectedly hit the limit while typing, which feels abrupt and confusing. Adding a visual character count helps set expectations and gives users control over their input length.
**Action:** Added a `0 / 200` character count indicator below the AI advisor input that updates on every keystroke. Linked it to the input using `aria-describedby` so screen readers also have context for the limit.

## 2026-06-12 - Skip to content links
**Learning:** For keyboard and screen reader users navigating complex, data-heavy interfaces, tabbing through navigation and headers before reaching the primary inputs is tedious. A "Skip to content" link provides a massive usability boost by allowing them to jump directly to the main interaction area.
**Action:** Added a visually hidden `.skip-link` right after the body tag that becomes visible on focus. It anchors to the main calculator grid, which was given `tabindex="-1"` so it can programmatically receive focus without interrupting normal tab flow.
