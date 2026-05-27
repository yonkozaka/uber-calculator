# Uber Earnings & Expense Calculator

A standalone dark-dashboard web app for estimating rideshare earnings, expenses, taxes, vehicle wear, and true profit. It runs entirely in the browser with plain HTML, CSS, and JavaScript.

## Main Features

- Daily, weekly, and monthly calculation modes
- Editable totals and daily averages for weekly/monthly planning
- Gas, MPG, tolls, additional expenses, and monthly fixed cost tracking
- Self-employment, federal, and state tax estimate settings
- Standard mileage, actual expense, and no-deduction tax modes
- Vehicle wear modeling for depreciation, tires, brakes, and maintenance
- Goal checker for daily profit, hourly profit, and profit per mile
- Scenario comparison for two alternate shifts
- Local shift history saved with `localStorage`
- TXT export for the current report and CSV export for saved history
- Fully local usage after the page loads

## How To Use

1. Open `index.html` in a browser.
2. Choose Daily, Weekly, or Monthly mode.
3. Enter income, hours, trips, miles, gas, and expense details.
4. Adjust tax, vehicle wear, and goal settings as needed.
5. Review the results, recommendation, alerts, summary table, and scenario comparison.
6. Click **Save result** to store a shift in this browser.
7. Use **Export current TXT** or **Export history CSV** to download reports.

## Development and Production Environment

This project has been upgraded with a modern architectural and build system using **Vite**.

### Development Mode
To run the local development server with hot-module reloading:
1. Run `npm run dev` in your project workspace.
2. Open the displayed local server URL (e.g. `http://localhost:5173`) in your browser.

### Production Build
To bundle the modular ES6 assets into a single compiled file:
1. Run `npm run build` inside the project root.
2. The bundled production assets are compiled into the `dist/index.html` bundle.

### Offline and Local-First Usage
Because of standard browser security limits on native ES6 modules over the `file:///` protocol, the source-level `index.html` should be accessed via `npm run dev`.

However, the compiled production build in the `dist` folder is fully self-contained and offline-first:
1. Open the `dist` directory.
2. Double-click the compiled `dist/index.html` file to run it locally over the local filesystem protocol:
   ```text
   file:///.../dist/index.html
   ```
   All calculations, saves, presets, and chatbot answers keep functioning completely offline.

## Project Structure

```text
.
├── index.html        # Main dashboard entry structure
├── variables.css     # CSS variables and SaaS themes
├── components.css    # UI component stylings
├── styles.css        # Dashboard grids and mobile overrides
├── utils.js          # Math calculations, AI Advisor, and reporting
├── ui.js             # DOM selectors and cockpit rendering
├── app.js            # Unified State Store and event listeners
├── package.json      # npm scripts and dependency definitions
├── vite.config.js    # Vite compilation single-file configurations
├── dist/             # Compiled production directory
│   └── index.html    # Bundled single-file offline utility
└── README.md         # Project documentation
```

## Limitations And Disclaimer

This calculator provides planning estimates only. It is not financial, tax, legal, or accounting advice. Actual rideshare income, deductions, taxes, insurance, maintenance, depreciation, and fuel costs can vary by driver, location, vehicle, recordkeeping, and filing situation.

Saved data uses the browser's local storage on the current device. Clearing site data or using a different browser can remove or hide saved history.

## Future Improvements

- Add printable report formatting
- Add custom named vehicles and vehicle profiles
- Add import support for previously exported CSV history
- Add charts for weekly/monthly trends
- Add optional dark/light theme switching
- Add more detailed tax settings for different locations and filing situations
