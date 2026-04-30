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

## Open Locally

No install step is required.

Open the project folder and double-click:

```text
index.html
```

The app is designed to keep working when opened directly as a local file, such as:

```text
file:///.../index.html
```

## Project Structure

```text
.
├── index.html    # HTML structure and page content
├── styles.css    # Dashboard layout, responsive styling, and UI states
├── app.js        # Calculator logic, localStorage, exports, history, and events
└── README.md     # Project documentation
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
