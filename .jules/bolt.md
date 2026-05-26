## 2025-02-18 - Minimize Redundant DOM Reads in Calculations
**Learning:** In vanilla JavaScript applications handling forms, gathering form values via `.value` accesses (DOM reads) inside a deeply nested calculation loop can cause severe hidden performance issues. The `app.js` file was previously calling `getMainInputObject()` multiple times within a single debounced calculation cycle to calculate scenario comparisons, resulting in 58 redundant DOM reads per keystroke.
**Action:** Always fetch the current DOM state once at the start of the calculation cycle and pass it down the calculation tree as an argument, memoizing the application state rather than repeatedly polling the DOM.

## 2025-02-18 - Minimize Redundant DOM Reads in Calculations
**Learning:** In vanilla JavaScript applications handling forms, gathering form values via `.value` accesses (DOM reads) inside a deeply nested calculation loop can cause severe hidden performance issues. The `app.js` file was previously calling `getMainInputObject()` multiple times within a single debounced calculation cycle to calculate scenario comparisons, resulting in 58 redundant DOM reads per keystroke.
**Action:** Always fetch the current DOM state once at the start of the calculation cycle and pass it down the calculation tree as an argument, memoizing the application state rather than repeatedly polling the DOM.
