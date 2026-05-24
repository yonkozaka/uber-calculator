import re

with open('components.css', 'r') as f:
    css = f.read()

# Make card headings aligned properly
css = re.sub(r'\.card-heading,\n\.results-head \{\n  display: flex;\n  align-items: flex-start;\n  gap: var\(--space-4\);\n  padding: var\(--space-6\);\n  border-bottom: 1px solid var\(--border-subtle\);\n\}', r'''.card-heading,
.results-head {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
}''', css)

# Make metric span bold
css = re.sub(r'\.mini-result span,\n\.result-card span,\n\.metric span,\n\.decision-metrics span \{\n  color: #f8fffb;\n  letter-spacing: 0;\n\}', r'''.mini-result span,
.result-card span,
.metric span,
.decision-metrics span {
  color: var(--text-main);
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-top: 4px;
}''', css)

# Adjust strong inside mini result to match new look
css = re.sub(r'\.mini-result strong,\n\.result-card strong,\n\.metric strong,\n\.decision-metrics strong,\n\.suggestion-item strong \{\n  color: #aabbb9;\n  font-size: 0\.7rem;\n\}', r'''.mini-result strong,
.result-card strong,
.metric strong,
.decision-metrics strong,
.suggestion-item strong {
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}''', css)

# Fix empty state
css = re.sub(r'\.empty-state \{\n  border-radius: var\(--radius-md\);\n  color: var\(--text-secondary\);\n  background:\n    linear-gradient\(135deg, rgba\(109, 231, 255, 0\.055\), rgba\(66, 245, 167, 0\.035\)\),\n    rgba\(4, 9, 11, 0\.58\);\n\}', r'''.empty-state {
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  background: var(--bg-card);
  padding: 32px;
  text-align: center;
  border: 1px dashed var(--border-subtle);
}''', css)

with open('components.css', 'w') as f:
    f.write(css)
