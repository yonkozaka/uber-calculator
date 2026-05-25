## 2024-05-25 - Instantiating Intl.NumberFormat and object allocation in string replace
**Learning:** Calling `new Intl.NumberFormat` on every formatting operation is a significant performance bottleneck in JavaScript. Furthermore, creating a new object literal inside a `String.prototype.replace` replacer function causes unnecessary object allocations on every character match.
**Action:** Extract `Intl.NumberFormat` instances and static maps (like those used for HTML escaping) into module-level or closure variables to cache them for reuse, especially in frequently called utility functions like `formatMoney` or `escapeHtml`.

## 2024-05-25 - Extracting Intl formatters to replace toLocaleString
**Learning:** `Date.prototype.toLocaleString()` and `Number.prototype.toLocaleString()` implicitly create and destroy `Intl.DateTimeFormat` and `Intl.NumberFormat` instances under the hood. Using them inside loops (like mapping over a large history array to render rows or export CSVs) causes substantial garbage collection pressure and slowness.
**Action:** Replace `.toLocaleString()` with explicitly cached `Intl` formatter instances at the module scope and expose a helper function (like `formatDateTime`) to reuse them.
