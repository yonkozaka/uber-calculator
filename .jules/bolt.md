## 2024-06-12 - Optimize Array Filtering
**Learning:** Instantiating an array with multiple function calls only to call `.filter(Boolean)` on it is inefficient, especially inside a heavily used function. The array and its falsy elements are allocated and then immediately discarded.
**Action:** Replace `.filter(Boolean)` patterns with explicit `if` statements and `.push()` to a new array when performance is critical. Use a temporary variable to capture truthy results before pushing.
## 2024-05-18 - Caching Intl Formatters
**Learning:** Instantiating `Intl` objects (like `Intl.DateTimeFormat`) inside frequently called functions or loops in JavaScript can cause a micro-performance overhead.
**Action:** Cache these objects as module-level variables or use existing cached instances rather than calling `toLocaleString` directly.
## 2024-06-25 - Avoid Spread Operator on Large Arrays
**Learning:** Using the spread operator (`...array`) to pass large arrays as arguments to functions like `replaceChildren()` can cause "Maximum call stack size exceeded" errors and is inefficient.
**Action:** Use a `DocumentFragment` to batch DOM insertions when rendering lists, especially those of unbound size like history entries.
## 2024-07-28 - Update test mock DOM for DocumentFragment
**Learning:** When optimizing DOM rendering with `DocumentFragment` to avoid call stack limits (e.g., when spreading arrays into `replaceChildren`), existing mock DOM implementations in tests must be updated to support the new API (e.g., adding `createDocumentFragment` and handling the fragment argument in `replaceChildren`).
**Action:** Always verify and update custom test DOM mocks when introducing modern or different DOM APIs in application code to prevent test suite failures.
## 2024-05-18 - Minimizing redundant DOM reads
**Learning:** Repeatedly polling `.value` from the DOM during frequent calculation cycles (e.g., debounced keystrokes) causes unnecessary overhead.
**Action:** Minimize redundant DOM reads by fetching the DOM state once at the start and accessing the cached state, rather than repeatedly polling the DOM.
## 2024-07-31 - Avoid Micro-Optimizing `replaceChildren`
**Learning:** For a fixed, small array, the native `replaceChildren(...nodes)` API is already highly optimized by browser engines (in C++) to handle multiple elements without triggering multiple reflows. Implementing a `DocumentFragment` manually in JavaScript for this scenario introduces unnecessary JS execution overhead (`createDocumentFragment` and multiple `appendChild` calls), making it a faux-optimization that is likely slower or completely negligible, and degrades code readability.
**Action:** Do not replace `replaceChildren(...nodes)` with a `DocumentFragment` loop unless the array size is extremely large or unbounded (like rendering history entries).
## 2024-06-02 - Array Identity Assertion Failure in Tests
**Learning:** `assert.deepStrictEqual` can fail when asserting two empty arrays created in different Node `vm` sandboxes due to prototype differences (`Array` vs `sandbox.window.Array`).
**Action:** When testing for empty arrays returned by functions executing inside a `vm` context, assert against `.length === 0` rather than using `deepStrictEqual` with `[]`.

## 2024-06-02 - Extract Regexes from Loops
**Learning:** Compiling regular expressions repeatedly inside tight loops like `toCsv` causes unnecessary overhead and slows down data generation operations, particularly over large arrays.
**Action:** Always hoist regexes outside loop bodies to ensure they are compiled just once.
## 2024-06-02 - Fast local storage arrays
**Learning:** Monolithic storage arrays serialize slowly in LocalStorage and can block the main thread. Splitting elements into individual KV pairs using `id` based keys avoids serializing/deserializing the full set on every write, producing huge speedups (from 1020ms down to 64ms for 100 appends onto an array of 2000 elements).
**Action:** When managing growing arrays of objects in LocalStorage, store objects as individual keys (e.g., `item_ID`) and keep a master array containing only the IDs.
## 2024-08-01 - Avoid micro-optimizing small fixed arrays
**Learning:** Re-writing clear `.filter(Boolean)` usage on small, fixed-size arrays into complex `if (assign)` push statements is an unreadable micro-optimization that produces zero measurable benefit.
**Action:** Do not sacrifice readability to optimize away small, short-lived array allocations. Focus loop-fusion and array optimization techniques on large or unbounded data structures where intermediate allocations cause meaningful overhead.

## 2024-08-16 - Accurate Optimization Terminology
**Learning:** Re-writing `Array.prototype.reduce` to a standard `for` loop avoids the overhead of executing a callback function on every iteration. If the original reduce logic mutated a single accumulator object, the optimization avoids 'callback execution overhead', not 'object creation overhead'.
**Action:** Use accurate terminology when documenting performance gains. If no new objects were created per iteration, attribute the speedup to avoiding callback overhead.
## 2024-10-27 - Optimizing Array Map and Spread for Large Datasets
**Learning:** Using `...array.map()` on large datasets creates an intermediate mapped array that is then spread into a new array. This not only incurs memory and garbage collection overhead but can also trigger "Maximum call stack size exceeded" errors if the array is large enough, as spread elements are passed as individual arguments.
**Action:** When transforming large arrays (e.g., generating rows for CSV exports), use a pre-allocated array (`new Array(size)`) and an explicit `for` loop to build the result directly.

## 2024-10-27 - Fast CSV Generation Strategy
**Learning:** For 2D array stringification (like CSV generation), chaining `.map().join()` creates intermediate arrays per row. However, manual string concatenation (`str += ...`) inside the inner loop is actually much slower than V8's array joining.
**Action:** The fastest and most memory-efficient approach is to use nested `for` loops with pre-allocated inner and outer arrays, assigning values via index, and then calling `.join()` on them. Avoid chained `.map()` for large datasets, and avoid manual `+=` string concatenation inside tight inner loops.
## 2025-02-18 - Avoid array spreads for replaceChildren
**Learning:** Reverting `DocumentFragment` to array mapping and spreading (`replaceChildren(...nodes)`) is a de-optimization that introduces a significant risk of encountering `RangeError: Maximum call stack size exceeded` if called with a large dataset, and uses more memory by creating intermediate arrays.
**Action:** Always use a `DocumentFragment` to safely append collections of DOM elements. Avoid spreading arrays into function arguments like `replaceChildren`, and never replace `DocumentFragment` with spread syntax in the name of micro-optimization.

## 2025-02-18 - Extract inline functions to avoid closure allocation
**Learning:** Inline functions, like the `reviver` callback inside `JSON.parse()`, create a new closure and allocate a new function object every time the parent function is invoked. For utility functions called frequently, this causes unnecessary garbage collection pressure and allocation overhead.
**Action:** Extract inline functions (such as a `reviver` callback in `JSON.parse`) into constants outside of frequently called parent functions to prevent the JavaScript engine from allocating a new closure/function object on every call.

## 2024-05-30 - [Performance - Optimize DOM Rendering Loops]
**Learning:** Avoid using array `.forEach()` loops and spread operators when building DOM structures in this codebase, because it allocates new functions and intermediate arrays which slow down performance unnecessarily.
**Action:** Use standard `for` loops to iterate over data, manually create DOM elements inside the loop, and append them directly to a `DocumentFragment` before updating the DOM with `replaceChildren()`. Also ensure the custom mock DOM in tests accounts for `DocumentFragment` insertion when patching standard methods.
## 2025-02-18 - Input event state sync vs debounce
**Learning:** Re-writing debounced batch state updates into direct `StateStore.updateInputs` sync on every `input` keystroke is not a measurable performance win. Instead, it introduces performance regressions (un-debouncing state updates) and bugs (falling out of sync with programmatic value updates).
**Action:** Do not remove explicit DOM sync mechanisms (`updateStateFromDOM`) that run securely inside a debounced update cycle. Wait for the cycle to complete before polling to guarantee state accuracy.
