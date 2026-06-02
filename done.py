import json

summary = """## ⚡ Bolt: Cache Object.entries for Period Average maps

### 💡 What
Cached `Object.entries(periodAverageByTotal)` and `Object.entries(periodTotalByAverage)` as top-level constants `periodAverageByTotalEntries` and `periodTotalByAverageEntries`. The `syncPeriodAmounts` function now iterates over these cached arrays instead of allocating new arrays via `Object.entries` on every call.

### 🎯 Why
In period tracking modes like weekly/monthly, `syncPeriodAmounts` is called during every debounced input event to propagate values between total fields and average fields. Repeatedly allocating `Object.entries` for static configuration objects generates unnecessary garbage, causing GC pauses and slowing down typing responsiveness.

### 📊 Impact
- Baseline: 6478.46 ms (5M iterations)
- Optimized: 4424.66 ms (5M iterations)
- Improvement: ~31.7% faster execution in this hot path.

### 🔬 Measurement
Created a targeted Node.js script (`test_perf.js` and `test_perf_opt.js`) to isolate the `syncPeriodAmounts` calculation loop, simulating repeated UI updates that happen as a user types and edits inputs in non-daily modes. Measured using `process.hrtime.bigint()` across 5,000,000 iterations to get a clear margin of improvement.
"""

payload = {"summary": summary}
with open("pr_payload.json", "w") as f:
    json.dump(payload, f)
