import U from './utils.js';


  function momentaryButtonFeedback(button, successText = 'Saved!') {
    if (!button || button.disabled) return;

    // Check if we're already showing feedback to avoid stuck text on double clicks
    if (button.dataset.originalText) return;

    button.dataset.originalText = button.textContent;
    button.textContent = successText;
    button.classList.add('good');

    setTimeout(() => {
      button.textContent = button.dataset.originalText;
      delete button.dataset.originalText;
      button.classList.remove('good');
    }, 2000);
  }

  function setElementText(element, value) {
    if (element) element.textContent = U.safeText(value);
  }

  function setElementClass(element, value) {
    if (element) element.className = U.safeText(value);
  }

  function setElementDisplay(element, value) {
    if (element) element.style.display = value;
  }

  function setTone(element, value, warningLimit) {
    if (!element) return;
    const safeValue = U.safeNumber(value);
    element.classList.remove('positive', 'negative', 'warning', 'info');
    if (safeValue < 0) element.classList.add('negative');
    else if (typeof warningLimit === 'number' && safeValue < warningLimit) element.classList.add('warning');
    else element.classList.add('positive');
  }

  function renderCard(options) {
    const { label, value, note, type = '', toneValue, warningLimit } = options;
    const card = document.createElement('div');
    card.className = `result-card ${type}`;

    const strong = document.createElement('strong');
    strong.textContent = label;
    card.appendChild(strong);

    const span = document.createElement('span');
    span.textContent = value;
    card.appendChild(span);

    if (note) {
      const small = document.createElement('small');
      small.textContent = note;
      card.appendChild(small);
    }

    if (toneValue !== undefined) setTone(span, toneValue, warningLimit);
    return card;
  }

  function renderTopSummary(els, result) {
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
      setElementText(element, U.compactMoney(value));
      setTone(element, value, warningLimit);
    });
  }

  function renderRecommendation(els, result) {
    setElementText(els.recommendation, result.recommendation.text);
    setElementClass(els.recommendation, `recommendation ${result.recommendation.type}`);
  }

  function renderAlerts(els, result) {
    const messages = [...result.validation];
    messages.push(result.hitDailyTarget
      ? { text: `Daily profit target hit. Daily net is ${U.money(result.dailyNetProfit)}.`, type: 'good' }
      : { text: `Daily target missed. Need about ${U.money(result.incomeNeededForDailyTarget)} more income per day, or ${U.money(result.incomeNeededForPeriodTarget)} for this period.`, type: 'warn' });

    if (result.goalStatus.type === 'good') {
      messages.push({ text: 'Strong shift: hourly and mile targets are both in range.', type: 'good' });
    } else if (result.goalStatus.type === 'warn') {
      messages.push({ text: 'Acceptable but weak: positive result, but one target is soft.', type: 'warn' });
    } else {
      messages.push({ text: 'Not worth it: true profit is below your goal settings.', type: 'bad' });
    }

    if (!els.alerts) return;

    // ⚡ Bolt: Performance - Use DocumentFragment to avoid spreading large arrays
    const fragment = document.createDocumentFragment();
    messages.forEach((message) => {
      const className = message.type === 'good' ? 'good' : message.type === 'bad' ? 'bad' : message.type === 'info' ? 'info' : '';
      const div = document.createElement('div');
      div.className = `alert ${className}`.trim();
      div.textContent = message.text;
      fragment.appendChild(div);
    });
    els.alerts.replaceChildren(fragment);
  }

  function renderSummary(els, result) {
    const rows = [
      ['Mode', U.capitalize(result.mode), 'Selected calculation period'],
      ['Working days', result.mode === 'daily' ? '1 day' : `${result.workingDays} days`, 'Used to scale averages and fixed costs'],
      ['Trips', U.safeNumber(result.trips).toFixed(0), result.mode === 'daily' ? 'Total trips' : 'Average trips per day multiplied by working days'],
      ['Gas used', `${U.safeNumber(result.gasUsed).toFixed(2)} gallons`, 'Miles divided by MPG'],
      ['Variable expenses', U.money(result.variableExpenses), 'Gas, parking/tolls, and additional expenses'],
      ['Fixed cost share', U.money(result.fixedCostShare), 'Estimated portion of monthly costs'],
      ['Total expenses', U.money(result.totalExpenses), 'Cash expenses before taxes and wear'],
      ['Average income per trip', U.money(result.averageIncomePerTrip), 'Income divided by total trips'],
      ['Average profit per trip', U.money(result.averageProfitPerTrip), 'Net profit divided by total trips'],
      ['Mileage deduction', U.money(result.mileageDeduction), `${U.money(U.safeDivide(result.mileageDeduction, Math.max(result.miles, 1)))} per mile estimate`],
      ['Taxable profit', U.money(result.taxableProfit), U.deductionLabel(result.deductionMode)],
      ['Estimated tax owed', U.money(result.estimatedTaxOwed), `${U.pct(result.totalTaxRate * 100)} combined rate`],
      ['Suggested set-aside', U.money(result.suggestedTaxSetAside), 'Useful for planning cash reserves'],
      ['After-tax profit', U.money(result.afterTaxProfit), 'Net profit minus estimated tax owed'],
      ['Depreciation cost', U.money(result.depreciationCost), 'Miles multiplied by depreciation per mile'],
      ['Tire wear cost', U.money(result.tireWearCost), 'Miles multiplied by tire wear per mile'],
      ['Brake/maintenance wear cost', U.money(result.brakeWearCost), 'Miles multiplied by brake/maintenance wear per mile'],
      ['Vehicle wear cost', U.money(result.vehicleWearCost), `${U.money(result.wearRate)} per mile`],
      ['True net after wear', U.money(result.trueNetAfterWear), 'After-tax profit minus vehicle wear'],
      ['True profit/hour', U.money(result.trueProfitPerHour), `Target: ${U.money(result.targetProfitHour)}`],
      ['True profit/mile', U.money(result.trueProfitPerMile), `Target: ${U.money(result.targetProfitMile)}`],
      ['Goal status', result.goalStatus.label, 'Based on daily, hourly, and per-mile targets']
    ];

    if (!els.summaryBody) return;

    // ⚡ Bolt: Performance - Use DocumentFragment to avoid spreading large arrays
    const fragment = document.createDocumentFragment();
    rows.forEach((row) => {
      const tr = document.createElement('tr');
      row.forEach((cellText) => {
        const td = document.createElement('td');
        td.textContent = cellText;
        tr.appendChild(td);
      });
      fragment.appendChild(tr);
    });
    els.summaryBody.replaceChildren(fragment);
  }

  function renderResults(els, result, renderScenarioComparison) {
    const cards = [
      { label: 'Total income', value: U.money(result.income), note: `${U.safeNumber(result.trips).toFixed(0)} trips`, toneValue: result.income },
      { label: 'Gas cost', value: U.money(result.gasCost), note: `${U.safeNumber(result.gasUsed).toFixed(2)} gallons` },
      { label: 'Total expenses', value: U.money(result.totalExpenses), note: 'Cash expenses plus fixed cost share' },
      { label: 'Net profit', value: U.money(result.netProfit), toneValue: result.netProfit },
      { label: 'Profit per hour', value: U.money(result.profitPerHour), toneValue: result.profitPerHour, warningLimit: 15 },
      { label: 'Profit per mile', value: U.money(result.profitPerMile), toneValue: result.profitPerMile, warningLimit: 1 },
      { label: 'Taxable profit', value: U.money(result.taxableProfit), note: U.deductionLabel(result.deductionMode), type: 'tax' },
      { label: 'Estimated tax owed', value: U.money(result.estimatedTaxOwed), note: `${U.pct(result.totalTaxRate * 100)} combined rate`, type: 'tax' },
      { label: 'Suggested tax set-aside', value: U.money(result.suggestedTaxSetAside), note: 'Based on net profit', type: 'tax' },
      { label: 'After-tax profit', value: U.money(result.afterTaxProfit), toneValue: result.afterTaxProfit, type: 'tax' },
      { label: 'Vehicle wear cost', value: U.money(result.vehicleWearCost), note: `${U.money(result.wearRate)} per mile`, type: 'wear' },
      { label: 'True net after wear', value: U.money(result.trueNetAfterWear), toneValue: result.trueNetAfterWear, type: 'wear' },
      { label: 'True profit per hour', value: U.money(result.trueProfitPerHour), toneValue: result.trueProfitPerHour, warningLimit: result.targetProfitHour, type: 'wear' },
      { label: 'True profit per mile', value: U.money(result.trueProfitPerMile), toneValue: result.trueProfitPerMile, warningLimit: result.targetProfitMile, type: 'wear' }
    ];

    if (els.resultsGrid) {
      // ⚡ Bolt: Performance - Avoid intermediate array allocation and spread operator execution overhead
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < cards.length; i++) {
        fragment.appendChild(renderCard(cards[i]));
      }
      els.resultsGrid.replaceChildren(fragment);
    }
    renderTopSummary(els, result);
    renderRecommendation(els, result);
    renderAlerts(els, result);
    renderSummary(els, result);
    renderScenarioComparison(result);
  }

  function renderTripDecision(els, decision) {
    if (!decision) return;
    setElementText(els.tripDecisionText, decision.decision);
    setElementText(els.tripDecisionReason, decision.reason);
    setElementText(els.tripTotalTime, `${U.safeNumber(decision.totalTimeMinutes).toFixed(0)} min`);
    setElementText(els.tripTotalMiles, `${U.safeNumber(decision.totalMiles).toFixed(1)} mi`);
    setElementText(els.tripPayHour, U.money(decision.payPerHour));
    setElementText(els.tripPayMile, U.money(decision.payPerMile));
    setElementText(els.tripGasCost, U.money(decision.gasCost));
    setElementText(els.tripWearCost, U.money(decision.vehicleWearCost));
    setElementText(els.tripTrueProfit, U.money(decision.trueProfit));
    setElementClass(els.tripDecisionBadge, `decision-badge ${decision.type}`);
    if (els.tripDecisionCard) {
      els.tripDecisionCard.classList.remove('good', 'warn', 'bad');
      els.tripDecisionCard.classList.add(decision.type);
    }
    setTone(els.tripPayHour, decision.payPerHour, decision.targetProfitHour);
    setTone(els.tripPayMile, decision.payPerMile, decision.targetProfitMile);
    setTone(els.tripTrueProfit, decision.trueProfit, 0);
  }

  function renderSmartSuggestions(els, suggestions) {
    if (!els.smartSuggestions) return;
    const list = Array.isArray(suggestions) ? suggestions : [];
    // ⚡ Bolt: Performance - Use DocumentFragment to avoid spreading large arrays
    const fragment = document.createDocumentFragment();
    list.forEach((suggestion) => {
      const article = document.createElement('article');
      article.className = `suggestion-item ${suggestion.type || 'info'}`;

      const strong = document.createElement('strong');
      strong.textContent = suggestion.title;

      const p = document.createElement('p');
      p.textContent = suggestion.text;

      article.appendChild(strong);
      article.appendChild(p);
      fragment.appendChild(article);
    });
    els.smartSuggestions.replaceChildren(fragment);
  }

  function renderHistory(els, history) {
    setElementDisplay(els.historyEmpty, history.length ? 'none' : 'block');

    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const exportHistoryBtn = document.getElementById('exportHistoryBtn');
    if (clearHistoryBtn) {
      clearHistoryBtn.disabled = history.length === 0;
      clearHistoryBtn.title = history.length === 0 ? 'No history to clear' : '';
    }
    if (exportHistoryBtn) {
      exportHistoryBtn.disabled = history.length === 0;
      exportHistoryBtn.title = history.length === 0 ? 'No history to export' : '';
    }
    if (!els.historyBody) return;

    // ⚡ Bolt: Performance - Avoid intermediate function allocations in loops by using explicit for-loops and inline cell creation
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < history.length; i++) {
      const entry = history[i];
      const tr = document.createElement('tr');
      const savedAt = U.formatDateTime(entry.savedAt);

      const cells = [
        savedAt,
        U.money(entry.income),
        U.safeNumber(entry.hours).toFixed(1),
        U.safeNumber(entry.miles).toFixed(1),
        U.money(entry.netProfit),
        U.money(entry.afterTaxProfit),
        U.money(entry.trueNetAfterWear),
        U.money(entry.profitPerHour)
      ];

      for (let j = 0; j < cells.length; j++) {
        const td = document.createElement('td');
        td.textContent = cells[j];
        tr.appendChild(td);
      }

      const tdBtn = document.createElement('td');
      const btn = document.createElement('button');
      btn.className = 'small danger';
      btn.type = 'button';
      btn.setAttribute('aria-label', `Delete shift from ${savedAt}`);
      btn.setAttribute('data-delete-shift', entry.id);
      btn.textContent = 'Delete';
      tdBtn.appendChild(btn);

      tr.appendChild(tdBtn);
      fragment.appendChild(tr);
    }

    els.historyBody.replaceChildren(fragment);
  }

  function renderAnalytics(els, history) {
    // ⚡ Bolt: Performance - Avoid callback execution overhead from reduce by using manual variables and a for loop
    let tIncome = 0, tMiles = 0, tHours = 0, tGasCost = 0, tTotalExpenses = 0, tNetProfit = 0, tAfterTaxProfit = 0;
    let best = null;
    let worst = null;
    for (let i = 0; i < history.length; i++) {
      const entry = history[i];
      tIncome += entry.income;
      tMiles += entry.miles;
      tHours += entry.hours;
      tGasCost += entry.gasCost;
      tTotalExpenses += entry.totalExpenses;
      tNetProfit += entry.netProfit;
      tAfterTaxProfit += entry.afterTaxProfit;

      if (!best || entry.trueNetAfterWear > best.trueNetAfterWear) best = entry;
      if (!worst || entry.trueNetAfterWear < worst.trueNetAfterWear) worst = entry;
    }
    const totals = { income: tIncome, miles: tMiles, hours: tHours, gasCost: tGasCost, totalExpenses: tTotalExpenses, netProfit: tNetProfit, afterTaxProfit: tAfterTaxProfit };
    const metrics = [
      ['Total saved shifts', history.length.toString()],
      ['Total income', U.money(totals.income)],
      ['Total miles', U.safeNumber(totals.miles).toFixed(1)],
      ['Total hours', U.safeNumber(totals.hours).toFixed(1)],
      ['Total gas cost', U.money(totals.gasCost)],
      ['Total expenses', U.money(totals.totalExpenses)],
      ['Total net profit', U.money(totals.netProfit)],
      ['Total after-tax', U.money(totals.afterTaxProfit)],
      ['Avg profit/hour', U.money(U.safeDivide(totals.netProfit, totals.hours))],
      ['Avg profit/mile', U.money(U.safeDivide(totals.netProfit, totals.miles))],
      ['Best shift', best ? U.money(best.trueNetAfterWear) : '$0.00'],
      ['Worst shift', worst ? U.money(worst.trueNetAfterWear) : '$0.00'],
      ['Avg net/shift', U.money(U.safeDivide(totals.netProfit, history.length))]
    ];

    if (!els.analyticsGrid) return;

    // ⚡ Bolt: Performance - Use DocumentFragment to avoid spreading large arrays
    const fragment = document.createDocumentFragment();
    metrics.forEach(([label, value]) => {
      const div = document.createElement('div');
      div.className = 'metric';

      const strong = document.createElement('strong');
      strong.textContent = label;
      div.appendChild(strong);

      const span = document.createElement('span');
      span.textContent = value;
      div.appendChild(span);

      fragment.appendChild(div);
    });
    els.analyticsGrid.replaceChildren(fragment);
  }

  function renderScenarioComparison(els, scenarioInputs) {
    // ⚡ Bolt: Performance - Avoid callback execution overhead from reduce by using manual variables and a for loop
    let bestIndex = 0;
    for (let i = 1; i < scenarioInputs.length; i++) {
      if (scenarioInputs[i].result.trueNetAfterWear > scenarioInputs[bestIndex].result.trueNetAfterWear) {
        bestIndex = i;
      }
    }

    if (!els.scenarioBody) return;

    // ⚡ Bolt: Performance - Use DocumentFragment to avoid spreading large arrays
    const fragment = document.createDocumentFragment();
    scenarioInputs.forEach((item, index) => {
      const isBest = index === bestIndex;
      const tr = document.createElement('tr');
      if (isBest) tr.className = 'best-row';

      const tdName = document.createElement('td');
      tdName.textContent = item.name + (isBest ? ' - Best' : '');
      tr.appendChild(tdName);

      const tdIncome = document.createElement('td');
      tdIncome.textContent = U.money(item.result.income);
      tr.appendChild(tdIncome);

      const tdExpenses = document.createElement('td');
      tdExpenses.textContent = U.money(item.result.totalExpenses);
      tr.appendChild(tdExpenses);

      const tdNetProfit = document.createElement('td');
      tdNetProfit.textContent = U.money(item.result.netProfit);
      tr.appendChild(tdNetProfit);

      const tdAfterTaxProfit = document.createElement('td');
      tdAfterTaxProfit.textContent = U.money(item.result.afterTaxProfit);
      tr.appendChild(tdAfterTaxProfit);

      const tdTrueNetAfterWear = document.createElement('td');
      tdTrueNetAfterWear.textContent = U.money(item.result.trueNetAfterWear);
      tr.appendChild(tdTrueNetAfterWear);

      const tdTrueProfitPerHour = document.createElement('td');
      tdTrueProfitPerHour.textContent = U.money(item.result.trueProfitPerHour);
      tr.appendChild(tdTrueProfitPerHour);

      const tdTrueProfitPerMile = document.createElement('td');
      tdTrueProfitPerMile.textContent = U.money(item.result.trueProfitPerMile);
      tr.appendChild(tdTrueProfitPerMile);

      fragment.appendChild(tr);
    });
    els.scenarioBody.replaceChildren(fragment);
  }

  function renderProTip(els, tip) {
    if (!tip) return;
    const card = els.proTipsCard;
    if (card) {
      card.classList.remove('tip-enter');
      void card.offsetWidth;
      card.classList.add('tip-enter');
    }
    setElementText(els.proTipCategory, tip.category);
    setElementText(els.proTipTitle, tip.title);
    setElementText(els.proTipText, tip.text);
    setElementText(els.proTipMeta, tip.meta);
  }

  function renderProTipDots(els, tips, activeIndex) {
    if (!els.proTipDots) return;
    // ⚡ Bolt: Performance - Use DocumentFragment to avoid spreading large arrays
    const fragment = document.createDocumentFragment();
    tips.forEach((tip, index) => {
      const button = document.createElement('button');
      button.className = `tip-dot ${index === activeIndex ? 'active' : ''}`;
      button.type = 'button';
      button.setAttribute('data-tip-index', index);
      button.setAttribute('aria-label', `Show tip ${index + 1}: ${tip.category}`);
      if (index === activeIndex) button.setAttribute('aria-current', 'true');
      fragment.appendChild(button);
    });
    els.proTipDots.replaceChildren(fragment);
  }

  function appendAdvisorMessage(container, role, text) {
    if (!container) return;
    const message = document.createElement('div');
    message.className = `advisor-message ${role === 'user' ? 'user' : 'assistant'}`;

    const strong = document.createElement('strong');
    strong.textContent = role === 'user' ? 'You' : 'Advisor';

    const p = document.createElement('p');
    p.textContent = text;

    message.appendChild(strong);
    message.appendChild(p);

    container.appendChild(message);
    container.scrollTop = container.scrollHeight;
  }

const CalculatorUI = {
    setTone,

    momentaryButtonFeedback,
    setElementText,
    setElementClass,
    setElementDisplay,
    renderSummary,
    renderResults,
    renderTripDecision,
    renderSmartSuggestions,
    renderHistory,
    renderAnalytics,
    renderScenarioComparison,
    renderProTip,
    renderProTipDots,
    appendAdvisorMessage
  };

export default CalculatorUI;
if (typeof window !== 'undefined') {
  window.CalculatorUI = CalculatorUI;
}
