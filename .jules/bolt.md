## 2024-06-12 - Optimize Array Filtering
**Learning:** Instantiating an array with multiple function calls only to call `.filter(Boolean)` on it is inefficient, especially inside a heavily used function. The array and its falsy elements are allocated and then immediately discarded.
**Action:** Replace `.filter(Boolean)` patterns with explicit `if` statements and `.push()` to a new array when performance is critical. Use a temporary variable to capture truthy results before pushing.
## 2024-05-18 - Caching Intl Formatters
**Learning:** Instantiating `Intl` objects (like `Intl.DateTimeFormat`) inside frequently called functions or loops in JavaScript can cause a micro-performance overhead.
**Action:** Cache these objects as module-level variables or use existing cached instances rather than calling `toLocaleString` directly.
## 2024-06-25 - Avoid Spread Operator on Large Arrays
**Learning:** Using the spread operator (`...array`) to pass large arrays as arguments to functions like `replaceChildren()` can cause "Maximum call stack size exceeded" errors and is inefficient.
**Action:** Use a `DocumentFragment` to batch DOM insertions when rendering lists, especially those of unbound size like history entries.
