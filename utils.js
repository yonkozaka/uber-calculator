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

  Utils.debounce = function debounce(func, wait = 300) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  const moneyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  const compactMoneyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  });

  Utils.formatDateTime = function formatDateTime(dateInput) {
    const dateObj = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return isNaN(dateObj.getTime()) ? '' : dateFormatter.format(dateObj);
  };

  Utils.formatMoney = function formatMoney(value) {
    return moneyFormatter.format(Utils.safeNumber(value));
  };

  Utils.money = Utils.formatMoney;

  Utils.compactMoney = function compactMoney(value) {
    const number = Utils.safeNumber(value);
    return Math.abs(number) >= 1000 ? compactMoneyFormatter.format(Math.round(number)) : Utils.money(number);
  };

  Utils.pct = function pct(value) {
    return `${Utils.safeNumber(value).toFixed(1)}%`;
  };

  Utils.cleanNumber = function cleanNumber(value) {
    return Utils.safeNumber(value);
  };

  const htmlMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  Utils.escapeHtml = function escapeHtml(value) {
    return Utils.safeText(value).replace(/[&<>"']/g, (char) => htmlMap[char]);
  };

  Utils.capitalize = function capitalize(value) {
    const text = Utils.safeText(value);
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  Utils.toCsv = function toCsv(rows) {
    return rows.map((row) => row.map((cell) => {
      let value = String(cell ?? '');
      // Prevent CSV Injection: prepend single quote to formula-like inputs
      if (/^\s*[=+\-@]/.test(value) && isNaN(Number(value))) {
        value = `'${value}`;
      }
      return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
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


  Utils.calculateWearRate = function calculateWearRate(input) {
    return Utils.cleanNumber(input.depreciationPerMile) +
      Utils.cleanNumber(input.tireWearPerMile) +
      Utils.cleanNumber(input.brakeWearPerMile);
  };

  Utils.evaluateTargets = function evaluateTargets(hourlyRate, mileRate, input) {
    const targetProfitHour = Utils.cleanNumber(input.targetProfitHour);
    const targetProfitMile = Utils.cleanNumber(input.targetProfitMile);
    const hitHourlyTarget = hourlyRate >= targetProfitHour;
    const hitMileTarget = mileRate >= targetProfitMile;
    return { targetProfitHour, targetProfitMile, hitHourlyTarget, hitMileTarget };
  };

  function calculateExpenses(input, period) {
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
    return {
      monthlyFixedCosts, mpg, gasUsed, gasCost, variableExpenses, fixedCostShare, totalExpenses, netProfit
    };
  }

  function calculateTaxes(input, period, totalExpenses, netProfit) {
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
    return {
      mileageDeduction, actualExpenseDeduction, selectedDeduction, taxableProfit, totalTaxRate, estimatedTaxOwed, suggestedTaxSetAside, afterTaxProfit
    };
  }

  function calculateWear(input, period, afterTaxProfit, netProfit) {
    const depreciationCost = period.miles * Utils.cleanNumber(input.depreciationPerMile);
    const tireWearCost = period.miles * Utils.cleanNumber(input.tireWearPerMile);
    const brakeWearCost = period.miles * Utils.cleanNumber(input.brakeWearPerMile);
    const wearRate = Utils.calculateWearRate(input);
    const vehicleWearCost = depreciationCost + tireWearCost + brakeWearCost;
    const trueNetAfterWear = afterTaxProfit - vehicleWearCost;
    const profitPerHour = Utils.safeDivide(netProfit, period.hours);
    const profitPerMile = Utils.safeDivide(netProfit, period.miles);
    const trueProfitPerHour = Utils.safeDivide(trueNetAfterWear, period.hours);
    const trueProfitPerMile = Utils.safeDivide(trueNetAfterWear, period.miles);
    return {
      depreciationCost, tireWearCost, brakeWearCost, wearRate, vehicleWearCost, trueNetAfterWear, profitPerHour, profitPerMile, trueProfitPerHour, trueProfitPerMile
    };
  }

  function calculateTargets(input, period, netProfit, trueProfitPerHour, trueProfitPerMile) {
    const dailyNetProfit = input.mode === 'daily' ? netProfit : Utils.safeDivide(netProfit, period.workingDays);
    const hitDailyTarget = dailyNetProfit >= Utils.cleanNumber(input.targetDailyProfit);
    const incomeNeededForDailyTarget = Math.max(0, Utils.cleanNumber(input.targetDailyProfit) - dailyNetProfit);
    const incomeNeededForPeriodTarget = incomeNeededForDailyTarget * (input.mode === 'daily' ? 1 : period.workingDays);
    const { targetProfitHour, targetProfitMile, hitHourlyTarget, hitMileTarget } = Utils.evaluateTargets(trueProfitPerHour, trueProfitPerMile, input);
    return {
      dailyNetProfit, hitDailyTarget, incomeNeededForDailyTarget, incomeNeededForPeriodTarget, targetProfitHour, targetProfitMile, hitHourlyTarget, hitMileTarget
    };
  }

  Utils.calculateCore = function calculateCore(input) {
    const period = resolvePeriod(input);

    const expenses = calculateExpenses(input, period);
    const taxes = calculateTaxes(input, period, expenses.totalExpenses, expenses.netProfit);
    const wear = calculateWear(input, period, taxes.afterTaxProfit, expenses.netProfit);
    const targets = calculateTargets(input, period, expenses.netProfit, wear.trueProfitPerHour, wear.trueProfitPerMile);

    const result = {
      mode: input.mode,
      workingDays: period.workingDays,
      income: period.income,
      hours: period.hours,
      trips: period.trips,
      miles: period.miles,
      gasPrice: input.gasPrice,
      mpg: expenses.mpg,
      gasUsed: expenses.gasUsed,
      gasCost: expenses.gasCost,
      tolls: input.tolls,
      additional: input.additional,
      monthlyFixedCosts: expenses.monthlyFixedCosts,
      fixedCostShare: expenses.fixedCostShare,
      variableExpenses: expenses.variableExpenses,
      totalExpenses: expenses.totalExpenses,
      netProfit: expenses.netProfit,
      profitPerHour: wear.profitPerHour,
      profitPerMile: wear.profitPerMile,
      averageIncomePerTrip: Utils.safeDivide(period.income, period.trips),
      averageProfitPerTrip: Utils.safeDivide(expenses.netProfit, period.trips),
      deductionMode: input.deductionMode,
      mileageDeduction: taxes.mileageDeduction,
      actualExpenseDeduction: taxes.actualExpenseDeduction,
      selectedDeduction: taxes.selectedDeduction,
      taxableProfit: taxes.taxableProfit,
      totalTaxRate: taxes.totalTaxRate,
      estimatedTaxOwed: taxes.estimatedTaxOwed,
      suggestedTaxSetAside: taxes.suggestedTaxSetAside,
      afterTaxProfit: taxes.afterTaxProfit,
      depreciationCost: wear.depreciationCost,
      tireWearCost: wear.tireWearCost,
      brakeWearCost: wear.brakeWearCost,
      wearRate: wear.wearRate,
      vehicleWearCost: wear.vehicleWearCost,
      trueNetAfterWear: wear.trueNetAfterWear,
      trueProfitPerHour: wear.trueProfitPerHour,
      trueProfitPerMile: wear.trueProfitPerMile,
      dailyNetProfit: targets.dailyNetProfit,
      hitDailyTarget: targets.hitDailyTarget,
      incomeNeededForDailyTarget: targets.incomeNeededForDailyTarget,
      incomeNeededForPeriodTarget: targets.incomeNeededForPeriodTarget,
      hitHourlyTarget: targets.hitHourlyTarget,
      hitMileTarget: targets.hitMileTarget,
      targetProfitHour: targets.targetProfitHour,
      targetProfitMile: targets.targetProfitMile,
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

  Utils.calculateTripDecision = function calculateTripDecision(input) {
    const offeredPay = Utils.cleanNumber(input.offeredPay);
    const tripTimeMinutes = Utils.cleanNumber(input.tripTimeMinutes);
    const tripMiles = Utils.cleanNumber(input.tripMiles);
    const pickupMiles = Utils.cleanNumber(input.pickupMiles);
    const pickupTimeMinutes = Utils.cleanNumber(input.pickupTimeMinutes);
    const tollsParking = Utils.cleanNumber(input.tollsParking);
    const totalTimeMinutes = tripTimeMinutes + pickupTimeMinutes;
    const totalHours = Utils.safeDivide(totalTimeMinutes, 60);
    const totalMiles = tripMiles + pickupMiles;
    const mpg = Utils.cleanNumber(input.mpg);
    const gasCost = mpg > 0 ? Utils.safeDivide(totalMiles, mpg) * Utils.cleanNumber(input.gasPrice) : 0;
    const wearRate = Utils.calculateWearRate(input);
    const vehicleWearCost = totalMiles * wearRate;
    const trueProfit = offeredPay - gasCost - vehicleWearCost - tollsParking;
    const payPerHour = Utils.safeDivide(offeredPay, totalHours);
    const payPerMile = Utils.safeDivide(offeredPay, totalMiles);
    const trueProfitPerHour = Utils.safeDivide(trueProfit, totalHours);
    const trueProfitPerMile = Utils.safeDivide(trueProfit, totalMiles);
    const { targetProfitHour, targetProfitMile, hitHourlyTarget: hitsHourlyTarget, hitMileTarget: hitsMileTarget } = Utils.evaluateTargets(payPerHour, payPerMile, input);

    let decision = 'MAYBE';
    let type = 'warn';
    let reason = 'True profit is positive, but one target is weaker than your goal.';

    if (trueProfit < 0 || (!hitsHourlyTarget && !hitsMileTarget)) {
      decision = 'REJECT';
      type = 'bad';
      reason = trueProfit < 0
        ? 'The trip is estimated to lose money after gas, tolls, and vehicle wear.'
        : 'Both pay per hour and pay per mile are below your target goals.';
    } else if (hitsHourlyTarget && hitsMileTarget) {
      decision = 'ACCEPT';
      type = 'good';
      reason = 'Pay per hour and pay per mile are both above your targets.';
    }

    if (offeredPay <= 0) {
      decision = 'REJECT';
      type = 'bad';
      reason = 'Enter a positive offered pay amount before accepting.';
    }

    return {
      offeredPay,
      tripTimeMinutes,
      tripMiles,
      pickupMiles,
      pickupTimeMinutes,
      tollsParking,
      totalTimeMinutes,
      totalHours,
      totalMiles,
      payPerHour,
      payPerMile,
      gasCost,
      vehicleWearCost,
      wearRate,
      trueProfit,
      trueProfitPerHour,
      trueProfitPerMile,
      targetProfitHour,
      targetProfitMile,
      hitsHourlyTarget,
      hitsMileTarget,
      decision,
      type,
      reason
    };
  };


  function checkDownsideRisk(result) {
    if (result.trueNetAfterWear <= 0) {
      return {
        title: 'Protect your downside',
        text: `True net is ${Utils.money(result.trueNetAfterWear)}. Reduce miles, fixed-cost exposure, or skip this pattern until pay improves.`,
        type: 'bad'
      };
    }
    return null;
  }

  function checkHourlyEfficiency(result) {
    if (result.trueProfitPerHour < result.targetProfitHour) {
      return {
        title: 'Raise hourly efficiency',
        text: `True profit/hour is ${Utils.money(result.trueProfitPerHour)} vs. your ${Utils.money(result.targetProfitHour)} goal. Avoid long waits and slow pickup zones.`,
        type: 'warn'
      };
    }
    return null;
  }

  function checkDollarDensity(result) {
    if (result.trueProfitPerMile < result.targetProfitMile) {
      return {
        title: 'Improve dollar density',
        text: `True profit/mile is ${Utils.money(result.trueProfitPerMile)} vs. your ${Utils.money(result.targetProfitMile)} goal. Favor shorter pickups and stronger fare density.`,
        type: 'warn'
      };
    }
    return null;
  }

  function checkFuelPressure(result, gasShare) {
    if (gasShare >= 12 || result.mpg <= 20) {
      return {
        title: 'Fuel is pressuring margin',
        text: `Gas is ${Utils.pct(gasShare)} of income. Better routes, fewer dead miles, or improved MPG will lift true profit fastest.`,
        type: gasShare >= 18 ? 'bad' : 'warn'
      };
    }
    return null;
  }

  function checkVehicleWear(result, wearShare) {
    if (wearShare >= 10 || result.miles >= 150) {
      return {
        title: 'Vehicle wear is meaningful',
        text: `Estimated wear is ${Utils.money(result.vehicleWearCost)} at ${Utils.money(result.wearRate)} per mile. High-mile shifts need stronger pay per mile.`,
        type: wearShare >= 16 ? 'bad' : 'warn'
      };
    }
    return null;
  }

  function checkTaxSeparation(result, taxShare) {
    if (taxShare >= 8) {
      return {
        title: 'Keep tax cash separate',
        text: `Set aside about ${Utils.money(result.suggestedTaxSetAside)} from this result so tax planning does not eat into operating cash.`,
        type: 'info'
      };
    }
    return null;
  }

  function checkExpenseLoad(result, expenseShare) {
    if (expenseShare >= 35) {
      return {
        title: 'Audit expense load',
        text: `Cash expenses are ${Utils.pct(expenseShare)} of income. Review tolls, parking, gas, and fixed monthly costs for quick wins.`,
        type: 'warn'
      };
    }
    return null;
  }

  function checkStrongPattern(result) {
    if (result.hitDailyTarget && result.hitHourlyTarget && result.hitMileTarget) {
      return {
        title: 'Strong operating pattern',
        text: 'This setup clears daily, hourly, and per-mile goals. Save it as a reference shift and compare future offers against it.',
        type: 'good'
      };
    }
    return null;
  }

  Utils.buildSmartSuggestions = function buildSmartSuggestions(result) {
    if (!result) {
      return [{ title: 'Run the calculator', text: 'Enter a shift estimate to unlock personalized profit suggestions.', type: 'info' }];
    }

    const gasShare = Utils.safeDivide(result.gasCost, result.income) * 100;
    const wearShare = Utils.safeDivide(result.vehicleWearCost, result.income) * 100;
    const expenseShare = Utils.safeDivide(result.totalExpenses, result.income) * 100;
    const taxShare = Utils.safeDivide(result.suggestedTaxSetAside, result.income) * 100;

    const suggestions = [
      checkDownsideRisk(result),
      checkHourlyEfficiency(result),
      checkDollarDensity(result),
      checkFuelPressure(result, gasShare),
      checkVehicleWear(result, wearShare),
      checkTaxSeparation(result, taxShare),
      checkExpenseLoad(result, expenseShare),
      checkStrongPattern(result)
    ].filter(Boolean);
    if (!suggestions.length) {
      suggestions.push({
        title: 'Healthy but watch the margins',
        text: 'The shift is positive. Keep tracking gas, pickup miles, and tax set-aside so hidden costs do not drift upward.',
        type: 'good'
      });
    }

    return suggestions.slice(0, 6);
  };

  Utils.getProfitTipData = function getProfitTipData(result) {
    if (!result) {
      return {
        profit: 'Calculate once to personalize this tip.',
        gas: 'Gas pressure appears after mileage and MPG are known.',
        taxes: 'Tax set-aside appears after income and deduction mode are known.',
        wear: 'Vehicle wear appears after mileage is entered.',
        hourly: 'Hourly strength appears after hours are entered.',
        mileage: 'Mileage efficiency appears after miles and profit are known.'
      };
    }

    const gasShare = Utils.safeDivide(result.gasCost, result.income) * 100;
    const wearShare = Utils.safeDivide(result.vehicleWearCost, result.income) * 100;
    return {
      profit: `Current true net is ${Utils.money(result.trueNetAfterWear)} with a ${result.goalStatus.label.toLowerCase()} rating.`,
      gas: `Gas is ${Utils.pct(gasShare)} of income, or ${Utils.money(result.gasCost)} total.`,
      taxes: `Suggested tax set-aside is ${Utils.money(result.suggestedTaxSetAside)} using ${Utils.deductionLabel(result.deductionMode).toLowerCase()}.`,
      wear: `Vehicle wear is ${Utils.money(result.vehicleWearCost)}, about ${Utils.pct(wearShare)} of income.`,
      hourly: `True hourly profit is ${Utils.money(result.trueProfitPerHour)} vs. your ${Utils.money(result.targetProfitHour)} target.`,
      mileage: `True profit per mile is ${Utils.money(result.trueProfitPerMile)} vs. your ${Utils.money(result.targetProfitMile)} target.`
    };
  };

  Utils.buildAdvisorReply = function buildAdvisorReply(question, result) {
    const q = Utils.safeText(question).toLowerCase();
    if (!result) return 'Calculate a shift first, then I can read the current profit, miles, gas, taxes, and vehicle wear.';

    const gasShare = Utils.safeDivide(result.gasCost, result.income) * 100;
    const wearShare = Utils.safeDivide(result.vehicleWearCost, result.income) * 100;
    const expenseShare = Utils.safeDivide(result.totalExpenses, result.income) * 100;
    const weakHourly = result.trueProfitPerHour < result.targetProfitHour;
    const weakMileage = result.trueProfitPerMile < result.targetProfitMile;
    const gasHigh = gasShare >= 12;
    const wearHigh = wearShare >= 12;

    const handlers = [
      {
        keywords: ['worth', 'accept'],
        getResponse: () => result.trueNetAfterWear > 0 && result.goalStatus.type !== 'bad'
          ? `Yes, this looks workable: true net is ${Utils.money(result.trueNetAfterWear)}, true hourly profit is ${Utils.money(result.trueProfitPerHour)}, and true profit per mile is ${Utils.money(result.trueProfitPerMile)}. ${result.goalStatus.label}.`
          : `I would be cautious. True net is ${Utils.money(result.trueNetAfterWear)}, true hourly profit is ${Utils.money(result.trueProfitPerHour)}, and the shift is rated "${result.goalStatus.label}". Try improving pay, reducing miles, or avoiding this shift pattern.`
      },
      {
        keywords: ['gas', 'fuel'],
        getResponse: () => gasHigh
          ? `Gas is hurting profit: ${Utils.money(result.gasCost)} is ${Utils.pct(gasShare)} of income. Better MPG, shorter pickups, and fewer empty miles would help.`
          : `Gas does not look like the main problem right now. It is ${Utils.money(result.gasCost)}, about ${Utils.pct(gasShare)} of income.`
      },
      {
        keywords: ['mile'],
        getResponse: () => weakMileage
          ? `Miles are likely too heavy for this payout. True profit per mile is ${Utils.money(result.trueProfitPerMile)} vs. your ${Utils.money(result.targetProfitMile)} target, with ${Utils.money(result.vehicleWearCost)} in estimated wear.`
          : `Mileage looks acceptable right now. True profit per mile is ${Utils.money(result.trueProfitPerMile)}, above or near your ${Utils.money(result.targetProfitMile)} target. Keep avoiding low-pay long-distance trips.`
      },
      {
        keywords: ['tax'],
        getResponse: () => `Tax planning estimate: taxable profit is ${Utils.money(result.taxableProfit)}, estimated tax owed is ${Utils.money(result.estimatedTaxOwed)}, and suggested set-aside is ${Utils.money(result.suggestedTaxSetAside)}. This is not tax advice.`
      },
      {
        keywords: ['wear', 'vehicle', 'maintenance'],
        getResponse: () => `Vehicle wear estimate is ${Utils.money(result.vehicleWearCost)} at ${Utils.money(result.wearRate)} per mile. That reduces after-tax profit from ${Utils.money(result.afterTaxProfit)} to ${Utils.money(result.trueNetAfterWear)}.`
      },
      {
        keywords: ['increase', 'profit', 'improve'],
        getResponse: () => {
          const priorities = [];
          if (weakHourly) priorities.push(`raise hourly return from ${Utils.money(result.trueProfitPerHour)} toward ${Utils.money(result.targetProfitHour)}`);
          if (weakMileage) priorities.push(`improve true profit per mile from ${Utils.money(result.trueProfitPerMile)} toward ${Utils.money(result.targetProfitMile)}`);
          if (gasHigh) priorities.push(`reduce gas pressure because gas is ${Utils.pct(gasShare)} of income`);
          if (wearHigh) priorities.push(`watch vehicle wear because hidden wear is ${Utils.money(result.vehicleWearCost)}`);
          if (!priorities.length) priorities.push('keep this pattern, but continue tracking miles, fuel, and taxes');
          return `Improve first: ${priorities.slice(0, 3).join('; ')}. Current net after tax and wear is ${Utils.money(result.trueNetAfterWear)}.`;
        }
      }
    ];

    const match = handlers.find(h => h.keywords.some(k => q.includes(k)));
    if (match) return match.getResponse();

    return `Based on the current shift: income is ${Utils.money(result.income)}, cash expenses are ${Utils.money(result.totalExpenses)}, true net is ${Utils.money(result.trueNetAfterWear)}, gas is ${Utils.money(result.gasCost)}, and true hourly profit is ${Utils.money(result.trueProfitPerHour)}. Ask about miles, gas, taxes, wear, or whether the shift is worth it.`;
  };

  Utils.buildTextReport = function buildTextReport(result) {
    return [
      'Uber Earnings & Expense Calculator Report',
      `Date: ${Utils.formatDateTime(new Date())}`,
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

export default Utils;
if (typeof window !== 'undefined') {
  window.CalculatorUtils = Utils;
}
