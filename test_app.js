const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

// 1. Setup global mocks
const storageData = {};
const mockLocalStorage = {
    getItem: (key) => storageData[key] || null,
    setItem: (key, val) => { storageData[key] = String(val); },
    removeItem: (key) => { delete storageData[key]; },
    clear: () => { for (let k in storageData) delete storageData[k]; }
};

const elementStore = {};
const listeners = {};

function createMockElement(id) {
    if (!elementStore[id]) {
        elementStore[id] = {
            id,
            value: '',
            innerHTML: '',
            textContent: '',
            dataset: {},
            classList: {
                toggle: function(className, force) {},
                add: function() {},
                remove: function() {}
            },
            style: {},
            setAttribute: function(name, value) {
                if (!this.attributes) this.attributes = {};
                this.attributes[name] = String(value);
                if (name === 'data-delete-shift') this.dataset.deleteShift = value;
            },
            addEventListener: function(event, callback) {
                if (!listeners[id]) listeners[id] = {};
                if (!listeners[id][event]) listeners[id][event] = [];
                listeners[id][event].push(callback);
            },
            dispatchEvent: function(eventName) {
                if (listeners[id] && listeners[id][eventName]) {
                    listeners[id][eventName].forEach(cb => cb({ target: this }));
                }
            },
            closest: function(selector) {
                return null;
            },
            querySelector: function(selector) {
                return createMockElement(id + '-' + selector);
            },
            querySelectorAll: function(selector) {
                return [];
            },
            replaceChildren: function(...children) {
                this.children = children;
            },
            appendChild: function(child) {
                if(!this.children) this.children = [];
                this.children.push(child);
            }
        };
    }
    return elementStore[id];
}

const mockDocument = {
    getElementById: (id) => createMockElement(id),
    querySelectorAll: (selector) => {
        return [{
            dataset: {},
            addEventListener: () => {}
        }];
    },
    createElement: (tag) => {
        const el = createMockElement('temp-' + Math.random());
        el.className = '';
        el.click = () => {};
        el.remove = () => {};
        return el;
    },
    body: {
        appendChild: () => {}
    }
};

const sandbox = {
    window: {
        CalculatorUtils: {},
        CalculatorUI: {},
        localStorage: mockLocalStorage,
        addEventListener: (event, callback) => {
            if (!listeners['window']) listeners['window'] = {};
            if (!listeners['window'][event]) listeners['window'][event] = [];
            listeners['window'][event].push(callback);
        },
        clearInterval: () => {},
        setInterval: () => 123
    },
    document: mockDocument,
    localStorage: mockLocalStorage,
    confirm: () => true,
    Math: Math,
    Date: Date,
    Number: Number,
    String: String,
    Array: Array,
    Object: Object,
    JSON: JSON,
    console: console,
    Blob: class Blob { constructor() {} },
    URL: { createObjectURL: () => 'blob:url', revokeObjectURL: () => {} },
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
};

// 2. Load the scripts into the sandbox
const utilsCode = fs.readFileSync('utils.js', 'utf8');
const uiCode = fs.readFileSync('ui.js', 'utf8');
const appCode = fs.readFileSync('app.js', 'utf8');

vm.createContext(sandbox);

try {
    vm.runInContext(utilsCode, sandbox);
    vm.runInContext(uiCode, sandbox);
    vm.runInContext(appCode, sandbox);

    // 3. Write Tests
    console.log("Running Utils tests...");
    const Utils = sandbox.window.CalculatorUtils;

    // Test: Utils.safeDivide
    assert.strictEqual(Utils.safeDivide(10, 2), 5, "10 / 2 should be 5");
    assert.strictEqual(Utils.safeDivide(10, 0), 0, "10 / 0 should return default fallback 0");
    assert.strictEqual(Utils.safeDivide(10, 0, null), null, "10 / 0 with null fallback should return null");
    assert.strictEqual(Utils.safeDivide('10', '2'), 5, "string numbers should be parsed");
    assert.strictEqual(Utils.safeDivide('abc', 2), 0, "invalid top should return 0 / 2 = 0");
    assert.strictEqual(Utils.safeDivide(10, 'xyz'), 0, "invalid bottom should trigger default fallback 0");
    assert.strictEqual(Utils.safeDivide(10, 'xyz', -1), -1, "invalid bottom should trigger custom fallback");
    console.log("✓ Utils.safeDivide handles normal division and edge cases correctly");

    // Test: Utils.escapeHtml
    assert.strictEqual(Utils.escapeHtml('hello'), 'hello', "Normal string should be unchanged");
    assert.strictEqual(Utils.escapeHtml('<div>&"\'</div>'), '&lt;div&gt;&amp;&quot;&#039;&lt;/div&gt;', "HTML chars should be escaped");
    assert.strictEqual(Utils.escapeHtml(null), '', "Null should return empty string");
    assert.strictEqual(Utils.escapeHtml(undefined), '', "Undefined should return empty string");
    assert.strictEqual(Utils.escapeHtml(123), '123', "Numbers should be converted to string");
    assert.strictEqual(Utils.escapeHtml(true), 'true', "Booleans should be converted to string");
    console.log("✓ Utils.escapeHtml handles html characters and edge cases correctly");


    console.log("Running app.js tests...");

    // Test 1: App initialization loads default values into elements
    assert.strictEqual(elementStore['income'].value, 220, "Income default should be 220");
    assert.strictEqual(elementStore['hours'].value, 8, "Hours default should be 8");
    console.log("✓ Initialization loads default values");

    // Test 2: Saving a result works
    const saveBtn = elementStore['saveBtn'];
    assert.ok(saveBtn, "saveBtn should exist");

    // Trigger save click
    saveBtn.dispatchEvent('click');

    const savedResult = storageData['uberCalculatorSavedResult'];
    assert.ok(savedResult, "Result should be saved to localStorage");
    const parsedResult = JSON.parse(savedResult);
    assert.strictEqual(parsedResult.income, 220, "Saved result should contain income 220");
    console.log("✓ Saving result updates localStorage");

    // Test 3: Input change triggers auto-save status
    const incomeInput = elementStore['income'];
    incomeInput.value = 300;
    incomeInput.dispatchEvent('input');

    // Since calculating is debounced, we'll verify auto-save status immediately
    assert.strictEqual(elementStore['savedStatus'].textContent, 'Auto-saves inputs');
    console.log("✓ Input change triggers auto-save");

    console.log("All tests passed!");
    process.exit(0);

} catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
}
