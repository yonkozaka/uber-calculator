import re

with open('components.css', 'r') as f:
    css = f.read()

# Make the pill buttons more subtle (Stripe/Apple style)
css = re.sub(r'\.pill,\nbutton\.pill,\n\.advisor-chip \{\n  border-radius: 999px;\n  color: #d9e8e4;\n  background: rgba\(9, 15, 18, 0\.78\);\n\}', r'''.pill,
button.pill,
.advisor-chip {
  border-radius: 999px;
  color: var(--text-main);
  background: var(--bg-field);
  padding: 6px 14px;
  font-size: 13px;
  border: 1px solid var(--border-subtle);
  transition: all var(--transition-fast);
}''', css)

css = re.sub(r'button\.pill:hover,\nbutton\.pill:focus-visible,\n\.advisor-chip:hover,\n\.advisor-chip:focus-visible \{\n  color: #f8fffb;\n  border-color: rgba\(66, 245, 167, 0\.46\);\n  background: rgba\(17, 30, 28, 0\.9\);\n  box-shadow: var\(--shadow-glow-green\);\n\}', r'''button.pill:hover,
button.pill:focus-visible,
.advisor-chip:hover,
.advisor-chip:focus-visible {
  background: var(--bg-field-hover);
  border-color: var(--border-strong);
  box-shadow: none;
}''', css)

# Make badges less blocky
css = re.sub(r'\.year-badge \{\n  border-radius: 999px;\n  border-color: rgba\(66, 245, 167, 0\.22\);\n  color: #dfffee;\n  background: rgba\(66, 245, 167, 0\.1\);\n\}', r'''.year-badge {
  border-radius: 999px;
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  background: transparent;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
}''', css)

css = re.sub(r'\.step-badge \{\n  border-radius: var\(--radius-md\);\n  color: #06100c;\n  background: var\(--primary\);\n  box-shadow: 0 14px 30px rgba\(66, 245, 167, 0\.14\);\n\}', r'''.step-badge {
  border-radius: 50%;
  color: #fff;
  background: var(--primary-blue);
  box-shadow: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}''', css)

# Adjust table rows for a cleaner look
css = re.sub(r'tbody tr:hover td \{\n  background: rgba\(109, 231, 255, 0\.045\);\n\}', r'''tbody tr:hover td {
  background: var(--bg-field-hover);
}''', css)

# Make the hero readout more apple like
css = re.sub(r'\.hero-score \{\n  display: grid;\n  align-content: end;\n  min-height: 192px;\n  padding: 24px;\n  border-color: rgba\(66, 245, 167, 0\.22\);\n  border-radius: var\(--radius-lg\);\n  background:\n    linear-gradient\(145deg, rgba\(66, 245, 167, 0\.13\), rgba\(109, 231, 255, 0\.07\)\),\n    rgba\(4, 9, 11, 0\.78\);\n  box-shadow: inset 0 1px 0 rgba\(255, 255, 255, 0\.08\);\n\}', r'''.hero-score {
  display: grid;
  align-content: center;
  min-height: 160px;
  padding: 24px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  background: var(--bg-card-strong);
  box-shadow: var(--shadow-soft);
  text-align: center;
}''', css)


css = re.sub(r'\.hero-score span \{\n  color: #8eb0ad;\n\}', r'''.hero-score span {
  color: var(--text-secondary);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}''', css)

css = re.sub(r'\.hero-score strong \{\n  max-width: 520px;\n  color: #f7fffb;\n  font-size: clamp\(1\.35rem, 2\.25vw, 2\.35rem\);\n\}', r'''.hero-score strong {
  color: var(--text-main);
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}''', css)

# Fix hero-metrics
css = re.sub(r'\.hero-metrics div \{\n  display: grid;\n  align-content: center;\n  min-height: 56px;\n  padding: 14px;\n  border: 1px solid rgba\(190, 223, 217, 0\.13\);\n  border-radius: var\(--radius-md\);\n  background: rgba\(5, 9, 11, 0\.58\);\n\}', r'''.hero-metrics div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 16px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
}''', css)

# Quick stats layout
css = re.sub(r'\.quick-stats \{\n  grid-column: 1 / -1;\n\}', r'''.quick-stats {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}''', css)


with open('components.css', 'w') as f:
    f.write(css)
