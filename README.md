# DriveWorth — Uber Profit Command Center

DriveWorth is a local-first Vite application that helps a rideshare driver answer a practical question: **is this shift worth working after the road takes its share?**

It separates cash operating costs, a configurable tax reserve, and non-cash vehicle depreciation so the result is understandable instead of being one unexplained number.

## Features

- Live shift decision with true net profit, net per hour, net per mile, and break-even gross
- Progressive form: essential inputs first, detailed costs in Advanced settings
- Boston, Raleigh, and Custom starting profiles; every value remains editable
- Bad-day, realistic, and optimistic scenarios with explicit assumptions
- Single-offer evaluator that includes unpaid pickup time and pickup mileage
- Multi-shift weekly planner and 4.33-week monthly projection
- CSS-based cost chart with no charting dependency
- Local saved-result history and CSV export
- Dark and light themes
- Responsive mobile decision bar
- Text errors, native labels, focus styles, reduced-motion support, and semantic fieldsets
- Single-file production build for portable/offline use

## Calculation model

The application uses the values entered by the driver. It does not fetch Uber, tax-account, or vehicle data.

### Fuel

```text
fuel cost = (shift miles ÷ MPG) × gas price
```

### Allocated fixed costs

```text
daily insurance allocation = monthly insurance ÷ Uber workdays per month
daily phone allocation = monthly phone share ÷ Uber workdays per month
```

### Cash profit before tax

```text
cash costs = fuel
           + maintenance reserve
           + insurance allocation
           + phone allocation
           + other monthly allocation
           + tolls + parking + food + other shift costs

cash profit before tax = gross earnings − cash costs
```

### Tax planning estimate

For the standard-mileage mode, the modeled deduction is the 2026 IRS business mileage rate plus modeled non-vehicle business costs. The self-employment reserve is applied to 92.35% of modeled taxable profit. The user-supplied additional income-tax percentage is a planning reserve, not a bracket calculation.

```text
taxable profit = max(0, gross − modeled deductions)
self-employment base = taxable profit × 92.35%
self-employment reserve = self-employment base × selected SE rate
income-tax reserve = taxable profit × selected additional rate
```

### True profit

```text
depreciation = shift miles × depreciation estimate per mile
true profit = cash profit before tax − tax reserve − depreciation
```

The break-even result is solved against this same full calculation, including the fact that the tax reserve changes with gross profit.

## Verified reference values

- The default 2026 IRS business mileage rate is **$0.725 per mile**: [IRS 2026 mileage-rate announcement](https://www.irs.gov/newsroom/irs-sets-2026-business-standard-mileage-rate-at-725-cents-per-mile-up-25-cents).
- The self-employment model uses the IRS general rule that **92.35% of net self-employment earnings** is subject to self-employment tax: [IRS Topic 554](https://www.irs.gov/taxtopics/tc554).
- Boston starts with the AAA Massachusetts regular-gas average published July 11, 2026 (**$3.903**, rounded to $3.90): [AAA Massachusetts](https://gasprices.aaa.com/?state=MA).
- Raleigh starts with the AAA North Carolina regular-gas average published July 11, 2026 (**$3.604**, rounded to $3.60): [AAA North Carolina](https://gasprices.aaa.com/?state=NC).

Gas prices change daily. Profile values are starting points, not live prices. Insurance, maintenance, depreciation, MPG, and the additional income-tax reserve are editable planning assumptions and should be replaced with the driver's own records.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Test and build

```bash
npm test
npm run build
npm run preview
```

Run the full verification gate with:

```bash
npm run check
```

The production build is written to `dist/index.html`. It is bundled as one file so it can be moved easily and opened locally.

## Project structure

```text
.
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── calculation-engine.js   # Validation and all financial formulas
│   ├── main.js                 # State, events, and DOM rendering
│   ├── storage.js              # Safe local storage, CSV, and downloads
│   └── styles.css              # Themes, dashboard, and responsive UI
├── tests/
│   ├── calculation-engine.test.js
│   └── storage.test.js
├── scripts/                    # Existing repository helper scripts
└── docs/
    ├── AUDIT.md
    └── screenshots/            # Before-state reference captures
```

## Screenshots

The uploaded before-state screenshots are retained in `docs/screenshots/` for design comparison. Add current desktop and mobile captures there after final browser QA or before publishing the repository.

## Privacy and storage

Inputs and saved shift results are stored only in the current browser's `localStorage`. Clearing browser site data removes them. CSV export is available for a portable backup.

## Important disclaimer

DriveWorth provides estimates for planning only. It is not tax, legal, accounting, or financial advice. Actual income, deductions, taxes, insurance, maintenance, depreciation, and fuel cost vary by driver and circumstance. Keep records and consult a qualified professional for tax treatment.

## Roadmap

- Import a previously exported history CSV
- Named vehicle profiles with service intervals
- Optional PWA installation and encrypted backup
- User-entered surge and event calendar notes
- Compare multiple vehicles without changing the active profile
- Optional mileage log integration through a user-authorized provider
