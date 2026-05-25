const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

// Setup global mocks similar to test_app.js
const elementStore = {};
function createMockElement(id) {
    if (!elementStore[id]) {
        elementStore[id] = {
            id,
            textContent: '',
            className: '',
            style: { display: '' },
            innerHTML: '',
            children: [],
            classList: {
                _classes: new Set(),
                remove: function(...args) {
                    for (let cls of args) {
                        this._classes.delete(cls);
                    }
                },
                add: function(...args) {
                    for (let cls of args) {
                        this._classes.add(cls);
                    }
                },
                contains: function(cls) {
                    return this._classes.has(cls);
                }
            },
            appendChild: function(child) {
                if (!this.children) this.children = [];
                this.children.push(child);
            },
            replaceChildren: function(...children) {
                this.children = children;
            },
            setAttribute: function(name, value) {
                if (!this.attributes) this.attributes = {};
                this.attributes[name] = String(value);
            }
        };
    }
    return elementStore[id];
}

const mockDocument = {
    getElementById: (id) => createMockElement(id),
    createElement: (tag) => {
        const el = createMockElement('temp-' + Math.random());
        el.tagName = tag.toUpperCase();
        return el;
    }
};

const sandbox = {
    window: {
        CalculatorUtils: {}, // Real utils.js will populate this
        CalculatorUI: {}
    },
    document: mockDocument,
    console: console,
    Math: Math,
    Date: Date,
    Number: Number,
    String: String,
    Array: Array,
    Object: Object,
    JSON: JSON
};

const utilsCode = fs.readFileSync('utils.js', 'utf8');
const uiCode = fs.readFileSync('ui.js', 'utf8');

vm.createContext(sandbox);

try {
    vm.runInContext(utilsCode, sandbox);
    vm.runInContext(uiCode, sandbox);
    const UI = sandbox.window.CalculatorUI;
    const U = sandbox.window.CalculatorUtils;

    console.log("Running UI tests in isolation...");

    // Test: setElementText
    const el1 = createMockElement('el1');
    UI.setElementText(el1, 'Hello');
    assert.strictEqual(el1.textContent, 'Hello', "setElementText should set textContent");
    assert.doesNotThrow(() => UI.setElementText(null, 'Hello'));

    // Test: setElementClass
    const el2 = createMockElement('el2');
    UI.setElementClass(el2, 'my-class');
    assert.strictEqual(el2.className, 'my-class', "setElementClass should set className");
    assert.doesNotThrow(() => UI.setElementClass(null, 'class'));

    // Test: setElementDisplay
    const el3 = createMockElement('el3');
    UI.setElementDisplay(el3, 'block');
    assert.strictEqual(el3.style.display, 'block', "setElementDisplay should set style.display");
    assert.doesNotThrow(() => UI.setElementDisplay(null, 'none'));

    // Test: appendAdvisorMessage
    const container = createMockElement('container');
    UI.appendAdvisorMessage(container, 'user', 'Hello Advisor');
    assert.strictEqual(container.children.length, 1, "Should append one child");
    const appendedEl = container.children[0];
    assert.strictEqual(appendedEl.tagName, 'DIV', "Appended child should be a div");
    assert.strictEqual(appendedEl.children.length, 2, "Appended child should have 2 children (strong, p)");
    assert.strictEqual(appendedEl.children[0].tagName, 'STRONG', "First child should be STRONG");
    assert.strictEqual(appendedEl.children[0].textContent, 'You', "First child text should be 'You'");
    assert.strictEqual(appendedEl.children[1].tagName, 'P', "Second child should be P");
    assert.strictEqual(appendedEl.children[1].textContent, 'Hello Advisor', "Second child text should contain the message text");
    assert.ok(appendedEl.className.includes('advisor-message'), "Should have advisor-message class");

    // Test: setTone (indirectly tests U.safeNumber usage)
    const el4 = createMockElement('el4');
    // Using an internal function via a small wrapper if needed, but setTone isn't exported.
    // Instead we test renderTripDecision which uses setTone internally or renderResults

    // We can test renderSmartSuggestions
    const els = { smartSuggestions: createMockElement('smartSuggestions') };
    UI.renderSmartSuggestions(els, [
        { type: 'good', title: 'Tip', text: 'Desc' }
    ]);
    assert.strictEqual(els.smartSuggestions.children.length, 1, 'Should render one suggestion');
    assert.strictEqual(els.smartSuggestions.children[0].tagName, 'ARTICLE', 'Suggestion should be an article');
    assert.ok(els.smartSuggestions.children[0].className.includes('good'), 'Suggestion should have the correct type class');
    assert.strictEqual(els.smartSuggestions.children[0].children[0].textContent, 'Tip', 'Should render suggestion title');
    assert.strictEqual(els.smartSuggestions.children[0].children[1].textContent, 'Desc', 'Should render suggestion desc');

    // Test: renderProTip
    const elsTip = { proTipTitle: createMockElement('proTipTitle'), proTipText: createMockElement('proTipText'), proTipCategory: createMockElement('proTipCategory') };
    UI.renderProTip(elsTip, { category: 'Cat', title: 'Title', text: 'Desc' });
    assert.strictEqual(elsTip.proTipTitle.textContent, 'Title');
    assert.strictEqual(elsTip.proTipText.textContent, 'Desc');

    // Test: renderScenarioComparison
    const scenarioEls = { scenarioBody: createMockElement('scenarioBody') };
    const mockScenarios = [
        {
            name: 'Scenario A',
            result: {
                income: 100,
                totalExpenses: 20,
                netProfit: 80,
                afterTaxProfit: 60,
                trueNetAfterWear: 50,
                trueProfitPerHour: 25,
                trueProfitPerMile: 0.5
            }
        },
        {
            name: 'Scenario B',
            result: {
                income: 150,
                totalExpenses: 30,
                netProfit: 120,
                afterTaxProfit: 90,
                trueNetAfterWear: 75,
                trueProfitPerHour: 35,
                trueProfitPerMile: 0.6
            }
        }
    ];

    UI.renderScenarioComparison(scenarioEls, mockScenarios);

    assert.strictEqual(scenarioEls.scenarioBody.children.length, 2, 'Should render 2 rows');

    const rowA = scenarioEls.scenarioBody.children[0];
    const rowB = scenarioEls.scenarioBody.children[1];

    assert.strictEqual(rowA.tagName, 'TR', 'Row A should be a TR');
    assert.strictEqual(rowB.tagName, 'TR', 'Row B should be a TR');

    assert.ok(!rowA.className.includes('best-row'), 'Row A should not be best row');
    assert.ok(rowB.className.includes('best-row'), 'Row B should be best row');

    // Check Row A cells
    assert.strictEqual(rowA.children.length, 8, 'Row A should have 8 cells');
    assert.strictEqual(rowA.children[0].textContent, 'Scenario A', 'Row A name should be Scenario A');
    assert.strictEqual(rowA.children[1].textContent, U.money(100), 'Row A income should match');

    // Check Row B cells
    assert.strictEqual(rowB.children.length, 8, 'Row B should have 8 cells');
    assert.strictEqual(rowB.children[0].textContent, 'Scenario B - Best', 'Row B name should have - Best');
    assert.strictEqual(rowB.children[1].textContent, U.money(150), 'Row B income should match');


    // Test: renderSummary
    const summaryEls = { summaryBody: createMockElement('summaryBody') };
    const dummyResult = {
        mode: 'daily',
        trips: 5,
        gasUsed: 2,
        variableExpenses: 10,
        fixedCostShare: 5,
        totalExpenses: 15,
        averageIncomePerTrip: 20,
        averageProfitPerTrip: 15,
        mileageDeduction: 5,
        miles: 50,
        taxableProfit: 80,
        deductionMode: 'standard',
        estimatedTaxOwed: 20,
        totalTaxRate: 0.25,
        suggestedTaxSetAside: 25,
        afterTaxProfit: 60,
        depreciationCost: 5,
        tireWearCost: 2,
        brakeWearCost: 1,
        vehicleWearCost: 8,
        wearRate: 0.16,
        trueNetAfterWear: 52,
        trueProfitPerHour: 10,
        targetProfitHour: 20,
        trueProfitPerMile: 1,
        targetProfitMile: 1.5,
        goalStatus: { label: 'Missed' }
    };

    UI.renderSummary(summaryEls, dummyResult);

    assert.ok(summaryEls.summaryBody.children.length > 0, 'Should render summary rows');
    const firstRow = summaryEls.summaryBody.children[0];
    assert.strictEqual(firstRow.tagName, 'TR', 'Row should be a TR');
    assert.strictEqual(firstRow.children.length, 3, 'Row should have 3 TD cells');
    assert.strictEqual(firstRow.children[0].tagName, 'TD', 'Cell should be a TD');
    assert.strictEqual(firstRow.children[0].textContent, 'Mode', 'First cell should contain the correct label text');

    console.log("All UI tests passed!");
    process.exit(0);

} catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
}
