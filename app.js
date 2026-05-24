(function () {
  const U = window.CalculatorUtils;
  const UI = window.CalculatorUI;

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

  let latestResult = null;
  let periodInputSource = 'averages';
  let lastMode = fields.mode?.value || 'daily';
  let activeTipIndex = 0;
  let proTipTimer = null;
  let proTipsPaused = false;

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
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function safeStorageSet(key, value, failureMessage = 'Storage is full or unavailable') {
    try {
      localStorage.setItem(key, value);
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
    return U.safeNumber(fields[id]?.value);
  }

  function getInputs() {
    const data = {};
    inputIds.forEach((id) => {
      data[id] = fields[id]?.value ?? defaults[id] ?? '';
    });
    data.periodInputSource = periodInputSource;
    return data;
  }

  function setInputs(values) {
    Object.entries(values).forEach(([id, value]) => {
      if (fields[id]) fields[id].value = value;
    });
  }

  function saveInputs() {
    safeStorageSet(STORAGE_KEY, JSON.stringify(getInputs()));
  }

  function restoreInputs() {
    const stored = readJson(STORAGE_KEY, null) || readJson(LEGACY_STORAGE_KEY, {});
    const saved = stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
    periodInputSource = saved.periodInputSource === 'totals' ? 'totals' : 'averages';
    setInputs({ ...defaults, ...saved });
  }

  function syncMode() {
    const isDaily = fields.mode?.value === 'daily';
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
  }

  function syncPeriodAmounts(activeId = null) {
    if (fields.mode?.value === 'daily') return;
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
    const currentMode = fields.mode?.value || 'daily';
    if (lastMode === 'daily' && currentMode !== 'daily') {
      fields.avgIncome.value = numberValue('income').toFixed(periodDecimals.avgIncome);
      fields.avgHours.value = numberValue('hours').toFixed(periodDecimals.avgHours);
      fields.avgMiles.value = numberValue('miles').toFixed(periodDecimals.avgMiles);
      periodInputSource = 'averages';
    }
    lastMode = currentMode;
  }

  function getMainInputObject() {
    return {
      mode: fields.mode?.value || 'daily',
      periodInputSource,
      income: numberValue('income'),
      hours: numberValue('hours'),
      trips: numberValue('trips'),
      miles: numberValue('miles'),
      workingDays: Math.max(numberValue('workingDays'), 1),
      avgIncome: numberValue('avgIncome'),
      avgHours: numberValue('avgHours'),
      avgMiles: numberValue('avgMiles'),
      gasPrice: numberValue('gasPrice'),
      mpg: numberValue('mpg'),
      tolls: numberValue('tolls'),
      additional: numberValue('additional'),
      insurance: numberValue('insurance'),
      maintenance: numberValue('maintenance'),
      phone: numberValue('phone'),
      otherFixed: numberValue('otherFixed'),
      selfEmploymentTax: numberValue('selfEmploymentTax'),
      federalTax: numberValue('federalTax'),
      stateTax: numberValue('stateTax'),
      deductionMode: fields.deductionMode?.value || 'standard',
      mileageRate: numberValue('mileageRate'),
      depreciationPerMile: numberValue('depreciationPerMile'),
      tireWearPerMile: numberValue('tireWearPerMile'),
      brakeWearPerMile: numberValue('brakeWearPerMile'),
      targetDailyProfit: numberValue('targetDailyProfit'),
      targetProfitHour: numberValue('targetProfitHour'),
      targetProfitMile: numberValue('targetProfitMile')
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

  function calculate(activeId = null) {
    syncMode();
    syncPeriodAmounts(activeId);
    const mainInput = getMainInputObject();
    latestResult = U.calculateCore(mainInput);
    const tripDecision = U.calculateTripDecision(buildTripDecisionInput(mainInput));
    UI.renderResults(els, latestResult, renderScenarioComparison);
    UI.renderTripDecision(els, tripDecision);
    UI.renderSmartSuggestions(els, U.buildSmartSuggestions(latestResult));
    UI.setElementText(els.heroReadout, `${latestResult.goalStatus.label} - ${U.money(latestResult.trueNetAfterWear)} true net`);
    renderActiveProTip();
    saveInputs();
    return latestResult;
  }

  function getActiveTip() {
    const tip = proTips[activeTipIndex] || proTips[0];
    const meta = U.getProfitTipData(latestResult || null)[tip.key] || 'Calculate to personalize this tip.';
    return { ...tip, meta };
  }

  function renderActiveProTip() {
    UI.renderProTip(els, getActiveTip());
    UI.renderProTipDots(els, proTips, activeTipIndex);
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

  function getHistory() {
    const rawHistory = readJson(HISTORY_KEY, []);
    if (!Array.isArray(rawHistory)) {
      safeStorageRemove(HISTORY_KEY, 'Could not clear corrupted shift history');
      return [];
    }

    return rawHistory
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
  }

  function renderHistory() {
    UI.renderHistory(els, getHistory());
  }

  function renderAnalytics() {
    UI.renderAnalytics(els, getHistory());
  }

  function resetForm() {
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
    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
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
    const savedHistory = safeStorageSet(HISTORY_KEY, JSON.stringify(history), 'Could not save shift history');
    const savedResult = safeStorageSet(RESULT_KEY, JSON.stringify(result), 'Could not save latest result');
    if (savedHistory && savedResult) {
      UI.setElementText(els.savedStatus, `Shift saved at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      renderHistory();
      renderAnalytics();
    }
  }

  function deleteShift(id) {
    const history = getHistory();
    const entry = history.find((e) => e.id === id);
    if (!entry) return;
    const dateStr = new Date(entry.savedAt).toLocaleString();
    if (!confirm(`Delete saved shift from ${dateStr}?`)) return;

    safeStorageSet(HISTORY_KEY, JSON.stringify(history.filter((e) => e.id !== id)), 'Could not delete shift');
    renderHistory();
    renderAnalytics();
  }

  function clearHistory() {
    if (!confirm('Clear all saved shift history?')) return;
    safeStorageRemove(HISTORY_KEY, 'Could not clear history');
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
  }

  function downloadResult() {
    downloadBlob(U.buildTextReport(latestResult || calculate()), 'uber-earnings-dashboard-report.txt', 'text/plain');
  }

  function exportHistoryCsv() {
    const rows = [
      ['Date', 'Mode', 'Income', 'Hours', 'Miles', 'Trips', 'Gas cost', 'Total expenses', 'Net profit', 'After-tax profit', 'True net after wear', 'Profit/hour', 'Profit/mile'],
      ...getHistory().map((entry) => [
        new Date(entry.savedAt).toLocaleString(),
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
      ])
    ];
    downloadBlob(U.toCsv(rows), 'uber-shift-history.csv', 'text/csv');
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
  }

  function openFeature(feature, targetId) {
    const text = featureDetails[feature] || '';
    UI.setElementText(els.featureDetails, text);
    if (els.featureDetails) els.featureDetails.classList.toggle('active', Boolean(text));
    const target = document.getElementById(targetId);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function sendAdvisorQuestion(rawQuestion) {
    const question = U.safeText(rawQuestion).trim();
    if (!question) return;
    const result = latestResult || calculate();
    UI.appendAdvisorMessage(els.advisorMessages, 'user', question);
    UI.appendAdvisorMessage(els.advisorMessages, 'assistant', U.buildAdvisorReply(question, result));
    if (els.advisorInput) els.advisorInput.value = '';
  }

  const debouncedCalculate = U.debounce((id) => {
    calculate(id);
  }, 300);

  inputIds.forEach((id) => {
    if (id === 'mode' || !fields[id]) return;
    fields[id].addEventListener('input', () => {
      debouncedCalculate(id);
      UI.setElementText(els.savedStatus, 'Auto-saves inputs');
    });
  });

  fields.mode?.addEventListener('change', () => {
    preparePeriodModeAfterModeChange();
    calculate('mode');
  });
  document.getElementById('calculateBtn')?.addEventListener('click', () => calculate());
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

  restoreInputs();
  lastMode = fields.mode?.value || 'daily';
  calculate();
  renderActiveProTip();
  startProTips();
  renderHistory();
  renderAnalytics();
}());
