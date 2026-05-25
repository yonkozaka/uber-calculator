(function () {
  const U = window.CalculatorUtils;

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

  function renderCard({ label, value, note, type = '', toneValue, warningLimit }) {
    const card = document.createElement('div');
    card.className = `result-card ${type}`;
    card.innerHTML = `
      <strong>${U.escapeHtml(label)}</strong>
      <span>${U.escapeHtml(value)}</span>
      ${note ? `<small>${U.escapeHtml(note)}</small>` : ''}
    `;
    if (toneValue !== undefined) setTone(card.querySelector('span'), toneValue, warningLimit);
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
    els.alerts.innerHTML = messages.map((message) => {
      const className = message.type === 'good' ? 'good' : message.type === 'bad' ? 'bad' : message.type === 'info' ? 'info' : '';
      return `<div class="alert ${className}">${U.escapeHtml(message.text)}</div>`;
    }).join('');
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
    els.summaryBody.innerHTML = rows.map((row) => `
      <tr>
        <td>${U.escapeHtml(row[0])}</td>
        <td>${U.escapeHtml(row[1])}</td>
        <td>${U.escapeHtml(row[2])}</td>
      </tr>
    `).join('');
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

    if (els.resultsGrid) els.resultsGrid.replaceChildren(...cards.map(renderCard));
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
    const articles = list.map((suggestion) => {
      const article = document.createElement('article');
      article.className = `suggestion-item ${suggestion.type || 'info'}`;

      const strong = document.createElement('strong');
      strong.textContent = suggestion.title;

      const p = document.createElement('p');
      p.textContent = suggestion.text;

      article.appendChild(strong);
      article.appendChild(p);
      return article;
    });
    els.smartSuggestions.replaceChildren(...articles);
  }

  function renderHistory(els, history) {
    setElementDisplay(els.historyEmpty, history.length ? 'none' : 'block');
    if (!els.historyBody) return;

    const rows = history.map(entry => {
      const tr = document.createElement('tr');

      const savedAt = new Date(entry.savedAt).toLocaleString();

      const createCell = (text) => {
        const td = document.createElement('td');
        td.textContent = text;
        return td;
      };

      tr.appendChild(createCell(savedAt));
      tr.appendChild(createCell(U.money(entry.income)));
      tr.appendChild(createCell(U.safeNumber(entry.hours).toFixed(1)));
      tr.appendChild(createCell(U.safeNumber(entry.miles).toFixed(1)));
      tr.appendChild(createCell(U.money(entry.netProfit)));
      tr.appendChild(createCell(U.money(entry.afterTaxProfit)));
      tr.appendChild(createCell(U.money(entry.trueNetAfterWear)));
      tr.appendChild(createCell(U.money(entry.profitPerHour)));

      const tdBtn = document.createElement('td');
      const btn = document.createElement('button');
      btn.className = 'small danger';
      btn.type = 'button';
      btn.setAttribute('aria-label', `Delete shift from ${savedAt}`);
      btn.setAttribute('data-delete-shift', entry.id);
      btn.textContent = 'Delete';
      tdBtn.appendChild(btn);

      tr.appendChild(tdBtn);
      return tr;
    });

    els.historyBody.replaceChildren(...rows);
  }

  function renderAnalytics(els, history) {
    const { totals, best, worst } = history.reduce((acc, entry) => {
      acc.totals.income += entry.income;
      acc.totals.miles += entry.miles;
      acc.totals.hours += entry.hours;
      acc.totals.gasCost += entry.gasCost;
      acc.totals.totalExpenses += entry.totalExpenses;
      acc.totals.netProfit += entry.netProfit;
      acc.totals.afterTaxProfit += entry.afterTaxProfit;

      if (!acc.best || entry.trueNetAfterWear > acc.best.trueNetAfterWear) acc.best = entry;
      if (!acc.worst || entry.trueNetAfterWear < acc.worst.trueNetAfterWear) acc.worst = entry;

      return acc;
    }, {
      totals: { income: 0, miles: 0, hours: 0, gasCost: 0, totalExpenses: 0, netProfit: 0, afterTaxProfit: 0 },
      best: null,
      worst: null
    });
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
    els.analyticsGrid.innerHTML = metrics.map(([label, value]) => `
      <div class="metric">
        <strong>${U.escapeHtml(label)}</strong>
        <span>${U.escapeHtml(value)}</span>
      </div>
    `).join('');
  }

  function renderScenarioComparison(els, scenarioInputs) {
    const bestIndex = scenarioInputs.reduce((winnerIndex, item, index, list) => (
      item.result.trueNetAfterWear > list[winnerIndex].result.trueNetAfterWear ? index : winnerIndex
    ), 0);

    if (!els.scenarioBody) return;

    const rows = scenarioInputs.map((item, index) => {
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

      return tr;
    });

    els.scenarioBody.replaceChildren(...rows);
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
    els.proTipDots.innerHTML = tips.map((tip, index) => `
      <button
        class="tip-dot ${index === activeIndex ? 'active' : ''}"
        type="button"
        data-tip-index="${index}"
        aria-label="Show tip ${index + 1}: ${U.escapeHtml(tip.category)}"
      ></button>
    `).join('');
  }

  function appendAdvisorMessage(container, role, text) {
    if (!container) return;
    const message = document.createElement('div');
    message.className = `advisor-message ${role === 'user' ? 'user' : 'assistant'}`;
    message.innerHTML = `
      <strong>${role === 'user' ? 'You' : 'Advisor'}</strong>
      <p>${U.escapeHtml(text)}</p>
    `;
    container.appendChild(message);
    container.scrollTop = container.scrollHeight;
  }

  window.CalculatorUI = {
    setElementText,
    setElementClass,
    setElementDisplay,
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
}());
