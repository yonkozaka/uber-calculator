(function () {
  const Utils = {};

  Utils.safeNumber = function safeNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  };

  Utils.safeText = function safeText(value, fallback = '') {
    if (value === undefined || value === null) return fallback;
    return String(value);
  };

  Utils.safeDivide = function safeDivide(numerator, denominator, fallback = 0) {
    const top = Utils.safeNumber(numerator);
    const bottom = Utils.safeNumber(denominator);
    return bottom === 0 ? fallback : Utils.safeNumber(top / bottom, fallback);
  };

  Utils.safeJSONParse = function safeJSONParse(value, fallback) {
    try {
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  };

  Utils.formatMoney = function formatMoney(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Utils.safeNumber(value));
  };

  Utils.money = Utils.formatMoney;

  Utils.compactMoney = function compactMoney(value) {
    const number = Utils.safeNumber(value);
    return Math.abs(number) >= 1000 ? `$${Math.round(number).toLocaleString()}` : Utils.money(number);
  };

  Utils.pct = function pct(value) {
    return `${Utils.safeNumber(value).toFixed(1)}%`;
  };

  Utils.cleanNumber = function cleanNumber(value) {
    return Utils.safeNumber(value);
  };

  Utils.escapeHtml = function escapeHtml(value) {
    return Utils.safeText(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));
  };

  Utils.capitalize = function capitalize(value) {
    const text = Utils.safeText(value);
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  Utils.toCsv = function toCsv(rows) {
    return rows.map((row) => row.map((cell) => {
      const value = String(cell ?? '');
      return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    }).join(',')).join('\n');
  };

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
    const workingDays = Math.max(Utils.cleanNumber(input.workingDays), 1);
    const useTotals = input.periodInputSource === 'totals';

    return {
      workingDays,
      income: isDaily || useTotals ? Utils.cleanNumber(input.income) : Utils.cleanNumber(input.avgIncome) * workingDays,
      hours: isDaily || useTotals ? Utils.cleanNumber(input.hours) : Utils.cleanNumber(input.avgHours) * workingDays,
      miles: isDaily || useTotals ? Utils.cleanNumber(input.miles) : Utils.cleanNumber(input.avgMiles) * workingDays,
      trips: isDaily ? Utils.cleanNumber(input.trips) : Utils.cleanNumber(input.trips) * workingDays
    };
  }

  function getGoalStatus(result) {
    if (result.trueNetAfterWear <= 0) return { label: 'Not worth it', type: 'bad' };
    if (result.trueProfitPerHour < Utils.cleanNumber(result.targetProfitHour) || result.trueProfitPerMile < Utils.cleanNumber(result.targetProfitMile)) {
      return { label: 'Needs caution', type: 'warn' };
    }
    if (!result.hitDailyTarget) return { label: 'Below daily target', type: 'warn' };
    return { label: 'Worth it', type: 'good' };
  }

  function getRecommendation(result) {
    if (result.trueNetAfterWear <= 0) {
      return { text: 'Not worth it: after taxes and vehicle wear, this shift is losing money.', type: 'bad' };
    }

    if (result.trueProfitPerHour < Utils.cleanNumber(result.targetProfitHour) && result.trueProfitPerMile < Utils.cleanNumber(result.targetProfitMile)) {
      return { text: 'Weak shift: true profit is positive, but both hourly and per-mile targets are below goal.', type: 'bad' };
    }

    if (result.trueProfitPerHour < Utils.cleanNumber(result.targetProfitHour)) {
      return { text: 'Okay shift: positive profit, but hourly return is weak.', type: 'warn' };
    }

    if (result.hitDailyTarget && result.hitHourlyTarget && result.hitMileTarget) {
      return { text: 'Excellent shift: strong profit after expenses, taxes, and vehicle wear.', type: 'good' };
    }

    return { text: 'Okay shift: positive profit, but one or more targets are below your goal.', type: 'warn' };
  }

  Utils.calculateCore = function calculateCore(input) {
    const period = resolvePeriod(input);
    const monthlyFixedCosts =
      Utils.cleanNumber(input.insurance) +
      Utils.cleanNumber(input.maintenance) +
      Utils.cleanNumber(input.phone) +
      Utils.cleanNumber(input.otherFixed);
    const mpg = Utils.cleanNumber(input.mpg);
    const gasUsed = Utils.safeDivide(period.miles, mpg);
    const gasCost = gasUsed * Utils.cleanNumber(input.gasPrice);
    const variableExpenses = gasCost + Utils.cleanNumber(input.tolls) + Utils.cleanNumber(input.additional);
    const fixedCostShare = input.mode === 'daily'
      ? Utils.safeDivide(monthlyFixedCosts, 22)
      : monthlyFixedCosts * Utils.safeDivide(period.workingDays, 22);
    const totalExpenses = variableExpenses + fixedCostShare;
    const netProfit = period.income - totalExpenses;

    const mileageDeduction = period.miles * Utils.cleanNumber(input.mileageRate);
    const actualExpenseDeduction = totalExpenses;
    const selectedDeduction = input.deductionMode === 'standard'
      ? mileageDeduction
      : input.deductionMode === 'actual'
        ? actualExpenseDeduction
        : 0;
    const taxableProfit = Math.max(0, period.income - selectedDeduction);
    const totalTaxRate = Utils.safeDivide(
      Utils.cleanNumber(input.selfEmploymentTax) + Utils.cleanNumber(input.federalTax) + Utils.cleanNumber(input.stateTax),
      100
    );
    const estimatedTaxOwed = Math.max(0, taxableProfit * totalTaxRate);
    const suggestedTaxSetAside = Math.max(0, netProfit * totalTaxRate);
    const afterTaxProfit = netProfit - estimatedTaxOwed;

    const depreciationCost = period.miles * Utils.cleanNumber(input.depreciationPerMile);
    const tireWearCost = period.miles * Utils.cleanNumber(input.tireWearPerMile);
    const brakeWearCost = period.miles * Utils.cleanNumber(input.brakeWearPerMile);
    const wearRate =
      Utils.cleanNumber(input.depreciationPerMile) +
      Utils.cleanNumber(input.tireWearPerMile) +
      Utils.cleanNumber(input.brakeWearPerMile);
    const vehicleWearCost = depreciationCost + tireWearCost + brakeWearCost;
    const trueNetAfterWear = afterTaxProfit - vehicleWearCost;
    const profitPerHour = Utils.safeDivide(netProfit, period.hours);
    const profitPerMile = Utils.safeDivide(netProfit, period.miles);
    const trueProfitPerHour = Utils.safeDivide(trueNetAfterWear, period.hours);
    const trueProfitPerMile = Utils.safeDivide(trueNetAfterWear, period.miles);

    const dailyNetProfit = input.mode === 'daily' ? netProfit : Utils.safeDivide(netProfit, period.workingDays);
    const hitDailyTarget = dailyNetProfit >= Utils.cleanNumber(input.targetDailyProfit);
    const incomeNeededForDailyTarget = Math.max(0, Utils.cleanNumber(input.targetDailyProfit) - dailyNetProfit);
    const incomeNeededForPeriodTarget = incomeNeededForDailyTarget * (input.mode === 'daily' ? 1 : period.workingDays);
    const hitHourlyTarget = trueProfitPerHour >= Utils.cleanNumber(input.targetProfitHour);
    const hitMileTarget = trueProfitPerMile >= Utils.cleanNumber(input.targetProfitMile);

    const result = {
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
      averageIncomePerTrip: Utils.safeDivide(period.income, period.trips),
      averageProfitPerTrip: Utils.safeDivide(netProfit, period.trips),
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
      wearRate,
      vehicleWearCost,
      trueNetAfterWear,
      trueProfitPerHour,
      trueProfitPerMile,
      dailyNetProfit,
      hitDailyTarget,
      incomeNeededForDailyTarget,
      incomeNeededForPeriodTarget,
      hitHourlyTarget,
      hitMileTarget,
      targetProfitHour: input.targetProfitHour,
      targetProfitMile: input.targetProfitMile,
      targetDailyProfit: input.targetDailyProfit,
      validation: validateInputs(input)
    };

    result.goalStatus = getGoalStatus(result);
    result.recommendation = getRecommendation(result);
    return result;
  };

  Utils.deductionLabel = function deductionLabel(mode) {
    if (mode === 'standard') return 'Standard mileage deduction';
    if (mode === 'actual') return 'Actual expenses deduction';
    return 'No deduction estimate';
  };

  Utils.buildTextReport = function buildTextReport(result) {
    return [
      'Uber Earnings & Expense Calculator Report',
      `Date: ${new Date().toLocaleString()}`,
      `Mode: ${Utils.capitalize(result.mode)}`,
      '',
      'Inputs',
      `Income: ${Utils.money(result.income)}`,
      `Hours: ${Utils.safeNumber(result.hours).toFixed(1)}`,
      `Miles: ${Utils.safeNumber(result.miles).toFixed(1)}`,
      `Trips: ${Utils.safeNumber(result.trips).toFixed(0)}`,
      `Gas price: ${Utils.money(result.gasPrice)} / gallon`,
      `MPG: ${Utils.safeNumber(result.mpg)}`,
      '',
      'Expenses',
      `Gas used: ${Utils.safeNumber(result.gasUsed).toFixed(2)} gallons`,
      `Gas cost: ${Utils.money(result.gasCost)}`,
      `Parking/tolls: ${Utils.money(result.tolls)}`,
      `Additional expenses: ${Utils.money(result.additional)}`,
      `Fixed cost share: ${Utils.money(result.fixedCostShare)}`,
      `Total expenses: ${Utils.money(result.totalExpenses)}`,
      `Net profit: ${Utils.money(result.netProfit)}`,
      '',
      'Taxes',
      `Deduction mode: ${Utils.deductionLabel(result.deductionMode)}`,
      `Selected deduction: ${Utils.money(result.selectedDeduction)}`,
      `Estimated taxable profit: ${Utils.money(result.taxableProfit)}`,
      `Estimated tax owed: ${Utils.money(result.estimatedTaxOwed)}`,
      `Suggested tax set-aside: ${Utils.money(result.suggestedTaxSetAside)}`,
      `After-tax profit: ${Utils.money(result.afterTaxProfit)}`,
      '',
      'Depreciation / Wear',
      `Wear rate: ${Utils.money(result.wearRate)} per mile`,
      `Total vehicle wear cost: ${Utils.money(result.vehicleWearCost)}`,
      `True net after wear: ${Utils.money(result.trueNetAfterWear)}`,
      `True profit per hour: ${Utils.money(result.trueProfitPerHour)}`,
      `True profit per mile: ${Utils.money(result.trueProfitPerMile)}`,
      '',
      'Goal Result',
      `Daily target hit: ${result.hitDailyTarget ? 'Yes' : 'No'}`,
      `Income needed for daily target: ${Utils.money(result.incomeNeededForDailyTarget)}`,
      `Shift rating: ${result.goalStatus.label}`,
      '',
      'Final Recommendation',
      result.recommendation.text,
      '',
      'Notes',
      'This is an estimate, not financial, tax, or legal advice.'
    ].join('\n');
  };

  window.CalculatorUtils = Utils;
}());
