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
                if (children.length === 1 && children[0].children !== undefined) {
                    this.children = children[0].children;
                } else {
                    this.children = children;
                }
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
    createDocumentFragment: () => {
        return {
            appendChild: function(child) {
                if (!this.children) this.children = [];
                this.children.push(child);
            },
            children: []
        };
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
    btoa: btoa,
    atob: atob,
    encodeURIComponent: encodeURIComponent,
    decodeURIComponent: decodeURIComponent,
};

// 2. Load the scripts into the sandbox
let utilsCode = fs.readFileSync('utils.js', 'utf8');
let uiCode = fs.readFileSync('ui.js', 'utf8');
let appCode = fs.readFileSync('app.js', 'utf8');

// Strip ES6 modules exports and imports for Node VM compatibility
const sanitize = (code) => code
    .replace(/import\s+U\s+from\s+['"].*?['"];?/g, 'var U = U || window.CalculatorUtils;')
    .replace(/import\s+UI\s+from\s+['"].*?['"];?/g, 'var UI = UI || window.CalculatorUI;')
    .replace(/import\s+[\s\S]*?\s+from\s+['"].*?['"];?/g, '')
    .replace(/export\s+default\s+\w+;?/g, '')
    .replace(/export\s+(const|let|function|class)/g, '$1');

utilsCode = sanitize(utilsCode);
uiCode = sanitize(uiCode);
appCode = sanitize(appCode);

vm.createContext(sandbox);

try {
    vm.runInContext(utilsCode, sandbox);
    vm.runInContext(uiCode, sandbox);
    vm.runInContext(appCode, sandbox);

    // 3. Write Tests
    console.log("Running UI tests...");
    const UI = sandbox.window.CalculatorUI;

    // Test: UI.setElementText
    // Happy path
    const mockEl = { textContent: '' };
    UI.setElementText(mockEl, 'Hello');
    assert.strictEqual(mockEl.textContent, 'Hello', "setElementText should set textContent");

    // Edge cases
    assert.doesNotThrow(() => {
        UI.setElementText(null, 'Hello');
    }, "setElementText should not throw when element is null");

    assert.doesNotThrow(() => {
        UI.setElementText(undefined, 'Hello');
    }, "setElementText should not throw when element is undefined");

    console.log("✓ UI.setElementText handles null and normal elements correctly");


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
    const parsedResult = JSON.parse(decodeURIComponent(atob(savedResult)));
    assert.strictEqual(parsedResult.income, 220, "Saved result should contain income 220");
    console.log("✓ Saving result updates localStorage");

    // Test 3: Input change triggers auto-save status
    const incomeInput = elementStore['income'];
    incomeInput.value = 300;
    incomeInput.dispatchEvent('input');

    // Since calculating is debounced, we'll verify auto-save status immediately
    assert.strictEqual(elementStore['savedStatus'].textContent, 'Auto-saves inputs');
    console.log("✓ Input change triggers auto-save");


    console.log("Test 4: getHistory corruption handling");
    // Reset storage and setup corrupted data
    for (let k in storageData) delete storageData[k];
    storageData['uberCalculatorShiftHistoryV1'] = '{"corrupted": true}';

    // Setup fresh sandbox to force app.js to re-initialize and trigger getHistory
    const sandbox2 = {
        window: {
            CalculatorUtils: {}, CalculatorUI: {}, localStorage: mockLocalStorage,
            addEventListener: (event, callback) => {
                if (!listeners['window']) listeners['window'] = {};
                if (!listeners['window'][event]) listeners['window'][event] = [];
                listeners['window'][event].push(callback);
            },
            clearInterval: () => {}, setInterval: () => 123
        },
        document: mockDocument, localStorage: mockLocalStorage, confirm: () => true,
        Math: Math, Date: Date, Number: Number, String: String, Array: Array, Object: Object, JSON: JSON, console: console,
        Blob: class Blob { constructor() {} }, URL: { createObjectURL: () => 'blob:url', revokeObjectURL: () => {} },
        setTimeout: setTimeout, clearTimeout: clearTimeout,
        btoa: btoa, atob: atob, encodeURIComponent: encodeURIComponent, decodeURIComponent: decodeURIComponent,
    };
    vm.createContext(sandbox2);
    vm.runInContext(utilsCode, sandbox2);
    vm.runInContext(uiCode, sandbox2);
    vm.runInContext(appCode, sandbox2);

    // Verify the corrupted data was cleared
    assert.strictEqual(storageData['uberCalculatorShiftHistoryV1'], undefined, "Corrupted history should be removed from localStorage");
    console.log("✓ Corrupted shift history is cleared safely");


    console.log("Test 5: safeStorageSet error handling");
    const mockFailingLocalStorage = {
        getItem: (key) => null,
        setItem: (key, val) => { throw new Error('QuotaExceededError'); },
        removeItem: (key) => {},
        clear: () => {}
    };

    const sandbox3 = {
        window: {
            CalculatorUtils: {}, CalculatorUI: {}, localStorage: mockFailingLocalStorage,
            addEventListener: (event, callback) => {
                if (!listeners['window']) listeners['window'] = {};
                if (!listeners['window'][event]) listeners['window'][event] = [];
                listeners['window'][event].push(callback);
            },
            clearInterval: () => {}, setInterval: () => 123
        },
        document: mockDocument, localStorage: mockFailingLocalStorage, confirm: () => true,
        Math: Math, Date: Date, Number: Number, String: String, Array: Array, Object: Object, JSON: JSON, console: console,
        Blob: class Blob { constructor() {} }, URL: { createObjectURL: () => 'blob:url', revokeObjectURL: () => {} },
        setTimeout: setTimeout, clearTimeout: clearTimeout,
        btoa: btoa, atob: atob, encodeURIComponent: encodeURIComponent, decodeURIComponent: decodeURIComponent,
    };
    vm.createContext(sandbox3);
    vm.runInContext(utilsCode, sandbox3);
    vm.runInContext(uiCode, sandbox3);
    vm.runInContext(appCode, sandbox3);

    // Simulate saving a result, which calls safeStorageSet internally
    const saveBtn3 = elementStore['saveBtn'];
    saveBtn3.dispatchEvent('click');

    const statusText = elementStore['savedStatus'].textContent;
    assert.strictEqual(statusText, 'Could not save latest result', "safeStorageSet should update UI with failure message on throw");
    console.log("✓ safeStorageSet handles errors and updates UI");


    console.log("Test 6: safeStorageGet error handling");
    const mockFailingGetLocalStorage = {
        getItem: (key) => { throw new Error('Access Denied'); },
        setItem: (key, val) => {},
        removeItem: (key) => {},
        clear: () => {}
    };

    const sandbox4 = {
        window: {
            CalculatorUtils: {}, CalculatorUI: {}, localStorage: mockFailingGetLocalStorage,
            addEventListener: (event, callback) => {
                if (!listeners['window']) listeners['window'] = {};
                if (!listeners['window'][event]) listeners['window'][event] = [];
                listeners['window'][event].push(callback);
            },
            clearInterval: () => {}, setInterval: () => 123
        },
        document: mockDocument, localStorage: mockFailingGetLocalStorage, confirm: () => true,
        Math: Math, Date: Date, Number: Number, String: String, Array: Array, Object: Object, JSON: JSON, console: console,
        Blob: class Blob { constructor() {} }, URL: { createObjectURL: () => 'blob:url', revokeObjectURL: () => {} },
        setTimeout: setTimeout, clearTimeout: clearTimeout,
        btoa: btoa, atob: atob, encodeURIComponent: encodeURIComponent, decodeURIComponent: decodeURIComponent,
    };
    vm.createContext(sandbox4);
    vm.runInContext(utilsCode, sandbox4);
    vm.runInContext(uiCode, sandbox4);
    vm.runInContext(appCode, sandbox4);

    // We expect app initialization to gracefully handle the error and use defaults.
    // Specifically, restoreInputs() will be called, which calls readJson, which calls safeStorageGet.
    // Because safeStorageGet catches the error and returns null, restoreInputs will use `defaults`.
    // We can verify this by checking that the income input was populated with the default value of 220.
    assert.strictEqual(elementStore['income'].value, 220, "App should initialize with default income even if localStorage.getItem throws");
    console.log("✓ safeStorageGet handles errors and allows app initialization");

    console.log("All tests passed!");


    process.exit(0);

} catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
}
