import re

with open('components.css', 'r') as f:
    css = f.read()

# Update Result Cards / Metric Boxes
css = re.sub(r'\.mini-result,\n\.result-card,\n\.metric,\n\.decision-metrics div,\n\.suggestion-item \{\n  border-radius: var\(--radius-md\);\n  border-color: rgba\(190, 223, 217, 0\.13\);\n  background:\n    linear-gradient\(180deg, rgba\(255, 255, 255, 0\.065\), rgba\(255, 255, 255, 0\.015\)\),\n    rgba\(10, 16, 20, 0\.88\);\n\}', r'''.mini-result,
.result-card,
.metric,
.decision-metrics div,
.suggestion-item {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  background: var(--bg-card-strong);
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}''', css)

css = re.sub(r'\.mini-result:hover,\n\.result-card:hover,\n\.metric:hover,\n\.suggestion-item:hover \{\n  border-color: rgba\(109, 231, 255, 0\.28\);\n  box-shadow: 0 16px 34px rgba\(0, 0, 0, 0\.32\);\n\}', r'''.mini-result:hover,
.result-card:hover,
.metric:hover,
.suggestion-item:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-soft);
  transform: translateY(-1px);
  transition: all var(--transition-fast);
}''', css)

# Update Result Card specifics
css = re.sub(r'\.result-card \{\n  min-height: 122px;\n  padding-left: 72px;\n\}', r'''.result-card {
  min-height: 110px;
  padding: 20px;
  position: relative;
  overflow: hidden;
}''', css)

# Remove background gradients of pseudo elements on result cards
css = re.sub(r'\.result-card::before \{\n  border-radius: var\(--radius-md\);\n  background:\n    linear-gradient\(135deg, rgba\(109, 231, 255, 0\.92\), rgba\(66, 245, 167, 0\.28\)\),\n    rgba\(109, 231, 255, 0\.12\);\n  box-shadow: 0 0 26px rgba\(109, 231, 255, 0\.15\);\n\}', r'''.result-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--primary-blue);
  border-radius: 4px 0 0 4px;
}''', css)

css = re.sub(r'\.result-card\.tax::before \{\n  background:\n    linear-gradient\(135deg, rgba\(255, 106, 183, 0\.9\), rgba\(167, 139, 250, 0\.3\)\),\n    rgba\(255, 106, 183, 0\.12\);\n\}', r'''.result-card.tax::before {
  background: var(--primary-purple);
}''', css)

css = re.sub(r'\.result-card\.wear::before \{\n  background:\n    linear-gradient\(135deg, rgba\(247, 201, 72, 0\.92\), rgba\(255, 159, 67, 0\.3\)\),\n    rgba\(247, 201, 72, 0\.12\);\n\}', r'''.result-card.wear::before {
  background: var(--accent-orange);
}''', css)


# Tables
css = re.sub(r'\.table-wrap \{\n  border-top: 1px solid rgba\(190, 223, 217, 0\.11\);\n  background: rgba\(3, 7, 9, 0\.5\);\n\}', r'''.table-wrap {
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-card);
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  overflow: hidden;
}''', css)

css = re.sub(r'th \{\n  color: #b7c8c6;\n  background: rgba\(12, 18, 24, 0\.98\);\n\}', r'''th {
  color: var(--text-secondary);
  background: var(--bg-card-strong);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  padding: 12px 16px;
}''', css)

css = re.sub(r'td \{\n  color: #e9f5f2;\n\}', r'''td {
  color: var(--text-main);
  padding: 16px;
  border-bottom: 1px solid var(--border-subtle);
}''', css)


# Recommendations & Alerts
css = re.sub(r'\.recommendation,\n\.alert \{\n  border-radius: var\(--radius-md\);\n  font-weight: 850;\n\}', r'''.recommendation,
.alert {
  border-radius: var(--radius-md);
  font-weight: 600;
  padding: 16px;
  display: flex;
  align-items: center;
}''', css)

css = re.sub(r'\.recommendation \{\n  border-color: rgba\(109, 231, 255, 0\.26\);\n  color: #e7f9f4;\n  background:\n    linear-gradient\(135deg, rgba\(109, 231, 255, 0\.11\), rgba\(66, 245, 167, 0\.055\)\),\n    rgba\(6, 13, 16, 0\.72\);\n\}', r'''.recommendation {
  border: 1px solid var(--primary-blue);
  color: var(--text-main);
  background: rgba(10, 132, 255, 0.1);
}''', css)

css = re.sub(r'\.recommendation\.good,\n\.alert\.good,\n\.suggestion-item\.good \{\n  border-color: rgba\(66, 245, 167, 0\.36\);\n  background: rgba\(66, 245, 167, 0\.095\);\n  color: #9fffd2;\n\}', r'''.recommendation.good,
.alert.good,
.suggestion-item.good {
  border: 1px solid var(--accent-green);
  background: rgba(50, 215, 75, 0.1);
  color: var(--text-main);
}''', css)

css = re.sub(r'\.recommendation\.warn,\n\.alert,\n\.suggestion-item\.warn \{\n  border-color: rgba\(247, 201, 72, 0\.36\);\n  background: rgba\(247, 201, 72, 0\.095\);\n  color: #ffe38c;\n\}', r'''.recommendation.warn,
.alert,
.suggestion-item.warn {
  border: 1px solid var(--accent-yellow);
  background: rgba(255, 214, 10, 0.1);
  color: var(--text-main);
}''', css)

css = re.sub(r'\.recommendation\.bad,\n\.alert\.bad,\n\.suggestion-item\.bad \{\n  border-color: rgba\(255, 93, 125, 0\.36\);\n  background: rgba\(255, 93, 125, 0\.095\);\n  color: #ff9cad;\n\}', r'''.recommendation.bad,
.alert.bad,
.suggestion-item.bad {
  border: 1px solid var(--accent-red);
  background: rgba(255, 69, 58, 0.1);
  color: var(--text-main);
}''', css)

css = re.sub(r'\.alert\.info,\n\.suggestion-item\.info \{\n  border-color: rgba\(109, 231, 255, 0\.32\);\n  background: rgba\(109, 231, 255, 0\.09\);\n  color: #abf3ff;\n\}', r'''.alert.info,
.suggestion-item.info {
  border: 1px solid var(--primary-blue);
  background: rgba(10, 132, 255, 0.1);
  color: var(--text-main);
}''', css)


with open('components.css', 'w') as f:
    f.write(css)
