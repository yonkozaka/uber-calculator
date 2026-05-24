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
const utilsCode = fs.readFileSync('utils.js', 'utf8');

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
    console.log("✓ Utils.safeJSONParse");

    // Test: Utils.formatMoney / Utils.money
    assert.strictEqual(Utils.formatMoney(1000), '$1,000.00');
    assert.strictEqual(Utils.formatMoney(0), '$0.00');
    assert.strictEqual(Utils.formatMoney(-50.5), '-$50.50');
    assert.strictEqual(Utils.money(100), '$100.00');
    console.log("✓ Utils.formatMoney");

    // Test: Utils.compactMoney
    assert.strictEqual(Utils.compactMoney(1500.5), '$1,501');
    assert.strictEqual(Utils.compactMoney(-1200), '$-1,200');
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

    // Test: Utils.buildSmartSuggestions
    const suggestions1 = Utils.buildSmartSuggestions(null);
    assert.strictEqual(suggestions1[0].title, 'Run the calculator');

    const badCoreResult = Object.assign({}, coreResult, { trueProfitPerHour: 10, targetProfitHour: 25, trueProfitPerMile: 0.5, targetProfitMile: 1.5, trueNetAfterWear: -10, goalStatus: {type: 'bad'} });
    const suggestions2 = Utils.buildSmartSuggestions(badCoreResult);
    assert.ok(suggestions2.length > 0);
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

        console.log("Basic Utility tests passed!");
    }, 20);

} catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
}
