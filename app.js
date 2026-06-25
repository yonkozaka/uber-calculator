import U from './utils.js';
import UI from './ui.js';

  const STORAGE_KEY = 'uberCalculatorInputsV2';
  const LEGACY_STORAGE_KEY = 'uberCalculatorInputs';
  const RESULT_KEY = 'uberCalculatorSavedResult';
  const HISTORY_KEY = 'uberCalculatorShiftHistoryV1';

  const inputIds = [
    'mode', 'income', 'hours', 'trips', 'miles', 'gasPrice', 'mpg', 'tolls', 'additional',
    'workingDays', 'avgHours', 'avgMiles', 'avgIncome', 'insurance', 'maintenance', 'phone',
    'otherFixed', 'selfEmploymentTax', 'federalTax', 'stateTax', 'deductionMode', 'mileageRate',
    'depreciationPerMile', 'tireWearPerMile', 'brakeWearPerMile', 'targetDailyProfit',
    'targetProfitHour', 'targetProfitMile', 'scenarioAIncome', 'scenarioAHours',
    'scenarioAMiles', 'scenarioATrips', 'scenarioBIncome', 'scenarioBHours',
    'scenarioBMiles', 'scenarioBTrips', 'tripOfferPay', 'tripTime', 'tripMiles',
    'tripPickupMiles', 'tripPickupTime', 'tripTolls'
  ];

  const fields = Object.fromEntries(inputIds.map((id) => [id, document.getElementById(id)]));
  const labels = {
    income: document.getElementById('incomeLabel'),
    hours: document.getElementById('hoursLabel'),
    miles: document.getElementById('milesLabel'),
    trips: document.getElementById('tripsLabel'),
    tolls: document.getElementById('tollsLabel'),
    additional: document.getElementById('additionalLabel')
  };
  const els = {
    periodInputs: document.getElementById('periodInputs'),
    savedStatus: document.getElementById('savedStatus'),
    alerts: document.getElementById('alerts'),
    featureDetails: document.getElementById('featureDetails'),
    resultsGrid: document.getElementById('resultsGrid'),
    summaryBody: document.getElementById('summaryBody'),
    recommendation: document.getElementById('recommendation'),
    analyticsGrid: document.getElementById('analyticsGrid'),
    historyBody: document.getElementById('historyBody'),
    historyEmpty: document.getElementById('historyEmpty'),
    scenarioBody: document.getElementById('scenarioBody'),
    topNet: document.getElementById('topNet'),
    topAfterTax: document.getElementById('topAfterTax'),
    topTrueNet: document.getElementById('topTrueNet'),
    topTrueHour: document.getElementById('topTrueHour'),
    mobileNet: document.getElementById('mobileNet'),
    mobileAfterTax: document.getElementById('mobileAfterTax'),
    mobileTrueNet: document.getElementById('mobileTrueNet'),
    mobileTrueHour: document.getElementById('mobileTrueHour'),
    proTipsCard: document.getElementById('proTipsCard'),
    proTipCategory: document.getElementById('proTipCategory'),
    proTipTitle: document.getElementById('proTipTitle'),
    proTipText: document.getElementById('proTipText'),
    proTipMeta: document.getElementById('proTipMeta'),
    proTipDots: document.getElementById('proTipDots'),
    advisorMessages: document.getElementById('advisorMessages'),
    advisorInput: document.getElementById('advisorInput'),
    advisorSendBtn: document.getElementById('advisorSendBtn'),
    advisorCharCount: document.getElementById('advisorCharCount'),
    heroReadout: document.getElementById('heroReadout'),
    smartSuggestions: document.getElementById('smartSuggestions'),
    tripDecisionCard: document.getElementById('tripDecisionCard'),
    tripDecisionBadge: document.getElementById('tripDecisionBadge'),
    tripDecisionText: document.getElementById('tripDecisionText'),
    tripDecisionReason: document.getElementById('tripDecisionReason'),
    tripTotalTime: document.getElementById('tripTotalTime'),
    tripTotalMiles: document.getElementById('tripTotalMiles'),
    tripPayHour: document.getElementById('tripPayHour'),
    tripPayMile: document.getElementById('tripPayMile'),
    tripGasCost: document.getElementById('tripGasCost'),
    tripWearCost: document.getElementById('tripWearCost'),
    tripTrueProfit: document.getElementById('tripTrueProfit')
  };

  const defaults = {
    mode: 'daily',
    income: 220,
    hours: 8,
    trips: 18,
    miles: 135,
    gasPrice: 3.75,
    mpg: 28,
    tolls: 12,
    additional: 8,
    workingDays: 5,
    avgHours: 8,
    avgMiles: 135,
    avgIncome: 220,
    insurance: 180,
    maintenance: 120,
    phone: 60,
    otherFixed: 40,
    selfEmploymentTax: 15.3,
    federalTax: 12,
    stateTax: 5,
    deductionMode: 'standard',
    mileageRate: 0.67,
    depreciationPerMile: 0.12,
    tireWearPerMile: 0.03,
    brakeWearPerMile: 0.04,
    targetDailyProfit: 160,
    targetProfitHour: 20,
    targetProfitMile: 1.25,
    scenarioAIncome: 220,
    scenarioAHours: 8,
    scenarioAMiles: 120,
    scenarioATrips: 18,
    scenarioBIncome: 260,
    scenarioBHours: 8,
    scenarioBMiles: 120,
    scenarioBTrips: 20,
    tripOfferPay: 18,
    tripTime: 24,
    tripMiles: 10,
    tripPickupMiles: 2.5,
    tripPickupTime: 7,
    tripTolls: 0
  };

  const periodAverageByTotal = { income: 'avgIncome', hours: 'avgHours', miles: 'avgMiles' };
  const periodTotalByAverage = { avgIncome: 'income', avgHours: 'hours', avgMiles: 'miles' };
  const periodDecimals = { income: 2, avgIncome: 2, hours: 1, avgHours: 1, miles: 1, avgMiles: 1 };
  const featureDetails = {
    offline: 'The calculator runs as local browser files. After loading, inputs, calculations, history, and exports keep working without a server.',
    storage: 'Saved shifts and current inputs stay in this browser on this computer. Use Save result to add a shift and Export history CSV to download records.',
    taxWear: 'Tax settings estimate set-aside amounts, while vehicle wear settings model hidden mileage costs like depreciation, tires, and maintenance.',
    exports: 'Use Export current TXT for the visible calculation report, or Export history CSV in Shift History for saved shifts.'
  };

  const StateStore = {
    state: {
      inputs: {},
      history: []
    },
    listeners: new Set(),
    subscribe(callback) {
      this.listeners.add(callback);
      return () => this.listeners.delete(callback);
    },
    updateInputs(newInputs) {
      Object.assign(this.state.inputs, newInputs);
      this.notify();
    },
    setHistory(newHistory) {
      this.state.history = newHistory;
      this.notify();
    },
    notify() {
      this.listeners.forEach((callback) => callback(this.state));
    }
  };

  let latestResult = null;
  let periodInputSource = 'averages';
  let lastMode = fields.mode?.value || 'daily';
  let activeTipIndex = 0;
  let proTipTimer = null;
  let proTipsPaused = false;

  // ⚡ Bolt: Performance - Cache Intl formatter
  const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' });

  const proTips = [
    { key: 'profit', category: 'Profit strategy', title: 'Judge the shift by true net, not gross pay.', text: 'Gross income can look strong while taxes, fuel, and wear quietly erase the margin.' },
    { key: 'gas', category: 'Fuel control', title: 'Gas pressure rises fastest on low-MPG long pickups.', text: 'When gas takes a large share of income, prioritize shorter pickups and denser areas.' },
    { key: 'taxes', category: 'Tax planning', title: 'Set aside money before it feels like profit.', text: 'A clean tax set-aside habit keeps strong shifts from becoming surprise bills later.' },
    { key: 'wear', category: 'Vehicle wear', title: 'Every mile has a hidden cost.', text: 'Depreciation, tires, brakes, and maintenance can turn a positive cash day into a weak true-profit day.' },
    { key: 'hourly', category: 'Hourly profit', title: 'Protect your hourly floor.', text: 'If true profit per hour is below your goal, the shift needs better pay, fewer waits, or fewer dead miles.' },
    { key: 'mileage', category: 'Mileage quality', title: 'High miles need high payout density.', text: 'A long shift can still work if profit per mile stays strong after gas, taxes, and wear.' }
  ];

  function safeStorageGet(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return fallback;
      try {
        return decodeURIComponent(atob(value));
      } catch (decodeError) {
        // Fallback for existing unencoded data
        return value;
      }
    } catch (error) {
      return fallback;
    }
  }

  function safeStorageSet(key, value, failureMessage = 'Storage is full or unavailable') {
    try {
      const encodedValue = btoa(encodeURIComponent(value));
      localStorage.setItem(key, encodedValue);
      return true;
    } catch (error) {
      UI.setElementText(els.savedStatus, failureMessage);
      return false;
    }
  }

  function safeStorageRemove(key, failureMessage = 'Storage is unavailable') {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      UI.setElementText(els.savedStatus, failureMessage);
      return false;
    }
  }

  function readJson(key, fallback) {
    return U.safeJSONParse(safeStorageGet(key, null), fallback);
  }

  function numberValue(id) {
    // ⚡ Bolt: Performance - Minimize DOM reads
    const cached = StateStore.state.inputs[id];
    return U.safeNumber(cached !== undefined ? cached : fields[id]?.value);
  }

  function getInputs() {
    return { ...StateStore.state.inputs, periodInputSource };
  }

  function setInputs(values) {
    Object.entries(values).forEach(([id, value]) => {
      if (fields[id]) fields[id].value = value;
    });
    StateStore.updateInputs(values);
  }

  function saveInputs() {
    safeStorageSet(STORAGE_KEY, JSON.stringify(getInputs()));
  }

  function restoreInputs() {
    const stored = readJson(STORAGE_KEY, null) || readJson(LEGACY_STORAGE_KEY, {});
    const saved = stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
    periodInputSource = saved.periodInputSource === 'totals' ? 'totals' : 'averages';
    const initialInputs = { ...defaults, ...saved };
    setInputs(initialInputs);
  }

  function syncMode() {
    const isDaily = (StateStore.state.inputs.mode || fields.mode?.value) === 'daily';
    if (els.periodInputs) els.periodInputs.classList.toggle('active', !isDaily);
    UI.setElementText(labels.income, isDaily ? 'Total Uber income ($)' : 'Calculated income ($)');
    UI.setElementText(labels.hours, isDaily ? 'Total working hours' : 'Calculated working hours');
    UI.setElementText(labels.miles, isDaily ? 'Total miles driven' : 'Calculated miles driven');
    UI.setElementText(labels.trips, isDaily ? 'Number of trips' : 'Average trips per day');
    UI.setElementText(labels.tolls, isDaily ? 'Parking/tolls cost ($)' : 'Parking/tolls for period ($)');
    UI.setElementText(labels.additional, isDaily ? 'Additional expenses ($)' : 'Additional expenses for period ($)');
    if (fields.income) fields.income.readOnly = false;
    if (fields.hours) fields.hours.readOnly = false;
    if (fields.miles) fields.miles.readOnly = false;
  }

  function setPeriodFieldValue(id, value, activeId) {
    if (id === activeId || !fields[id]) return;
    fields[id].value = U.safeNumber(value).toFixed(periodDecimals[id] ?? 2);
    StateStore.updateInputs({ [id]: fields[id].value });
  }

  function syncPeriodAmounts(activeId = null) {
    if ((StateStore.state.inputs.mode || fields.mode?.value) === 'daily') return;
    const workingDays = Math.max(numberValue('workingDays'), 1);

    if (Object.prototype.hasOwnProperty.call(periodAverageByTotal, activeId)) {
      periodInputSource = 'totals';
    } else if (activeId === 'workingDays' || Object.prototype.hasOwnProperty.call(periodTotalByAverage, activeId)) {
      periodInputSource = 'averages';
    }

    if (periodInputSource === 'totals') {
      Object.entries(periodAverageByTotal).forEach(([totalId, averageId]) => {
        setPeriodFieldValue(averageId, U.safeDivide(numberValue(totalId), workingDays), activeId);
      });
    } else {
      Object.entries(periodTotalByAverage).forEach(([averageId, totalId]) => {
        setPeriodFieldValue(totalId, numberValue(averageId) * workingDays, activeId);
      });
    }
  }

  function preparePeriodModeAfterModeChange() {
    const currentMode = StateStore.state.inputs.mode || fields.mode?.value || 'daily';
    if (lastMode === 'daily' && currentMode !== 'daily') {
      fields.avgIncome.value = numberValue('income').toFixed(periodDecimals.avgIncome);
      fields.avgHours.value = numberValue('hours').toFixed(periodDecimals.avgHours);
      fields.avgMiles.value = numberValue('miles').toFixed(periodDecimals.avgMiles);
      periodInputSource = 'averages';
    }
    lastMode = currentMode;
  }

  function getMainInputObject() {
    const inputs = StateStore.state.inputs;
    return {
      mode: inputs.mode || 'daily',
      periodInputSource,
      income: U.safeNumber(inputs.income),
      hours: U.safeNumber(inputs.hours),
      trips: U.safeNumber(inputs.trips),
      miles: U.safeNumber(inputs.miles),
      workingDays: Math.max(U.safeNumber(inputs.workingDays), 1),
      avgIncome: U.safeNumber(inputs.avgIncome),
      avgHours: U.safeNumber(inputs.avgHours),
      avgMiles: U.safeNumber(inputs.avgMiles),
      gasPrice: U.safeNumber(inputs.gasPrice),
      mpg: U.safeNumber(inputs.mpg),
      tolls: U.safeNumber(inputs.tolls),
      additional: U.safeNumber(inputs.additional),
      insurance: U.safeNumber(inputs.insurance),
      maintenance: U.safeNumber(inputs.maintenance),
      phone: U.safeNumber(inputs.phone),
      otherFixed: U.safeNumber(inputs.otherFixed),
      selfEmploymentTax: U.safeNumber(inputs.selfEmploymentTax),
      federalTax: U.safeNumber(inputs.federalTax),
      stateTax: U.safeNumber(inputs.stateTax),
      deductionMode: inputs.deductionMode || 'standard',
      mileageRate: U.safeNumber(inputs.mileageRate),
      depreciationPerMile: U.safeNumber(inputs.depreciationPerMile),
      tireWearPerMile: U.safeNumber(inputs.tireWearPerMile),
      brakeWearPerMile: U.safeNumber(inputs.brakeWearPerMile),
      targetDailyProfit: U.safeNumber(inputs.targetDailyProfit),
      targetProfitHour: U.safeNumber(inputs.targetProfitHour),
      targetProfitMile: U.safeNumber(inputs.targetProfitMile)
    };
  }

  function getSharedSettings() {
    const input = getMainInputObject();
    return {
      gasPrice: input.gasPrice,
      mpg: input.mpg,
      tolls: 0,
      additional: 0,
      insurance: input.insurance,
      maintenance: input.maintenance,
      phone: input.phone,
      otherFixed: input.otherFixed,
      selfEmploymentTax: input.selfEmploymentTax,
      federalTax: input.federalTax,
      stateTax: input.stateTax,
      deductionMode: input.deductionMode,
      mileageRate: input.mileageRate,
      depreciationPerMile: input.depreciationPerMile,
      tireWearPerMile: input.tireWearPerMile,
      brakeWearPerMile: input.brakeWearPerMile,
      targetDailyProfit: input.targetDailyProfit,
      targetProfitHour: input.targetProfitHour,
      targetProfitMile: input.targetProfitMile
    };
  }

  function buildScenarioInput(incomeId, hoursId, milesId, tripsId) {
    return {
      ...getSharedSettings(),
      mode: 'daily',
      income: numberValue(incomeId),
      hours: numberValue(hoursId),
      miles: numberValue(milesId),
      trips: numberValue(tripsId),
      workingDays: 1,
      avgIncome: numberValue(incomeId),
      avgHours: numberValue(hoursId),
      avgMiles: numberValue(milesId),
      periodInputSource: 'averages'
    };
  }

  function buildTripDecisionInput(currentInput = getMainInputObject()) {
    return {
      offeredPay: numberValue('tripOfferPay'),
      tripTimeMinutes: numberValue('tripTime'),
      tripMiles: numberValue('tripMiles'),
      pickupMiles: numberValue('tripPickupMiles'),
      pickupTimeMinutes: numberValue('tripPickupTime'),
      tollsParking: numberValue('tripTolls'),
      targetProfitHour: currentInput.targetProfitHour,
      targetProfitMile: currentInput.targetProfitMile,
      gasPrice: currentInput.gasPrice,
      mpg: currentInput.mpg,
      depreciationPerMile: currentInput.depreciationPerMile,
      tireWearPerMile: currentInput.tireWearPerMile,
      brakeWearPerMile: currentInput.brakeWearPerMile
    };
  }

  function renderScenarioComparison(currentResult) {
    UI.renderScenarioComparison(els, [
      { name: 'Current', result: currentResult },
      { name: 'Scenario A', result: U.calculateCore(buildScenarioInput('scenarioAIncome', 'scenarioAHours', 'scenarioAMiles', 'scenarioATrips')) },
      { name: 'Scenario B', result: U.calculateCore(buildScenarioInput('scenarioBIncome', 'scenarioBHours', 'scenarioBMiles', 'scenarioBTrips')) }
    ]);
  }

  function updateStateFromDOM() {
    const data = {};
    inputIds.forEach((id) => {
      if (fields[id]) {
        data[id] = fields[id].value;
      }
    });
    StateStore.updateInputs(data);
  }

  function calculate(activeId = null) {
    try {
      updateStateFromDOM();
      syncMode();
      syncPeriodAmounts(activeId);
      const mainInput = getMainInputObject();
      latestResult = U.calculateCore(mainInput);
      const tripDecision = U.calculateTripDecision(buildTripDecisionInput(mainInput));
      
      try {
        UI.renderResults(els, latestResult, renderScenarioComparison);
      } catch (error) {
        console.error("UI Error in renderResults:", error);
        UI.setElementText(els.savedStatus, "UI Error. Click Reset All.");
        if (els.savedStatus) {
          els.savedStatus.classList.remove('good', 'warn');
          els.savedStatus.classList.add('bad');
        }
      }
      
      try {
        UI.renderTripDecision(els, tripDecision);
      } catch (error) {
        console.error("UI Error in renderTripDecision:", error);
      }
      
      try {
        UI.renderSmartSuggestions(els, U.buildSmartSuggestions(latestResult));
      } catch (error) {
        console.error("UI Error in renderSmartSuggestions:", error);
      }
      
      try {
        UI.setElementText(els.heroReadout, `${latestResult.goalStatus.label} - ${U.money(latestResult.trueNetAfterWear)} true net`);
      } catch (error) {
        console.error("UI Error in heroReadout text:", error);
      }
      
      try {
        renderActiveProTip();
      } catch (error) {
        console.error("UI Error in renderActiveProTip:", error);
      }
      
      saveInputs();
      return latestResult;
    } catch (calcError) {
      console.error("Core calculation error:", calcError);
      UI.setElementText(els.heroReadout, "Calculation error. Click Reset.");
      UI.setElementText(els.savedStatus, "Error. Click Reset All.");
      return null;
    }
  }

  function getActiveTip() {
    const tip = proTips[activeTipIndex] || proTips[0];
    const meta = U.getProfitTipData(latestResult || null)[tip.key] || 'Calculate to personalize this tip.';
    return { ...tip, meta };
  }

  function renderActiveProTip() {
    try {
      UI.renderProTip(els, getActiveTip());
      UI.renderProTipDots(els, proTips, activeTipIndex);
    } catch (error) {
      console.error("UI Error in renderActiveProTip:", error);
    }
  }

  function showTip(index) {
    activeTipIndex = (index + proTips.length) % proTips.length;
    renderActiveProTip();
  }

  function startProTips() {
    if (proTipTimer) window.clearInterval(proTipTimer);
    proTipTimer = window.setInterval(() => {
      if (!proTipsPaused) showTip(activeTipIndex + 1);
    }, 7000);
  }

  function pauseProTips() {
    proTipsPaused = true;
  }

  function resumeProTips() {
    proTipsPaused = false;
  }

  let historyCache = null;

  // ⚡ Bolt: Performance - Store large history arrays as individual items
  function getHistory() {
    if (historyCache !== null) {
      return historyCache;
    }

    const rawHistory = readJson(HISTORY_KEY, []);
    if (!Array.isArray(rawHistory)) {
      safeStorageRemove(HISTORY_KEY, 'Could not clear corrupted shift history');
      historyCache = [];
      return historyCache;
    }

    // Support legacy monolithic array storage format for backward compatibility
    if (rawHistory.length > 0 && typeof rawHistory[0] === 'object' && rawHistory[0] !== null) {
      historyCache = rawHistory
        .filter((entry) => entry && typeof entry === 'object')
        .map((entry, index) => ({
          id: String(entry.id || `${entry.savedAt || 'shift'}-${index}`),
          savedAt: Number.isNaN(new Date(entry.savedAt).getTime()) ? new Date().toISOString() : entry.savedAt,
          mode: ['daily', 'weekly', 'monthly'].includes(entry.mode) ? entry.mode : 'daily',
          income: U.cleanNumber(entry.income),
          hours: U.cleanNumber(entry.hours),
          miles: U.cleanNumber(entry.miles),
          trips: U.cleanNumber(entry.trips),
          gasCost: U.cleanNumber(entry.gasCost),
          totalExpenses: U.cleanNumber(entry.totalExpenses),
          netProfit: U.cleanNumber(entry.netProfit),
          afterTaxProfit: U.cleanNumber(entry.afterTaxProfit),
          trueNetAfterWear: U.cleanNumber(entry.trueNetAfterWear),
          profitPerHour: U.cleanNumber(entry.profitPerHour),
          profitPerMile: U.cleanNumber(entry.profitPerMile)
        }));

      // Migrate to new storage format format immediately
      const idList = historyCache.map(entry => entry.id);
      safeStorageSet(HISTORY_KEY, JSON.stringify(idList), 'Could not migrate shift history');
      historyCache.forEach(entry => safeStorageSet(`uberCalculatorShift_${entry.id}`, JSON.stringify(entry), 'Could not migrate shift'));

      return historyCache;
    }

    // New format: rawHistory is an array of IDs
    // ⚡ Bolt: Performance - Avoid intermediate arrays from map().filter(Boolean)
    historyCache = [];
    for (let i = 0; i < rawHistory.length; i++) {
      const id = rawHistory[i];
      const entryData = safeStorageGet(`uberCalculatorShift_${id}`, null);
      if (!entryData) continue;
      try {
        const entry = typeof entryData === 'string' ? JSON.parse(entryData) : entryData;
        historyCache.push({
          id: String(entry.id || id),
          savedAt: Number.isNaN(new Date(entry.savedAt).getTime()) ? new Date().toISOString() : entry.savedAt,
          mode: ['daily', 'weekly', 'monthly'].includes(entry.mode) ? entry.mode : 'daily',
          income: U.cleanNumber(entry.income),
          hours: U.cleanNumber(entry.hours),
          miles: U.cleanNumber(entry.miles),
          trips: U.cleanNumber(entry.trips),
          gasCost: U.cleanNumber(entry.gasCost),
          totalExpenses: U.cleanNumber(entry.totalExpenses),
          netProfit: U.cleanNumber(entry.netProfit),
          afterTaxProfit: U.cleanNumber(entry.afterTaxProfit),
          trueNetAfterWear: U.cleanNumber(entry.trueNetAfterWear),
          profitPerHour: U.cleanNumber(entry.profitPerHour),
          profitPerMile: U.cleanNumber(entry.profitPerMile)
        });
      } catch (e) {
        // Skip invalid entries
      }
    }

    return historyCache;
  }

  function renderHistory() {
    try {
      UI.renderHistory(els, getHistory());
    } catch (error) {
      console.error("UI Error in renderHistory:", error);
    }
  }

  function renderAnalytics() {
    try {
      UI.renderAnalytics(els, getHistory());
    } catch (error) {
      console.error("UI Error in renderAnalytics:", error);
    }
  }

  function resetForm() {
    if (!confirm('Reset all inputs to their default values?')) return;
    safeStorageRemove(STORAGE_KEY, 'Could not clear saved inputs');
    setInputs(defaults);
    periodInputSource = 'averages';
    lastMode = fields.mode?.value || 'daily';
    UI.setElementText(els.savedStatus, 'Inputs reset');
    calculate();
  }

  function saveResult() {
    const result = latestResult || calculate();
    const history = getHistory();
    // Use cryptographically secure UUID if available, fallback to weak RNG
    const entry = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : (typeof crypto !== 'undefined' && crypto.getRandomValues) ? `${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(16)}` : `${Date.now()}`,
      savedAt: new Date().toISOString(),
      mode: result.mode,
      income: result.income,
      hours: result.hours,
      miles: result.miles,
      trips: result.trips,
      gasCost: result.gasCost,
      totalExpenses: result.totalExpenses,
      netProfit: result.netProfit,
      afterTaxProfit: result.afterTaxProfit,
      trueNetAfterWear: result.trueNetAfterWear,
      profitPerHour: result.profitPerHour,
      profitPerMile: result.profitPerMile
    };

    history.unshift(entry);
    historyCache = history;

    // ⚡ Bolt: Performance - Save individual entry and append ID to list, avoiding full array serialization
    const entrySaved = safeStorageSet(`uberCalculatorShift_${entry.id}`, JSON.stringify(entry), 'Could not save shift');
    let savedHistory = false;
    if (entrySaved) {
       const idList = history.map(e => e.id);
       savedHistory = safeStorageSet(HISTORY_KEY, JSON.stringify(idList), 'Could not save shift history list');
    }
    const savedResult = safeStorageSet(RESULT_KEY, JSON.stringify(result), 'Could not save latest result');
    if (savedHistory && savedResult) {
      UI.setElementText(els.savedStatus, `Shift saved at ${timeFormatter.format(new Date())}`);
      UI.momentaryButtonFeedback(document.getElementById('saveBtn'), 'Saved!');
      renderHistory();
      renderAnalytics();
    }
  }

  function deleteShift(id) {
    const history = getHistory();
    const entry = history.find((e) => e.id === id);
    if (!entry) return;
    const dateStr = U.formatDateTime(entry.savedAt);
    if (!confirm(`Delete saved shift from ${dateStr}?`)) return;

    historyCache = history.filter((e) => e.id !== id);
    safeStorageRemove(`uberCalculatorShift_${id}`, 'Could not delete shift data');
    const idList = historyCache.map(e => e.id);
    safeStorageSet(HISTORY_KEY, JSON.stringify(idList), 'Could not update shift history list');
    renderHistory();
    renderAnalytics();
  }

  function clearHistory() {
    if (!confirm('Clear all saved shift history?')) return;

    const history = getHistory();
    history.forEach(entry => {
      safeStorageRemove(`uberCalculatorShift_${entry.id}`, 'Could not remove shift entry');
    });
    safeStorageRemove(HISTORY_KEY, 'Could not clear history list');

    historyCache = [];
    renderHistory();
    renderAnalytics();
    UI.setElementText(els.savedStatus, 'History cleared');
  }

  function downloadBlob(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    UI.momentaryButtonFeedback(document.getElementById('exportHistoryBtn'), 'Exported!');
  }

  function downloadResult() {
    downloadBlob(U.buildTextReport(latestResult || calculate()), 'uber-earnings-dashboard-report.txt', 'text/plain');
    UI.momentaryButtonFeedback(document.getElementById('downloadBtn'), 'Exported!');
  }

  function exportHistoryCsv() {
    const history = getHistory();
    // ⚡ Bolt: Performance - Avoid spreading large mapped arrays, which creates intermediate allocations and can blow the call stack.
    const rows = new Array(history.length + 1);
    rows[0] = ['Date', 'Mode', 'Income', 'Hours', 'Miles', 'Trips', 'Gas cost', 'Total expenses', 'Net profit', 'After-tax profit', 'True net after wear', 'Profit/hour', 'Profit/mile'];
    for (let i = 0; i < history.length; i++) {
      const entry = history[i];
      rows[i + 1] = [
        U.formatDateTime(entry.savedAt),
        entry.mode,
        entry.income,
        entry.hours,
        entry.miles,
        entry.trips,
        entry.gasCost,
        entry.totalExpenses,
        entry.netProfit,
        entry.afterTaxProfit,
        entry.trueNetAfterWear,
        entry.profitPerHour,
        entry.profitPerMile
      ];
    }
    downloadBlob(U.toCsv(rows), 'uber-shift-history.csv', 'text/csv');
    UI.momentaryButtonFeedback(document.getElementById('exportHistoryBtn'), 'Exported!');
  }

  function applyPreset(name) {
    const presets = {
      corolla: { mpg: 28, insurance: 200, maintenance: 120, phone: 45, depreciationPerMile: 0.12, tireWearPerMile: 0.03, brakeWearPerMile: 0.04 },
      strong: { mode: 'daily', income: 260, hours: 8, miles: 120, trips: 20 },
      conservative: { mode: 'daily', income: 180, hours: 8, miles: 120, trips: 16 },
      bad: { mode: 'daily', income: 130, hours: 8, miles: 130, trips: 13 }
    };
    setInputs(presets[name] || {});
    lastMode = fields.mode?.value || 'daily';
    UI.setElementText(els.savedStatus, 'Preset applied');
    calculate();
    const btn = document.querySelector(`[data-preset="${name}"]`);
    if (btn) UI.momentaryButtonFeedback(btn, 'Applied!');
  }

  function openFeature(feature, targetId) {
    const text = featureDetails[feature] || '';
    UI.setElementText(els.featureDetails, text);
    if (els.featureDetails) els.featureDetails.classList.toggle('active', Boolean(text));
    const target = document.getElementById(targetId);
    if (target) {
      const tabContent = target.closest('.tab-content');
      if (tabContent && !tabContent.classList.contains('active')) {
        const tabBtn = document.getElementById(tabContent.getAttribute('aria-labelledby'));
        if (tabBtn) tabBtn.click();
      }
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function sendAdvisorQuestion(rawQuestion) {
    try {
      const question = U.safeText(rawQuestion).trim();
      if (!question) return;
      const result = latestResult || calculate();
      try {
        UI.appendAdvisorMessage(els.advisorMessages, 'user', question);
        UI.appendAdvisorMessage(els.advisorMessages, 'assistant', U.buildAdvisorReply(question, result));
      } catch (error) {
        console.error("UI Error in sendAdvisorQuestion UI render:", error);
      }
      if (els.advisorInput) {
        els.advisorInput.value = '';
        els.advisorInput.dispatchEvent(new Event('input'));
      }
    } catch (error) {
      console.error("Error in sendAdvisorQuestion logic:", error);
    }
  }

  const debouncedCalculate = U.debounce((id) => {
    calculate(id);
  }, 300);


  function init() {
    window.addEventListener('storage', (event) => {
      if (event.key === HISTORY_KEY) {
        historyCache = null;
        renderHistory();
        renderAnalytics();
      }
    });

    inputIds.forEach((id) => {
      if (id === 'mode' || !fields[id]) return;
      const triggerCalc = () => {
        debouncedCalculate(id);
        UI.setElementText(els.savedStatus, 'Auto-saves inputs');
      };
      fields[id].addEventListener('input', triggerCalc);
      if (fields[id].tagName === 'SELECT') {
        fields[id].addEventListener('change', triggerCalc);
      }
    });

    fields.mode?.addEventListener('change', () => {
      preparePeriodModeAfterModeChange();
      calculate('mode');
    });
    document.getElementById('calculateBtn')?.addEventListener('click', () => {
      calculate();
      UI.momentaryButtonFeedback(document.getElementById('calculateBtn'), 'Calculated!');
    });
    document.getElementById('resetBtn')?.addEventListener('click', resetForm);
    document.getElementById('saveBtn')?.addEventListener('click', saveResult);
    document.getElementById('downloadBtn')?.addEventListener('click', downloadResult);
    document.getElementById('clearHistoryBtn')?.addEventListener('click', clearHistory);
    document.getElementById('exportHistoryBtn')?.addEventListener('click', exportHistoryCsv);
    document.querySelectorAll('[data-preset]').forEach((button) => {
      button.addEventListener('click', () => applyPreset(button.dataset.preset));
    });
    document.querySelectorAll('[data-feature]').forEach((button) => {
      button.addEventListener('click', () => openFeature(button.dataset.feature, button.dataset.jumpTarget));
    });
    els.proTipsCard?.addEventListener('mouseenter', pauseProTips);
    els.proTipsCard?.addEventListener('mouseleave', resumeProTips);
    els.proTipsCard?.addEventListener('focusin', pauseProTips);
    els.proTipsCard?.addEventListener('focusout', resumeProTips);
    els.proTipDots?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-tip-index]');
      if (button) showTip(U.safeNumber(button.dataset.tipIndex));
    });

    if (els.advisorInput && els.advisorSendBtn) {
      const toggleSendBtn = () => {
        const val = els.advisorInput.value;
        const isEmpty = val.trim() === '';
        els.advisorSendBtn.disabled = isEmpty;
        els.advisorSendBtn.title = isEmpty ? 'Enter a question to send' : '';
        if (els.advisorCharCount) {
          els.advisorCharCount.textContent = `${val.length} / 200`;
        }
      };
      els.advisorInput.addEventListener('input', toggleSendBtn);
      toggleSendBtn();
    }

    els.advisorSendBtn?.addEventListener('click', () => sendAdvisorQuestion(els.advisorInput?.value));
    els.advisorInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') sendAdvisorQuestion(els.advisorInput.value);
    });
    document.querySelectorAll('[data-advisor-question]').forEach((button) => {
      button.addEventListener('click', () => sendAdvisorQuestion(button.dataset.advisorQuestion));
    });
    els.historyBody?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-delete-shift]');
      if (button) deleteShift(button.dataset.deleteShift);
    });

    document.querySelectorAll('input[type="number"]').forEach((input) => {
      input.addEventListener('focus', function() {
        this.select();
      });
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          document.getElementById('calculateBtn')?.click();
        }
      });
    });

    // Tab switcher controller
    const tabButtons = Array.from(document.querySelectorAll('.tab-button'));
    const tabContents = document.querySelectorAll('.tab-content');

    function switchTab(targetButton) {
      if (!targetButton) return;
      const targetTab = targetButton.dataset?.tab || targetButton.getAttribute('data-tab');
      if (!targetTab) return;
      tabButtons.forEach((btn) => {
        if (!btn) return;
        const isActive = btn === targetButton;
        if (btn.classList && btn.classList.toggle) btn.classList.toggle('active', isActive);
        if (btn.setAttribute) {
          btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
          btn.setAttribute('tabindex', isActive ? '0' : '-1');
        }
      });
      tabContents.forEach((content) => {
        if (!content) return;
        const isTarget = content.id === `tab-${targetTab}`;
        if (content.classList && content.classList.toggle) content.classList.toggle('active', isTarget);
      });
      if (targetButton.focus) targetButton.focus();
    }

    tabButtons.forEach((button, index) => {
      if (!button || !button.classList || !button.classList.contains) return;
      // Set initial tabindex
      button.setAttribute('tabindex', button.classList.contains('active') ? '0' : '-1');

      button.addEventListener('click', () => switchTab(button));

      button.addEventListener('keydown', (e) => {
        let newIndex;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          newIndex = (index + 1) % tabButtons.length;
          e.preventDefault();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          newIndex = (index - 1 + tabButtons.length) % tabButtons.length;
          e.preventDefault();
        } else if (e.key === 'Home') {
          newIndex = 0;
          e.preventDefault();
        } else if (e.key === 'End') {
          newIndex = tabButtons.length - 1;
          e.preventDefault();
        }

        if (newIndex !== undefined && tabButtons[newIndex]) {
          switchTab(tabButtons[newIndex]);
        }
      });
    });
    restoreInputs();
    lastMode = fields.mode?.value || 'daily';
    calculate();
    renderActiveProTip();
    startProTips();
    renderHistory();
    renderAnalytics();
  }

  init();
