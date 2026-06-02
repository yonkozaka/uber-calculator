const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

// 1. Setup global mocks (minimal needed for utils.js)
const sandbox = {
    window: {
        CalculatorUtils: {},
    },
    Math: Math,
    Date: Date,
    Number: Number,
    String: String,
    Array: Array,
    Object: Object,
    JSON: JSON,
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    Intl: Intl // Needed for formatMoney
};

// 2. Load the script into the sandbox
let utilsCode = fs.readFileSync('utils.js', 'utf8');

// Strip ES6 modules exports and imports for Node VM compatibility
utilsCode = utilsCode
    .replace(/import\s+[\s\S]*?\s+from\s+['"].*?['"];?/g, '')
    .replace(/export\s+default\s+\w+;?/g, '')
    .replace(/export\s+(const|let|function|class)/g, '$1');

vm.createContext(sandbox);

try {
    vm.runInContext(utilsCode, sandbox);

    // 3. Write Tests
    console.log("Running Utils tests...");
    const Utils = sandbox.window.CalculatorUtils;

    // --- Extracted from test_app.js ---

    // Test: Utils.safeNumber
    assert.strictEqual(Utils.safeNumber(10), 10, "Valid number should return itself");
    assert.strictEqual(Utils.safeNumber('10'), 10, "String number should be parsed to number");
    assert.strictEqual(Utils.safeNumber('abc'), 0, "Invalid string should return default fallback 0");
    assert.strictEqual(Utils.safeNumber(undefined), 0, "Undefined should return default fallback 0");
    assert.strictEqual(Utils.safeNumber(null), 0, "Null should return default fallback 0");
    assert.strictEqual(Utils.safeNumber(NaN), 0, "NaN should return default fallback 0");
    assert.strictEqual(Utils.safeNumber(Infinity), 0, "Infinity should return default fallback 0");
    assert.strictEqual(Utils.safeNumber('abc', 5), 5, "Invalid string should return custom fallback 5");
    console.log("✓ Utils.safeNumber");

    // Test: Utils.safeDivide
    assert.strictEqual(Utils.safeDivide(10, 2), 5, "10 / 2 should be 5");
    assert.strictEqual(Utils.safeDivide(10, 0), 0, "10 / 0 should return default fallback 0");
    assert.strictEqual(Utils.safeDivide(10, 0, null), null, "10 / 0 with null fallback should return null");
    assert.strictEqual(Utils.safeDivide('10', '2'), 5, "string numbers should be parsed");
    assert.strictEqual(Utils.safeDivide('abc', 2), 0, "invalid top should return 0 / 2 = 0");
    assert.strictEqual(Utils.safeDivide(10, 'xyz'), 0, "invalid bottom should trigger default fallback 0");
    assert.strictEqual(Utils.safeDivide(10, 'xyz', -1), -1, "invalid bottom should trigger custom fallback");
    console.log("✓ Utils.safeDivide");

    // Test: Utils.escapeHtml
    assert.strictEqual(Utils.escapeHtml('hello'), 'hello', "Normal string should be unchanged");
    assert.strictEqual(Utils.escapeHtml('<div>&"\'</div>'), '&lt;div&gt;&amp;&quot;&#039;&lt;/div&gt;', "HTML chars should be escaped");
    assert.strictEqual(Utils.escapeHtml(null), '', "Null should return empty string");
    assert.strictEqual(Utils.escapeHtml(undefined), '', "Undefined should return empty string");
    assert.strictEqual(Utils.escapeHtml(123), '123', "Numbers should be converted to string");
    assert.strictEqual(Utils.escapeHtml(true), 'true', "Booleans should be converted to string");
    console.log("✓ Utils.escapeHtml");


    // --- Simple utility functions ---

    // Test: Utils.safeText
    assert.strictEqual(Utils.safeText('test'), 'test');
    assert.strictEqual(Utils.safeText(null, 'fb'), 'fb');
    assert.strictEqual(Utils.safeText(undefined, 'fb'), 'fb');
    assert.strictEqual(Utils.safeText(123), '123');
    console.log("✓ Utils.safeText");

    // Test: Utils.safeJSONParse
    assert.deepStrictEqual(Utils.safeJSONParse('{"a":1}', null), {a: 1});
    assert.strictEqual(Utils.safeJSONParse('invalid', 'fb'), 'fb');
    assert.strictEqual(Utils.safeJSONParse(null, 'fb'), 'fb');
    assert.strictEqual(Utils.safeJSONParse(undefined, 'fb'), 'fb');
    assert.strictEqual(Utils.safeJSONParse('', 'fb'), 'fb');
    assert.strictEqual(Utils.safeJSONParse('{bad_json}', 'fb'), 'fb');
    console.log("✓ Utils.safeJSONParse");

    // Test: Utils.formatMoney / Utils.money
    assert.strictEqual(Utils.formatMoney(1000), '$1,000.00');
    assert.strictEqual(Utils.formatMoney(0), '$0.00');
    assert.strictEqual(Utils.formatMoney(-50.5), '-$50.50');
    assert.strictEqual(Utils.money(100), '$100.00');
    console.log("✓ Utils.formatMoney");

    // Test: Utils.compactMoney
    assert.strictEqual(Utils.compactMoney(1500.5), '$1,501');
    assert.strictEqual(Utils.compactMoney(-1200), '-$1,200');
    assert.strictEqual(Utils.compactMoney(999), '$999.00');
    console.log("✓ Utils.compactMoney");

    // Test: Utils.pct
    assert.strictEqual(Utils.pct(50.567), '50.6%');
    assert.strictEqual(Utils.pct(0), '0.0%');
    console.log("✓ Utils.pct");

    // Test: Utils.cleanNumber
    assert.strictEqual(Utils.cleanNumber('$1,234.56'), 0);
    assert.strictEqual(Utils.cleanNumber('abc'), 0);
    console.log("✓ Utils.cleanNumber");

    // Test: Utils.capitalize
    assert.strictEqual(Utils.capitalize('hello world'), 'Hello world');
    assert.strictEqual(Utils.capitalize(''), '');
    assert.strictEqual(Utils.capitalize(null), '');
    console.log("✓ Utils.capitalize");

    // Test: Utils.toCsv
    assert.strictEqual(Utils.toCsv([['test']]), 'test');
    assert.strictEqual(Utils.toCsv([['test', 'with', 'commas']]), 'test,with,commas');
    assert.strictEqual(Utils.toCsv([['test"quote']]), '"test""quote"');
    assert.strictEqual(Utils.toCsv([['a,b', 'c']]), '"a,b",c');
    assert.strictEqual(Utils.toCsv([]), '');
    // CSV Injection tests
    assert.strictEqual(Utils.toCsv([['=cmd|calc']]), "'=cmd|calc", "Formula starting with = should be quoted");
    assert.strictEqual(Utils.toCsv([['+A1']]), "'+A1", "Formula starting with + should be quoted");
    assert.strictEqual(Utils.toCsv([['-B2']]), "'-B2", "Formula starting with - should be quoted");
    assert.strictEqual(Utils.toCsv([[' =cmd']]), "' =cmd", "Formula starting with space should be quoted");
    assert.strictEqual(Utils.toCsv([['\t+A1']]), "'\t+A1", "Formula starting with tab should be quoted");
    assert.strictEqual(Utils.toCsv([['@SUM(A1:A5)']]), "'@SUM(A1:A5)", "Formula starting with @ should be quoted");
    assert.strictEqual(Utils.toCsv([['-15.5']]), "-15.5", "Valid negative number should not be quoted");
    assert.strictEqual(Utils.toCsv([['+42']]), "+42", "Valid positive number should not be quoted");
    assert.strictEqual(Utils.toCsv([['hello\r=cmd']]), '"hello\r=cmd"', "Values with carriage returns should be quoted");
    console.log("✓ Utils.toCsv");

    // Test: Utils.deductionLabel
    assert.strictEqual(Utils.deductionLabel('standard'), 'Standard mileage deduction');
    assert.strictEqual(Utils.deductionLabel('actual'), 'Actual expenses deduction');
    assert.strictEqual(Utils.deductionLabel('none'), 'No deduction estimate');
    assert.strictEqual(Utils.deductionLabel('unknown'), 'No deduction estimate');
    console.log("✓ Utils.deductionLabel");

    // Test: Utils.debounce (Mocking time is tricky, but we can do a basic check)
    let callCount = 0;
    const debouncedFn = Utils.debounce(() => { callCount++; }, 10);
    debouncedFn();
    debouncedFn();
    debouncedFn();
    setTimeout(() => {
        assert.strictEqual(callCount, 1, "Debounce should only call the function once");
        console.log("✓ Utils.debounce");


    // Test: Utils.validateInputs
    const validDailyInput = { mode: 'daily', mpg: 25, hours: 8, miles: 100, income: 200, gasPrice: 3.5 };
    assert.strictEqual(Utils.validateInputs(validDailyInput).length, 0, "Valid daily inputs should return no messages");

    const validWeeklyInput = { mode: 'weekly', mpg: 25, avgHours: 8, avgMiles: 100, avgIncome: 200, gasPrice: 3.5 };
    assert.strictEqual(Utils.validateInputs(validWeeklyInput).length, 0, "Valid weekly inputs should return no messages");

    const invalidMpg = { mode: 'daily', mpg: 0, hours: 8, miles: 100, income: 200, gasPrice: 3.5 };
    assert.strictEqual(Utils.validateInputs(invalidMpg).length, 1);
    assert.strictEqual(Utils.validateInputs(invalidMpg)[0].type, 'bad');
    assert.ok(Utils.validateInputs(invalidMpg)[0].text.includes('MPG cannot be zero'));

    const invalidDailyHours = { mode: 'daily', mpg: 25, hours: 0, miles: 100, income: 200, gasPrice: 3.5 };
    assert.strictEqual(Utils.validateInputs(invalidDailyHours).length, 1);
    assert.strictEqual(Utils.validateInputs(invalidDailyHours)[0].type, 'warn');
    assert.ok(Utils.validateInputs(invalidDailyHours)[0].text.includes('Hours cannot be zero'));

    const invalidWeeklyHours = { mode: 'weekly', mpg: 25, avgHours: 0, avgMiles: 100, avgIncome: 200, gasPrice: 3.5 };
    assert.strictEqual(Utils.validateInputs(invalidWeeklyHours).length, 1);
    assert.strictEqual(Utils.validateInputs(invalidWeeklyHours)[0].type, 'warn');
    assert.ok(Utils.validateInputs(invalidWeeklyHours)[0].text.includes('Average hours cannot be zero'));

    const invalidDailyMiles = { mode: 'daily', mpg: 25, hours: 8, miles: -1, income: 200, gasPrice: 3.5 };
    assert.strictEqual(Utils.validateInputs(invalidDailyMiles).length, 1);
    assert.strictEqual(Utils.validateInputs(invalidDailyMiles)[0].type, 'warn');
    assert.ok(Utils.validateInputs(invalidDailyMiles)[0].text.includes('Miles cannot be zero'));

    const invalidWeeklyMiles = { mode: 'weekly', mpg: 25, avgHours: 8, avgMiles: 0, avgIncome: 200, gasPrice: 3.5 };
    assert.strictEqual(Utils.validateInputs(invalidWeeklyMiles).length, 1);
    assert.strictEqual(Utils.validateInputs(invalidWeeklyMiles)[0].type, 'warn');
    assert.ok(Utils.validateInputs(invalidWeeklyMiles)[0].text.includes('Average miles cannot be zero'));

    const invalidDailyIncome = { mode: 'daily', mpg: 25, hours: 8, miles: 100, income: -10, gasPrice: 3.5 };
    assert.strictEqual(Utils.validateInputs(invalidDailyIncome).length, 1);
    assert.strictEqual(Utils.validateInputs(invalidDailyIncome)[0].type, 'bad');
    assert.ok(Utils.validateInputs(invalidDailyIncome)[0].text.includes('Income should not be negative'));

    const invalidWeeklyIncome = { mode: 'weekly', mpg: 25, avgHours: 8, avgMiles: 100, avgIncome: -10, gasPrice: 3.5 };
    assert.strictEqual(Utils.validateInputs(invalidWeeklyIncome).length, 1);
    assert.strictEqual(Utils.validateInputs(invalidWeeklyIncome)[0].type, 'bad');
    assert.ok(Utils.validateInputs(invalidWeeklyIncome)[0].text.includes('Income should not be negative'));

    const invalidGasPrice = { mode: 'daily', mpg: 25, hours: 8, miles: 100, income: 200, gasPrice: -1 };
    assert.strictEqual(Utils.validateInputs(invalidGasPrice).length, 1);
    assert.strictEqual(Utils.validateInputs(invalidGasPrice)[0].type, 'bad');
    assert.ok(Utils.validateInputs(invalidGasPrice)[0].text.includes('Gas price should not be negative'));

    console.log("✓ Utils.validateInputs");

    // --- Core Logic functions ---

    // Test: Utils.calculateWearRate
    const wearInput = { depreciationPerMile: 0.1, tireWearPerMile: 0.05, brakeWearPerMile: 0.05 };
    assert.strictEqual(Utils.calculateWearRate(wearInput), 0.2);
    console.log("✓ Utils.calculateWearRate");

    // Test: Utils.evaluateTargets
    const targetsInput = { targetProfitHour: 25, targetProfitMile: 1.5 };
    const targetsRes1 = Utils.evaluateTargets(30, 2.0, targetsInput);
    assert.strictEqual(targetsRes1.hitHourlyTarget, true);
    assert.strictEqual(targetsRes1.hitMileTarget, true);
    const targetsRes2 = Utils.evaluateTargets(20, 1.0, targetsInput);
    assert.strictEqual(targetsRes2.hitHourlyTarget, false);
    assert.strictEqual(targetsRes2.hitMileTarget, false);
    console.log("✓ Utils.evaluateTargets");

    // Test: Utils.calculateCore
    const coreInput = {
        mode: 'daily',
        income: 200,
        hours: 8,
        miles: 100,
        trips: 15,
        gasPrice: 3.5,
        mpg: 25,
        tolls: 10,
        additional: 5,
        insurance: 100,
        maintenance: 50,
        phone: 50,
        otherFixed: 20,
        deductionMode: 'standard',
        mileageRate: 0.67,
        selfEmploymentTax: 15.3,
        federalTax: 10,
        stateTax: 5,
        depreciationPerMile: 0.10,
        tireWearPerMile: 0.05,
        brakeWearPerMile: 0.05,
        targetDailyProfit: 150,
        targetProfitHour: 20,
        targetProfitMile: 1.0
    };

    const coreResult = Utils.calculateCore(coreInput);
    assert.strictEqual(coreResult.gasUsed, 4); // 100 miles / 25 mpg
    assert.strictEqual(coreResult.gasCost, 14); // 4 * 3.5
    assert.strictEqual(coreResult.totalExpenses, 39); // variable(14+10+5) + fixed share(220/22 = 10)
    assert.strictEqual(coreResult.netProfit, 161); // 200 - 39
    assert.strictEqual(coreResult.taxableProfit, 133); // 200 - 67 = 133
    assert.strictEqual(coreResult.vehicleWearCost, 20); // 100 * 0.2

    // New missing coverage assertions for coreInput
    assert.strictEqual(coreResult.mileageDeduction, 67); // 100 * 0.67
    assert.strictEqual(coreResult.actualExpenseDeduction, 39); // totalExpenses
    assert.strictEqual(coreResult.selectedDeduction, 67); // standard mode uses mileageDeduction
    assert.strictEqual(coreResult.totalTaxRate, 0.303); // (15.3 + 10 + 5) / 100
    // taxableProfit is 133
    // estimatedTaxOwed = 133 * 0.303 = 40.299
    assert.strictEqual(Math.round(coreResult.estimatedTaxOwed * 1000) / 1000, 40.299);
    // netProfit = 161
    // suggestedTaxSetAside = 161 * 0.303 = 48.783
    assert.strictEqual(Math.round(coreResult.suggestedTaxSetAside * 1000) / 1000, 48.783);
    // afterTaxProfit = 161 - 40.299 = 120.701
    assert.strictEqual(Math.round(coreResult.afterTaxProfit * 1000) / 1000, 120.701);

    // Wear properties
    assert.strictEqual(coreResult.depreciationCost, 10); // 100 * 0.10
    assert.strictEqual(coreResult.tireWearCost, 5); // 100 * 0.05
    assert.strictEqual(coreResult.brakeWearCost, 5); // 100 * 0.05
    assert.strictEqual(coreResult.wearRate, 0.20); // 0.10 + 0.05 + 0.05

    // True Profit & Targeting properties
    // trueNetAfterWear = 120.701 - 20 = 100.701
    assert.strictEqual(Math.round(coreResult.trueNetAfterWear * 1000) / 1000, 100.701);
    assert.strictEqual(coreResult.profitPerHour, 161 / 8);
    assert.strictEqual(coreResult.profitPerMile, 161 / 100);
    assert.strictEqual(Math.round(coreResult.trueProfitPerHour * 1000) / 1000, 12.588); // 100.701 / 8
    assert.strictEqual(Math.round(coreResult.trueProfitPerMile * 1000) / 1000, 1.007); // 100.701 / 100
    assert.strictEqual(coreResult.dailyNetProfit, 161);

    // Test: Utils.calculateCore with weekly mode and actual deduction
    const weeklyCoreInput = {
        mode: 'weekly',
        workingDays: 5,
        avgIncome: 200,
        avgHours: 8,
        avgMiles: 100,
        avgTrips: 15,
        gasPrice: 3.5,
        mpg: 25,
        tolls: 50,
        additional: 25,
        insurance: 100,
        maintenance: 50,
        phone: 50,
        otherFixed: 20,
        deductionMode: 'actual',
        mileageRate: 0.67,
        selfEmploymentTax: 15.3,
        federalTax: 10,
        stateTax: 5,
        depreciationPerMile: 0.10,
        tireWearPerMile: 0.05,
        brakeWearPerMile: 0.05,
        targetDailyProfit: 150,
        targetProfitHour: 20,
        targetProfitMile: 1.0
    };

    const weeklyCoreResult = Utils.calculateCore(weeklyCoreInput);

    // In weekly mode:
    // period.income = 200 * 5 = 1000
    // period.miles = 100 * 5 = 500
    // gasUsed = 500 / 25 = 20
    // gasCost = 20 * 3.5 = 70
    // variableExpenses = 70 + 50 + 25 = 145
    // fixedCostShare = 220 * (5/22) = 50
    // totalExpenses = 145 + 50 = 195
    assert.strictEqual(weeklyCoreResult.fixedCostShare, 50);
    assert.strictEqual(weeklyCoreResult.actualExpenseDeduction, 195);
    // mode is actual, so selectedDeduction should be actualExpenseDeduction
    assert.strictEqual(weeklyCoreResult.selectedDeduction, 195);
    // netProfit = 1000 - 195 = 805
    assert.strictEqual(weeklyCoreResult.netProfit, 805);
    // dailyNetProfit in weekly mode = netProfit / workingDays = 805 / 5 = 161
    assert.strictEqual(weeklyCoreResult.dailyNetProfit, 161);
    assert.strictEqual(weeklyCoreResult.workingDays, 5);

    console.log("✓ Utils.calculateCore");

    // Test: Utils.calculateTripDecision
    const tripInput = {
        offeredPay: 20,
        tripTimeMinutes: 20,
        tripMiles: 10,
        pickupMiles: 5,
        pickupTimeMinutes: 10,
        tollsParking: 2,
        mpg: 25,
        gasPrice: 3.5,
        depreciationPerMile: 0.1,
        tireWearPerMile: 0.05,
        brakeWearPerMile: 0.05
    };
    const tripResult = Utils.calculateTripDecision(tripInput);
    assert.strictEqual(tripResult.totalTimeMinutes, 30);
    assert.strictEqual(tripResult.totalMiles, 15);
    // gasCost = (15 / 25) * 3.5 = 2.1
    // wear = 15 * 0.2 = 3.0
    // tolls = 2
    // total costs = 7.1
    // trueProfit = 20 - 7.1 = 12.9
    assert.strictEqual(Math.round(tripResult.trueProfit * 10) / 10, 12.9);
    console.log("✓ Utils.calculateTripDecision");

    // Test: Utils.calculateTripDecision - Decision Branches
    const baseTripInput = {
        offeredPay: 20, tripTimeMinutes: 20, tripMiles: 10, pickupMiles: 5, pickupTimeMinutes: 10, tollsParking: 2, mpg: 25, gasPrice: 3.5, depreciationPerMile: 0.1, tireWearPerMile: 0.05, brakeWearPerMile: 0.05, targetProfitHour: 20, targetProfitMile: 1.0
    };

    // ACCEPT: hits both targets
    const acceptInput = Object.assign({}, baseTripInput, { offeredPay: 30 });
    const acceptResult = Utils.calculateTripDecision(acceptInput);
    assert.strictEqual(acceptResult.decision, 'ACCEPT');
    assert.strictEqual(acceptResult.type, 'good');

    // MAYBE: hits one target
    const maybeInput = Object.assign({}, baseTripInput, { offeredPay: 14 });
    const maybeResult = Utils.calculateTripDecision(maybeInput);
    assert.strictEqual(maybeResult.decision, 'MAYBE');
    assert.strictEqual(maybeResult.type, 'warn');

    // REJECT (targets): misses both targets
    const rejectTargetInput = Object.assign({}, baseTripInput, { offeredPay: 9 });
    const rejectTargetResult = Utils.calculateTripDecision(rejectTargetInput);
    assert.strictEqual(rejectTargetResult.decision, 'REJECT');
    assert.strictEqual(rejectTargetResult.type, 'bad');
    assert.ok(rejectTargetResult.reason.includes('below your target goals'));

    // REJECT (loss): negative true profit
    const rejectLossInput = Object.assign({}, baseTripInput, { offeredPay: 5 });
    const rejectLossResult = Utils.calculateTripDecision(rejectLossInput);
    assert.strictEqual(rejectLossResult.decision, 'REJECT');
    assert.strictEqual(rejectLossResult.type, 'bad');
    assert.ok(rejectLossResult.reason.includes('lose money'));

    // REJECT (zero/negative pay)
    const rejectZeroPayInput = Object.assign({}, baseTripInput, { offeredPay: 0 });
    const rejectZeroPayResult = Utils.calculateTripDecision(rejectZeroPayInput);
    assert.strictEqual(rejectZeroPayResult.decision, 'REJECT');
    assert.strictEqual(rejectZeroPayResult.type, 'bad');
    assert.ok(rejectZeroPayResult.reason.includes('positive offered pay'));

    console.log("✓ Utils.calculateTripDecision decision branches");





    // Test: Utils.buildSmartSuggestions

    // 1. Test null case
    const suggestions1 = Utils.buildSmartSuggestions(null);
    assert.strictEqual(suggestions1[0].title, 'Run the calculator');

    // Base healthy result that triggers NO suggestions
    const healthyBaseResult = {
        income: 100,
        gasCost: 5,
        vehicleWearCost: 5,
        totalExpenses: 20,
        suggestedTaxSetAside: 5,
        trueNetAfterWear: 50,
        trueProfitPerHour: 25, targetProfitHour: 20,
        trueProfitPerMile: 1.5, targetProfitMile: 1.0,
        mpg: 30,
        miles: 50,
        wearRate: 0.2,
        hitDailyTarget: false, hitHourlyTarget: true, hitMileTarget: true
    };

    // 2. Test healthy fallback
    const healthySuggestions = Utils.buildSmartSuggestions(healthyBaseResult);
    assert.strictEqual(healthySuggestions.length, 1);
    assert.strictEqual(healthySuggestions[0].title, 'Healthy but watch the margins');


    // 2.5 Test Utils.checkDownsideRisk directly
    assert.strictEqual(Utils.checkDownsideRisk({ trueNetAfterWear: 10 }), null);

    const downsideRiskZero = Utils.checkDownsideRisk({ trueNetAfterWear: 0 });
    assert.strictEqual(downsideRiskZero.title, 'Protect your downside');
    assert.strictEqual(downsideRiskZero.type, 'bad');

    const downsideRiskNegative = Utils.checkDownsideRisk({ trueNetAfterWear: -10 });
    assert.strictEqual(downsideRiskNegative.title, 'Protect your downside');
    assert.strictEqual(downsideRiskNegative.type, 'bad');

    // 3. Test checkDownsideRisk
    const downsideResult = Object.assign({}, healthyBaseResult, { trueNetAfterWear: 0 });
    const downsideSuggestions = Utils.buildSmartSuggestions(downsideResult);
    assert.ok(downsideSuggestions.some(s => s.title === 'Protect your downside' && s.type === 'bad'));

    // 4. Test checkHourlyEfficiency
    const hourlyResult = Object.assign({}, healthyBaseResult, { trueProfitPerHour: 15 });
    const hourlySuggestions = Utils.buildSmartSuggestions(hourlyResult);
    assert.ok(hourlySuggestions.some(s => s.title === 'Raise hourly efficiency' && s.type === 'warn'));

    // 5. Test checkDollarDensity
    const densityResult = Object.assign({}, healthyBaseResult, { trueProfitPerMile: 0.5 });
    const densitySuggestions = Utils.buildSmartSuggestions(densityResult);
    assert.ok(densitySuggestions.some(s => s.title === 'Improve dollar density' && s.type === 'warn'));

    // 6. Test checkFuelPressure
    const fuelWarnResult = Object.assign({}, healthyBaseResult, { gasCost: 12 });
    const fuelWarnSuggestions = Utils.buildSmartSuggestions(fuelWarnResult);
    assert.ok(fuelWarnSuggestions.some(s => s.title === 'Fuel is pressuring margin' && s.type === 'warn'));

    const fuelBadResult = Object.assign({}, healthyBaseResult, { gasCost: 18 });
    const fuelBadSuggestions = Utils.buildSmartSuggestions(fuelBadResult);
    assert.ok(fuelBadSuggestions.some(s => s.title === 'Fuel is pressuring margin' && s.type === 'bad'));

    const fuelMpgResult = Object.assign({}, healthyBaseResult, { mpg: 15 });
    const fuelMpgSuggestions = Utils.buildSmartSuggestions(fuelMpgResult);
    assert.ok(fuelMpgSuggestions.some(s => s.title === 'Fuel is pressuring margin' && s.type === 'warn'));

    // 7. Test checkVehicleWear
    const wearWarnResult = Object.assign({}, healthyBaseResult, { vehicleWearCost: 10 });
    const wearWarnSuggestions = Utils.buildSmartSuggestions(wearWarnResult);
    assert.ok(wearWarnSuggestions.some(s => s.title === 'Vehicle wear is meaningful' && s.type === 'warn'));

    const wearBadResult = Object.assign({}, healthyBaseResult, { vehicleWearCost: 16 });
    const wearBadSuggestions = Utils.buildSmartSuggestions(wearBadResult);
    assert.ok(wearBadSuggestions.some(s => s.title === 'Vehicle wear is meaningful' && s.type === 'bad'));

    const wearMilesResult = Object.assign({}, healthyBaseResult, { miles: 160 });
    const wearMilesSuggestions = Utils.buildSmartSuggestions(wearMilesResult);
    assert.ok(wearMilesSuggestions.some(s => s.title === 'Vehicle wear is meaningful' && s.type === 'warn'));

    // 8. Test checkTaxSeparation
    const taxResult = Object.assign({}, healthyBaseResult, { suggestedTaxSetAside: 8 });
    const taxSuggestions = Utils.buildSmartSuggestions(taxResult);
    assert.ok(taxSuggestions.some(s => s.title === 'Keep tax cash separate' && s.type === 'info'));

    // 9. Test checkExpenseLoad
    const expenseResult = Object.assign({}, healthyBaseResult, { totalExpenses: 35 });
    const expenseSuggestions = Utils.buildSmartSuggestions(expenseResult);
    assert.ok(expenseSuggestions.some(s => s.title === 'Audit expense load' && s.type === 'warn'));

    // 10. Test checkStrongPattern
    const patternResult = Object.assign({}, healthyBaseResult, { hitDailyTarget: true });
    const patternSuggestions = Utils.buildSmartSuggestions(patternResult);
    assert.ok(patternSuggestions.some(s => s.title === 'Strong operating pattern' && s.type === 'good'));

    // 11. Test max 6 suggestions slicing
    const maxSuggestionsResult = {
        income: 100, gasCost: 20, vehicleWearCost: 20, totalExpenses: 40, suggestedTaxSetAside: 10,
        trueNetAfterWear: -5, trueProfitPerHour: 10, targetProfitHour: 20, trueProfitPerMile: 0.5, targetProfitMile: 1.0,
        mpg: 30, miles: 50, wearRate: 0.2, hitDailyTarget: false, hitHourlyTarget: false, hitMileTarget: false
    };
    const maxSuggestions = Utils.buildSmartSuggestions(maxSuggestionsResult);
    assert.strictEqual(maxSuggestions.length, 6);

    console.log("✓ Utils.buildSmartSuggestions");

    // Test: Utils.getProfitTipData
    const tipDataNull = Utils.getProfitTipData(null);
    assert.ok(tipDataNull.profit.includes('Calculate once'));

    const tipData = Utils.getProfitTipData(coreResult);
    assert.ok(tipData.profit.includes('Current true net'));
    console.log("✓ Utils.getProfitTipData");

    // Test: Utils.buildAdvisorReply
    const advisorReplyNull = Utils.buildAdvisorReply('worth', null);
    assert.ok(advisorReplyNull.includes('Calculate a shift first'));

    const advisorReplyWorth = Utils.buildAdvisorReply('is it worth it?', coreResult);
    assert.ok(advisorReplyWorth.includes('Yes, this looks workable'));
    console.log("✓ Utils.buildAdvisorReply");

    // Test: Utils.buildTextReport
    const textReport = Utils.buildTextReport(coreResult);
    assert.ok(textReport.includes('Uber Earnings & Expense Calculator Report'));
    assert.ok(textReport.includes('Net profit:'));
    console.log("✓ Utils.buildTextReport");


    // Test: Utils.validateInputs
    const vMpg = Utils.validateInputs({ mpg: 0 });
    assert.strictEqual(vMpg.length, 1);
    assert.ok(vMpg[0].text.includes('MPG cannot be zero'));

    const vHoursDaily = Utils.validateInputs({ hours: 0, mode: 'daily' });
    assert.strictEqual(vHoursDaily.length, 1);
    assert.ok(vHoursDaily[0].text.includes('Hours cannot be zero'));

    const vAvgHoursWeekly = Utils.validateInputs({ avgHours: 0, mode: 'weekly' });
    assert.strictEqual(vAvgHoursWeekly.length, 1);
    assert.ok(vAvgHoursWeekly[0].text.includes('Average hours cannot be zero'));

    const vMilesDaily = Utils.validateInputs({ miles: 0, mode: 'daily' });
    assert.strictEqual(vMilesDaily.length, 1);
    assert.ok(vMilesDaily[0].text.includes('Miles cannot be zero'));

    const vAvgMilesWeekly = Utils.validateInputs({ avgMiles: 0, mode: 'weekly' });
    assert.strictEqual(vAvgMilesWeekly.length, 1);
    assert.ok(vAvgMilesWeekly[0].text.includes('Average miles cannot be zero'));

    const vIncomeDaily = Utils.validateInputs({ income: -10, mode: 'daily' });
    assert.strictEqual(vIncomeDaily.length, 1);
    assert.ok(vIncomeDaily[0].text.includes('Income should not be negative'));

    const vAvgIncomeWeekly = Utils.validateInputs({ avgIncome: -10, mode: 'weekly' });
    assert.strictEqual(vAvgIncomeWeekly.length, 1);
    assert.ok(vAvgIncomeWeekly[0].text.includes('Income should not be negative'));

    const vGasPrice = Utils.validateInputs({ gasPrice: -1 });
    assert.strictEqual(vGasPrice.length, 1);
    assert.ok(vGasPrice[0].text.includes('Gas price should not be negative'));

    const vHappy = Utils.validateInputs({ mpg: 25, hours: 8, miles: 100, income: 200, gasPrice: 3.5, mode: 'daily' });
    assert.strictEqual(vHappy.length, 0);

    console.log("✓ Utils.validateInputs");

        console.log("Basic Utility tests passed!");
    }, 20);

} catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
}
