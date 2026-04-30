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
      'scenarioBMiles', 'scenarioBTrips'
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
      mobileTrueHour: document.getElementById('mobileTrueHour')
    };

    let latestResult = null;
    let periodInputSource = 'averages';
    let lastMode = fields.mode.value;

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
      scenarioBTrips: 20
    };

    const periodAverageByTotal = {
      income: 'avgIncome',
      hours: 'avgHours',
      miles: 'avgMiles'
    };

    const periodTotalByAverage = {
      avgIncome: 'income',
      avgHours: 'hours',
      avgMiles: 'miles'
    };

    const periodDecimals = {
      income: 2,
      avgIncome: 2,
      hours: 1,
      avgHours: 1,
      miles: 1,
      avgMiles: 1
    };

    const featureDetails = {
      offline: 'The calculator is a single local HTML file. After it loads, the inputs, calculations, history, and exports work without a server.',
      storage: 'Saved shifts and current inputs stay in this browser on this computer. Use Save result to add a shift and Export history CSV to download the records.',
      taxWear: 'Tax settings estimate set-aside amounts, while vehicle wear settings model hidden mileage costs like depreciation, tires, and maintenance.',
      exports: 'Use Export current TXT for the visible calculation report, or Export history CSV in Shift History for saved shifts.'
    };

    function safeNumber(value, fallback = 0) {
      const number = Number(value);
      return Number.isFinite(number) ? number : fallback;
    }

    function safeDivide(numerator, denominator, fallback = 0) {
      const top = safeNumber(numerator);
      const bottom = safeNumber(denominator);
      return bottom === 0 ? fallback : safeNumber(top / bottom, fallback);
    }

    function safeJSONParse(value, fallback) {
      try {
        return value === null ? fallback : JSON.parse(value);
      } catch (error) {
        return fallback;
      }
    }

    function money(value) {
      const amount = safeNumber(value);
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    }

    function compactMoney(value) {
      const number = safeNumber(value);
      return Math.abs(number) >= 1000 ? `$${Math.round(number).toLocaleString()}` : money(number);
    }

    function pct(value) {
      return `${safeNumber(value).toFixed(1)}%`;
    }

    function numberValue(id) {
      return safeNumber(fields[id]?.value);
    }

    function cleanNumber(value) {
      return safeNumber(value);
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char]));
    }

    function openFeature(feature, targetId) {
      const text = featureDetails[feature] || '';
      els.featureDetails.textContent = text;
      els.featureDetails.classList.toggle('active', Boolean(text));

      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    function getInputs() {
      const data = {};
      inputIds.forEach((id) => {
        data[id] = fields[id].value;
      });
      data.periodInputSource = periodInputSource;
      return data;
    }

    function setInputs(values) {
      Object.entries(values).forEach(([id, value]) => {
        if (fields[id]) {
          fields[id].value = value;
        }
      });
    }

    function saveInputs() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(getInputs()));
      } catch (error) {
        els.savedStatus.textContent = 'Storage is full or unavailable';
      }
    }

    function readJson(key, fallback) {
      try {
        const stored = localStorage.getItem(key);
        return safeJSONParse(stored, fallback);
      } catch (error) {
        localStorage.removeItem(key);
        return fallback;
      }
    }

    function restoreInputs() {
      const saved = readJson(STORAGE_KEY, null) || readJson(LEGACY_STORAGE_KEY, {});
      periodInputSource = saved.periodInputSource === 'totals' ? 'totals' : 'averages';
      setInputs({ ...defaults, ...saved });
    }

    function syncMode() {
      const isDaily = fields.mode.value === 'daily';
      els.periodInputs.classList.toggle('active', !isDaily);

      labels.income.textContent = isDaily ? 'Total Uber income ($)' : 'Calculated income ($)';
      labels.hours.textContent = isDaily ? 'Total working hours' : 'Calculated working hours';
      labels.miles.textContent = isDaily ? 'Total miles driven' : 'Calculated miles driven';
      labels.trips.textContent = isDaily ? 'Number of trips' : 'Average trips per day';
      labels.tolls.textContent = isDaily ? 'Parking/tolls cost ($)' : 'Parking/tolls for period ($)';
      labels.additional.textContent = isDaily ? 'Additional expenses ($)' : 'Additional expenses for period ($)';

      fields.income.readOnly = false;
      fields.hours.readOnly = false;
      fields.miles.readOnly = false;
    }

    function setPeriodFieldValue(id, value, activeId) {
      if (id === activeId) return;
      const safeValue = Number.isFinite(value) ? value : 0;
      fields[id].value = safeValue.toFixed(periodDecimals[id] ?? 2);
    }

    function syncPeriodAmounts(activeId = null) {
      if (fields.mode.value === 'daily') return;

      const workingDays = Math.max(numberValue('workingDays'), 1);

      if (Object.prototype.hasOwnProperty.call(periodAverageByTotal, activeId)) {
        periodInputSource = 'totals';
      } else if (activeId === 'workingDays' || Object.prototype.hasOwnProperty.call(periodTotalByAverage, activeId)) {
        periodInputSource = 'averages';
      }

      if (periodInputSource === 'totals') {
        Object.entries(periodAverageByTotal).forEach(([totalId, averageId]) => {
          setPeriodFieldValue(averageId, safeDivide(numberValue(totalId), workingDays), activeId);
        });
      } else {
        Object.entries(periodTotalByAverage).forEach(([averageId, totalId]) => {
          setPeriodFieldValue(totalId, numberValue(averageId) * workingDays, activeId);
        });
      }
    }

    function preparePeriodModeAfterModeChange() {
      const currentMode = fields.mode.value;

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
        mode: fields.mode.value,
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
        deductionMode: fields.deductionMode.value,
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

    function validateInputs(input) {
      const messages = [];

      if (input.mpg <= 0) messages.push({ text: 'MPG cannot be zero. Gas cost is shown as $0 until MPG is corrected.', type: 'bad' });
      if (input.hours <= 0 && input.mode === 'daily') messages.push({ text: 'Hours cannot be zero if calculating profit per hour.', type: 'warn' });
      if (input.avgHours <= 0 && input.mode !== 'daily') messages.push({ text: 'Average hours cannot be zero if calculating profit per hour.', type: 'warn' });
      if (input.miles <= 0 && input.mode === 'daily') messages.push({ text: 'Miles cannot be zero if calculating profit per mile.', type: 'warn' });
      if (input.avgMiles <= 0 && input.mode !== 'daily') messages.push({ text: 'Average miles cannot be zero if calculating profit per mile.', type: 'warn' });
      if ((input.mode === 'daily' ? input.income : input.avgIncome) < 0) messages.push({ text: 'Income should not be negative. The calculation continues, but check this value.', type: 'bad' });
      if (input.gasPrice < 0) messages.push({ text: 'Gas price should not be negative. The calculation continues, but check this value.', type: 'bad' });

      return messages;
    }

    function resolvePeriod(input) {
      const isDaily = input.mode === 'daily';
      const workingDays = Math.max(cleanNumber(input.workingDays), 1);
      const useTotals = input.periodInputSource === 'totals';

      return {
        workingDays,
        income: isDaily || useTotals ? cleanNumber(input.income) : cleanNumber(input.avgIncome) * workingDays,
        hours: isDaily || useTotals ? cleanNumber(input.hours) : cleanNumber(input.avgHours) * workingDays,
        miles: isDaily || useTotals ? cleanNumber(input.miles) : cleanNumber(input.avgMiles) * workingDays,
        trips: isDaily ? cleanNumber(input.trips) : cleanNumber(input.trips) * workingDays
      };
    }

    function calculateCore(input) {
      const period = resolvePeriod(input);
      const monthlyFixedCosts =
        cleanNumber(input.insurance) +
        cleanNumber(input.maintenance) +
        cleanNumber(input.phone) +
        cleanNumber(input.otherFixed);
      const mpg = cleanNumber(input.mpg);
      const gasUsed = safeDivide(period.miles, mpg);
      const gasCost = gasUsed * cleanNumber(input.gasPrice);
      const variableExpenses = gasCost + cleanNumber(input.tolls) + cleanNumber(input.additional);
      const fixedCostShare = input.mode === 'daily'
        ? safeDivide(monthlyFixedCosts, 22)
        : monthlyFixedCosts * safeDivide(period.workingDays, 22);
      const totalExpenses = variableExpenses + fixedCostShare;
      const netProfit = period.income - totalExpenses;

      // Tax model: compare standard mileage, actual expenses, or no deduction to estimate taxable profit.
      const mileageDeduction = period.miles * cleanNumber(input.mileageRate);
      const actualExpenseDeduction = totalExpenses;
      const selectedDeduction = input.deductionMode === 'standard'
        ? mileageDeduction
        : input.deductionMode === 'actual'
          ? actualExpenseDeduction
          : 0;
      const taxableProfit = Math.max(0, period.income - selectedDeduction);
      const totalTaxRate =
        safeDivide(cleanNumber(input.selfEmploymentTax) + cleanNumber(input.federalTax) + cleanNumber(input.stateTax), 100);
      const estimatedTaxOwed = Math.max(0, taxableProfit * totalTaxRate);
      const suggestedTaxSetAside = Math.max(0, netProfit * totalTaxRate);
      const afterTaxProfit = netProfit - estimatedTaxOwed;

      // Vehicle wear model: hidden per-mile costs are separated from cash expenses.
      const depreciationCost = period.miles * cleanNumber(input.depreciationPerMile);
      const tireWearCost = period.miles * cleanNumber(input.tireWearPerMile);
      const brakeWearCost = period.miles * cleanNumber(input.brakeWearPerMile);
      const wearRate =
        cleanNumber(input.depreciationPerMile) +
        cleanNumber(input.tireWearPerMile) +
        cleanNumber(input.brakeWearPerMile);
      const vehicleWearCost = depreciationCost + tireWearCost + brakeWearCost;
      const trueNetAfterWear = afterTaxProfit - vehicleWearCost;
      const profitPerHour = safeDivide(netProfit, period.hours);
      const profitPerMile = safeDivide(netProfit, period.miles);
      const trueProfitPerHour = safeDivide(trueNetAfterWear, period.hours);
      const trueProfitPerMile = safeDivide(trueNetAfterWear, period.miles);

      // Goal logic converts any period to a daily comparison, then estimates the income gap.
      const dailyNetProfit = input.mode === 'daily' ? netProfit : safeDivide(netProfit, period.workingDays);
      const hitDailyTarget = dailyNetProfit >= cleanNumber(input.targetDailyProfit);
      const incomeNeededForDailyTarget = Math.max(0, cleanNumber(input.targetDailyProfit) - dailyNetProfit);
      const incomeNeededForPeriodTarget = incomeNeededForDailyTarget * (input.mode === 'daily' ? 1 : period.workingDays);
      const hitHourlyTarget = trueProfitPerHour >= cleanNumber(input.targetProfitHour);
      const hitMileTarget = trueProfitPerMile >= cleanNumber(input.targetProfitMile);
      const goalStatus = getGoalStatus({
        trueNetAfterWear,
        trueProfitPerHour,
        trueProfitPerMile,
        targetProfitHour: input.targetProfitHour,
        targetProfitMile: input.targetProfitMile,
        hitDailyTarget
      });
      const recommendation = getRecommendation({
        trueNetAfterWear,
        trueProfitPerHour,
        trueProfitPerMile,
        targetProfitHour: input.targetProfitHour,
        targetProfitMile: input.targetProfitMile,
        hitDailyTarget,
        hitHourlyTarget,
        hitMileTarget
      });

      return {
        mode: input.mode,
        workingDays: period.workingDays,
        income: period.income,
        hours: period.hours,
        trips: period.trips,
        miles: period.miles,
        gasPrice: input.gasPrice,
        mpg,
        gasUsed,
        gasCost,
        tolls: input.tolls,
        additional: input.additional,
        monthlyFixedCosts,
        fixedCostShare,
        variableExpenses,
        totalExpenses,
        netProfit,
        profitPerHour,
        profitPerMile,
        averageIncomePerTrip: safeDivide(period.income, period.trips),
        averageProfitPerTrip: safeDivide(netProfit, period.trips),
        deductionMode: input.deductionMode,
        mileageDeduction,
        actualExpenseDeduction,
        selectedDeduction,
        taxableProfit,
        totalTaxRate,
        estimatedTaxOwed,
        suggestedTaxSetAside,
        afterTaxProfit,
        depreciationCost,
        tireWearCost,
        brakeWearCost,
        vehicleWearCost,
        wearRate,
        trueNetAfterWear,
        trueProfitPerHour,
        trueProfitPerMile,
        targetDailyProfit: input.targetDailyProfit,
        targetProfitHour: input.targetProfitHour,
        targetProfitMile: input.targetProfitMile,
        dailyNetProfit,
        hitDailyTarget,
        incomeNeededForDailyTarget,
        incomeNeededForPeriodTarget,
        hitHourlyTarget,
        hitMileTarget,
        goalStatus,
        recommendation,
        validation: validateInputs(input)
      };
    }

    function getGoalStatus(result) {
      if (result.trueNetAfterWear <= 0 || result.trueProfitPerHour < result.targetProfitHour * 0.72 || result.trueProfitPerMile < result.targetProfitMile * 0.72) {
        return { label: 'Not worth it', type: 'bad' };
      }

      if (result.hitDailyTarget && result.trueProfitPerHour >= result.targetProfitHour && result.trueProfitPerMile >= result.targetProfitMile) {
        return { label: 'Strong shift', type: 'good' };
      }

      return { label: 'Acceptable but weak', type: 'warn' };
    }

    function getRecommendation(result) {
      if (result.trueNetAfterWear <= 0) {
        return { text: 'Bad shift: after taxes and wear, this may not be worth driving.', type: 'bad' };
      }

      if (result.trueProfitPerMile < result.targetProfitMile * 0.75) {
        return { text: 'Weak shift: too many miles for the income earned.', type: 'bad' };
      }

      if (!result.hitHourlyTarget) {
        return { text: 'Okay shift: positive profit, but hourly return is weak.', type: 'warn' };
      }

      if (result.hitDailyTarget && result.hitHourlyTarget && result.hitMileTarget) {
        return { text: 'Excellent shift: strong profit after expenses, taxes, and vehicle wear.', type: 'good' };
      }

      return { text: 'Okay shift: positive profit, but one or more targets are below your goal.', type: 'warn' };
    }

    function setTone(element, value, warningLimit) {
      element.classList.remove('positive', 'negative', 'warning', 'info');
      if (value < 0) element.classList.add('negative');
      else if (typeof warningLimit === 'number' && value < warningLimit) element.classList.add('warning');
      else element.classList.add('positive');
    }

    function renderCard({ label, value, note, type = '', toneValue, warningLimit }) {
      const card = document.createElement('div');
      card.className = `result-card ${type}`;
      card.innerHTML = `
        <strong>${escapeHtml(label)}</strong>
        <span>${escapeHtml(value)}</span>
        ${note ? `<small>${escapeHtml(note)}</small>` : ''}
      `;
      if (toneValue !== undefined) {
        setTone(card.querySelector('span'), toneValue, warningLimit);
      }
      return card;
    }

    function renderResults(result) {
      const cards = [
        { label: 'Total income', value: money(result.income), note: `${result.trips.toFixed(0)} trips`, toneValue: result.income },
        { label: 'Gas cost', value: money(result.gasCost), note: `${result.gasUsed.toFixed(2)} gallons` },
        { label: 'Total expenses', value: money(result.totalExpenses), note: 'Cash expenses plus fixed cost share' },
        { label: 'Net profit', value: money(result.netProfit), toneValue: result.netProfit },
        { label: 'Profit per hour', value: money(result.profitPerHour), toneValue: result.profitPerHour, warningLimit: 15 },
        { label: 'Profit per mile', value: money(result.profitPerMile), toneValue: result.profitPerMile, warningLimit: 1 },
        { label: 'Profit per trip', value: money(result.averageProfitPerTrip), note: `${money(result.averageIncomePerTrip)} income/trip`, toneValue: result.averageProfitPerTrip },
        { label: 'Taxable profit', value: money(result.taxableProfit), note: deductionLabel(result.deductionMode), type: 'tax' },
        { label: 'Estimated tax owed', value: money(result.estimatedTaxOwed), note: `${pct(result.totalTaxRate * 100)} combined rate`, type: 'tax' },
        { label: 'Suggested tax set-aside', value: money(result.suggestedTaxSetAside), note: 'Based on net profit', type: 'tax' },
        { label: 'After-tax profit', value: money(result.afterTaxProfit), toneValue: result.afterTaxProfit, type: 'tax' },
        { label: 'Vehicle wear cost', value: money(result.vehicleWearCost), note: `${money(result.wearRate)} per mile`, type: 'wear' },
        { label: 'True net after wear', value: money(result.trueNetAfterWear), toneValue: result.trueNetAfterWear, type: 'wear' },
        { label: 'True profit per hour', value: money(result.trueProfitPerHour), toneValue: result.trueProfitPerHour, warningLimit: result.targetProfitHour, type: 'wear' },
        { label: 'True profit per mile', value: money(result.trueProfitPerMile), toneValue: result.trueProfitPerMile, warningLimit: result.targetProfitMile, type: 'wear' }
      ];

      els.resultsGrid.replaceChildren(...cards.map(renderCard));
      renderTopSummary(result);
      renderRecommendation(result);
      renderAlerts(result);
      renderSummary(result);
      renderScenarioComparison(result);
    }

    function renderTopSummary(result) {
      const values = [
        [els.topNet, result.netProfit, 0],
        [els.topAfterTax, result.afterTaxProfit, 0],
        [els.topTrueNet, result.trueNetAfterWear, 0],
        [els.topTrueHour, result.trueProfitPerHour, result.targetProfitHour],
        [els.mobileNet, result.netProfit, 0],
        [els.mobileAfterTax, result.afterTaxProfit, 0],
        [els.mobileTrueNet, result.trueNetAfterWear, 0],
        [els.mobileTrueHour, result.trueProfitPerHour, result.targetProfitHour]
      ];

      values.forEach(([element, value, warningLimit]) => {
        element.textContent = compactMoney(value);
        setTone(element, value, warningLimit);
      });
    }

    function renderRecommendation(result) {
      els.recommendation.textContent = result.recommendation.text;
      els.recommendation.className = `recommendation ${result.recommendation.type}`;
    }

    function renderAlerts(result) {
      const messages = [...result.validation];
      const dailyTargetMessage = result.hitDailyTarget
        ? { text: `Daily profit target hit. Daily net is ${money(result.dailyNetProfit)}.`, type: 'good' }
        : { text: `Daily target missed. Need about ${money(result.incomeNeededForDailyTarget)} more income per day, or ${money(result.incomeNeededForPeriodTarget)} for this period.`, type: 'warn' };
      messages.push(dailyTargetMessage);

      if (result.goalStatus.type === 'good') {
        messages.push({ text: 'Strong shift: hourly and mile targets are both in range.', type: 'good' });
      } else if (result.goalStatus.type === 'warn') {
        messages.push({ text: 'Acceptable but weak: positive result, but one target is soft.', type: 'warn' });
      } else {
        messages.push({ text: 'Not worth it: true profit is below your goal settings.', type: 'bad' });
      }

      els.alerts.innerHTML = messages.map((message) => {
        const className = message.type === 'good' ? 'good' : message.type === 'bad' ? 'bad' : message.type === 'info' ? 'info' : '';
        return `<div class="alert ${className}">${escapeHtml(message.text)}</div>`;
      }).join('');
    }

    function deductionLabel(mode) {
      if (mode === 'standard') return 'Standard mileage deduction';
      if (mode === 'actual') return 'Actual expenses deduction';
      return 'No deduction estimate';
    }

    function renderSummary(result) {
      const rows = [
        ['Mode', capitalize(result.mode), 'Selected calculation period'],
        ['Working days', result.mode === 'daily' ? '1 day' : `${result.workingDays} days`, 'Used to scale averages and fixed costs'],
        ['Trips', result.trips.toFixed(0), result.mode === 'daily' ? 'Total trips' : 'Average trips per day multiplied by working days'],
        ['Gas used', `${result.gasUsed.toFixed(2)} gallons`, 'Miles divided by MPG'],
        ['Variable expenses', money(result.variableExpenses), 'Gas, parking/tolls, and additional expenses'],
        ['Fixed cost share', money(result.fixedCostShare), 'Estimated portion of monthly costs'],
        ['Total expenses', money(result.totalExpenses), 'Cash expenses before taxes and wear'],
        ['Average income per trip', money(result.averageIncomePerTrip), 'Income divided by total trips'],
        ['Average profit per trip', money(result.averageProfitPerTrip), 'Net profit divided by total trips'],
        ['Mileage deduction', money(result.mileageDeduction), `${money(safeDivide(result.mileageDeduction, Math.max(result.miles, 1)))} per mile estimate`],
        ['Taxable profit', money(result.taxableProfit), deductionLabel(result.deductionMode)],
        ['Estimated tax owed', money(result.estimatedTaxOwed), `${pct(result.totalTaxRate * 100)} combined rate`],
        ['Suggested set-aside', money(result.suggestedTaxSetAside), 'Useful for planning cash reserves'],
        ['After-tax profit', money(result.afterTaxProfit), 'Net profit minus estimated tax owed'],
        ['Depreciation cost', money(result.depreciationCost), 'Miles multiplied by depreciation per mile'],
        ['Tire wear cost', money(result.tireWearCost), 'Miles multiplied by tire wear per mile'],
        ['Brake/maintenance wear cost', money(result.brakeWearCost), 'Miles multiplied by brake/maintenance wear per mile'],
        ['Vehicle wear cost', money(result.vehicleWearCost), `${money(result.wearRate)} per mile`],
        ['True net after wear', money(result.trueNetAfterWear), 'After-tax profit minus vehicle wear'],
        ['True profit/hour', money(result.trueProfitPerHour), `Target: ${money(result.targetProfitHour)}`],
        ['True profit/mile', money(result.trueProfitPerMile), `Target: ${money(result.targetProfitMile)}`],
        ['Goal status', result.goalStatus.label, 'Based on daily, hourly, and per-mile targets']
      ];

      els.summaryBody.innerHTML = rows.map((row) => `
        <tr>
          <td>${escapeHtml(row[0])}</td>
          <td>${escapeHtml(row[1])}</td>
          <td>${escapeHtml(row[2])}</td>
        </tr>
      `).join('');
    }

    function capitalize(value) {
      return String(value).charAt(0).toUpperCase() + String(value).slice(1);
    }

    function calculate(activeId = null) {
      syncMode();
      syncPeriodAmounts(activeId);
      const input = getMainInputObject();
      latestResult = calculateCore(input);

      renderResults(latestResult);
      saveInputs();
      return latestResult;
    }

    function resetForm() {
      localStorage.removeItem(STORAGE_KEY);
      setInputs(defaults);
      periodInputSource = 'averages';
      lastMode = fields.mode.value;
      els.savedStatus.textContent = 'Inputs reset';
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
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        localStorage.setItem(RESULT_KEY, JSON.stringify(result));
        els.savedStatus.textContent = `Shift saved at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        renderHistory();
        renderAnalytics();
      } catch (error) {
        els.savedStatus.textContent = 'Could not save shift history';
      }
    }

    function getHistory() {
      const rawHistory = readJson(HISTORY_KEY, []);
      if (!Array.isArray(rawHistory)) {
        localStorage.removeItem(HISTORY_KEY);
        return [];
      }

      return rawHistory
        .filter((entry) => entry && typeof entry === 'object')
        .map((entry, index) => ({
          id: String(entry.id || `${entry.savedAt || 'shift'}-${index}`),
          savedAt: Number.isNaN(new Date(entry.savedAt).getTime()) ? new Date().toISOString() : entry.savedAt,
          mode: ['daily', 'weekly', 'monthly'].includes(entry.mode) ? entry.mode : 'daily',
          income: cleanNumber(entry.income),
          hours: cleanNumber(entry.hours),
          miles: cleanNumber(entry.miles),
          trips: cleanNumber(entry.trips),
          gasCost: cleanNumber(entry.gasCost),
          totalExpenses: cleanNumber(entry.totalExpenses),
          netProfit: cleanNumber(entry.netProfit),
          afterTaxProfit: cleanNumber(entry.afterTaxProfit),
          trueNetAfterWear: cleanNumber(entry.trueNetAfterWear),
          profitPerHour: cleanNumber(entry.profitPerHour),
          profitPerMile: cleanNumber(entry.profitPerMile)
        }));
    }

    function renderHistory() {
      const history = getHistory();
      els.historyEmpty.style.display = history.length ? 'none' : 'block';
      els.historyBody.innerHTML = history.map((entry) => `
        <tr>
          <td>${escapeHtml(new Date(entry.savedAt).toLocaleString())}</td>
          <td>${money(entry.income)}</td>
          <td>${entry.hours.toFixed(1)}</td>
          <td>${entry.miles.toFixed(1)}</td>
          <td>${money(entry.netProfit)}</td>
          <td>${money(entry.afterTaxProfit)}</td>
          <td>${money(entry.trueNetAfterWear)}</td>
          <td>${money(entry.profitPerHour)}</td>
          <td><button class="small danger" type="button" data-delete-shift="${escapeHtml(entry.id)}">Delete</button></td>
        </tr>
      `).join('');
    }

    function deleteShift(id) {
      const history = getHistory().filter((entry) => entry.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      renderHistory();
      renderAnalytics();
    }

    function clearHistory() {
      if (!confirm('Clear all saved shift history?')) return;
      localStorage.removeItem(HISTORY_KEY);
      renderHistory();
      renderAnalytics();
      els.savedStatus.textContent = 'History cleared';
    }

    function renderAnalytics() {
      const history = getHistory();
      const totals = history.reduce((acc, entry) => {
        acc.income += entry.income;
        acc.miles += entry.miles;
        acc.hours += entry.hours;
        acc.gasCost += entry.gasCost;
        acc.totalExpenses += entry.totalExpenses;
        acc.netProfit += entry.netProfit;
        acc.afterTaxProfit += entry.afterTaxProfit;
        return acc;
      }, {
        income: 0,
        miles: 0,
        hours: 0,
        gasCost: 0,
        totalExpenses: 0,
        netProfit: 0,
        afterTaxProfit: 0
      });

      const best = history.reduce((winner, entry) => !winner || entry.trueNetAfterWear > winner.trueNetAfterWear ? entry : winner, null);
      const worst = history.reduce((loser, entry) => !loser || entry.trueNetAfterWear < loser.trueNetAfterWear ? entry : loser, null);
      const averageHour = safeDivide(totals.netProfit, totals.hours);
      const averageMile = safeDivide(totals.netProfit, totals.miles);
      const averageNetShift = safeDivide(totals.netProfit, history.length);

      const metrics = [
        ['Total saved shifts', history.length.toString()],
        ['Total income', money(totals.income)],
        ['Total miles', totals.miles.toFixed(1)],
        ['Total hours', totals.hours.toFixed(1)],
        ['Total gas cost', money(totals.gasCost)],
        ['Total expenses', money(totals.totalExpenses)],
        ['Total net profit', money(totals.netProfit)],
        ['Total after-tax', money(totals.afterTaxProfit)],
        ['Avg profit/hour', money(averageHour)],
        ['Avg profit/mile', money(averageMile)],
        ['Best shift', best ? money(best.trueNetAfterWear) : '$0.00'],
        ['Worst shift', worst ? money(worst.trueNetAfterWear) : '$0.00'],
        ['Avg net/shift', money(averageNetShift)]
      ];

      els.analyticsGrid.innerHTML = metrics.map(([label, value]) => `
        <div class="metric">
          <strong>${escapeHtml(label)}</strong>
          <span>${escapeHtml(value)}</span>
        </div>
      `).join('');
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
        avgMiles: numberValue(milesId)
      };
    }

    function renderScenarioComparison(currentResult) {
      const scenarioInputs = [
        { name: 'Current', result: currentResult },
        { name: 'Scenario A', result: calculateCore(buildScenarioInput('scenarioAIncome', 'scenarioAHours', 'scenarioAMiles', 'scenarioATrips')) },
        { name: 'Scenario B', result: calculateCore(buildScenarioInput('scenarioBIncome', 'scenarioBHours', 'scenarioBMiles', 'scenarioBTrips')) }
      ];

      const bestIndex = scenarioInputs.reduce((winnerIndex, item, index, list) => (
        item.result.trueNetAfterWear > list[winnerIndex].result.trueNetAfterWear ? index : winnerIndex
      ), 0);
      els.scenarioBody.innerHTML = scenarioInputs.map((item, index) => {
        const isBest = index === bestIndex;
        return `
          <tr class="${isBest ? 'best-row' : ''}">
            <td>${escapeHtml(item.name)}${isBest ? ' â€¢ Best' : ''}</td>
            <td>${money(item.result.income)}</td>
            <td>${money(item.result.totalExpenses)}</td>
            <td>${money(item.result.netProfit)}</td>
            <td>${money(item.result.afterTaxProfit)}</td>
            <td>${money(item.result.trueNetAfterWear)}</td>
            <td>${money(item.result.trueProfitPerHour)}</td>
            <td>${money(item.result.trueProfitPerMile)}</td>
          </tr>
        `;
      }).join('');
    }

    function toCsv(rows) {
      return rows.map((row) => row.map((cell) => {
        const value = String(cell ?? '');
        return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(',')).join('\n');
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

    function buildTextReport() {
      const result = latestResult || calculate();
      return [
        'Uber Earnings & Expense Calculator Report',
        `Date: ${new Date().toLocaleString()}`,
        `Mode: ${capitalize(result.mode)}`,
        '',
        'Inputs',
        `Income: ${money(result.income)}`,
        `Hours: ${result.hours.toFixed(1)}`,
        `Miles: ${result.miles.toFixed(1)}`,
        `Trips: ${result.trips.toFixed(0)}`,
        `Gas price: ${money(result.gasPrice)} / gallon`,
        `MPG: ${result.mpg}`,
        '',
        'Expenses',
        `Gas used: ${result.gasUsed.toFixed(2)} gallons`,
        `Gas cost: ${money(result.gasCost)}`,
        `Parking/tolls: ${money(result.tolls)}`,
        `Additional expenses: ${money(result.additional)}`,
        `Fixed cost share: ${money(result.fixedCostShare)}`,
        `Total expenses: ${money(result.totalExpenses)}`,
        `Net profit: ${money(result.netProfit)}`,
        '',
        'Taxes',
        `Deduction mode: ${deductionLabel(result.deductionMode)}`,
        `Selected deduction: ${money(result.selectedDeduction)}`,
        `Estimated taxable profit: ${money(result.taxableProfit)}`,
        `Estimated tax owed: ${money(result.estimatedTaxOwed)}`,
        `Suggested tax set-aside: ${money(result.suggestedTaxSetAside)}`,
        `After-tax profit: ${money(result.afterTaxProfit)}`,
        '',
        'Depreciation / Wear',
        `Wear rate: ${money(result.wearRate)} per mile`,
        `Total vehicle wear cost: ${money(result.vehicleWearCost)}`,
        `True net after wear: ${money(result.trueNetAfterWear)}`,
        `True profit per hour: ${money(result.trueProfitPerHour)}`,
        `True profit per mile: ${money(result.trueProfitPerMile)}`,
        '',
        'Goal Result',
        `Daily target hit: ${result.hitDailyTarget ? 'Yes' : 'No'}`,
        `Income needed for daily target: ${money(result.incomeNeededForDailyTarget)}`,
        `Shift rating: ${result.goalStatus.label}`,
        '',
        'Final Recommendation',
        result.recommendation.text,
        '',
        'Notes',
        'This is an estimate, not financial, tax, or legal advice.'
      ].join('\n');
    }

    function downloadResult() {
      downloadBlob(buildTextReport(), 'uber-earnings-dashboard-report.txt', 'text/plain');
    }

    function exportHistoryCsv() {
      const history = getHistory();
      const rows = [
        ['Date', 'Mode', 'Income', 'Hours', 'Miles', 'Trips', 'Gas cost', 'Total expenses', 'Net profit', 'After-tax profit', 'True net after wear', 'Profit/hour', 'Profit/mile'],
        ...history.map((entry) => [
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

      downloadBlob(toCsv(rows), 'uber-shift-history.csv', 'text/csv');
    }

    function applyPreset(name) {
      const presets = {
        corolla: {
          mpg: 28,
          insurance: 200,
          maintenance: 120,
          phone: 45,
          depreciationPerMile: 0.12,
          tireWearPerMile: 0.03,
          brakeWearPerMile: 0.04
        },
        strong: {
          mode: 'daily',
          income: 260,
          hours: 8,
          miles: 120,
          trips: 20
        },
        conservative: {
          mode: 'daily',
          income: 180,
          hours: 8,
          miles: 120,
          trips: 16
        },
        bad: {
          mode: 'daily',
          income: 130,
          hours: 8,
          miles: 130,
          trips: 13
        }
      };

      setInputs(presets[name] || {});
      lastMode = fields.mode.value;
      els.savedStatus.textContent = 'Preset applied';
      calculate();
    }

    inputIds.forEach((id) => {
      if (id === 'mode') return;
      fields[id].addEventListener('input', () => {
        calculate(id);
        els.savedStatus.textContent = 'Auto-saves inputs';
      });
    });

    fields.mode.addEventListener('change', () => {
      preparePeriodModeAfterModeChange();
      calculate('mode');
    });
    document.getElementById('calculateBtn').addEventListener('click', calculate);
    document.getElementById('resetBtn').addEventListener('click', resetForm);
    document.getElementById('saveBtn').addEventListener('click', saveResult);
    document.getElementById('downloadBtn').addEventListener('click', downloadResult);
    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);
    document.getElementById('exportHistoryBtn').addEventListener('click', exportHistoryCsv);

    document.querySelectorAll('[data-preset]').forEach((button) => {
      button.addEventListener('click', () => applyPreset(button.dataset.preset));
    });

    document.querySelectorAll('[data-feature]').forEach((button) => {
      button.addEventListener('click', () => {
        openFeature(button.dataset.feature, button.dataset.jumpTarget);
      });
    });

    els.historyBody.addEventListener('click', (event) => {
      const button = event.target.closest('[data-delete-shift]');
      if (button) deleteShift(button.dataset.deleteShift);
    });

    restoreInputs();
    lastMode = fields.mode.value;
    calculate();
    renderHistory();
    renderAnalytics();
