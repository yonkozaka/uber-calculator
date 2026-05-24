import re

with open('components.css', 'r') as f:
    css = f.read()

# Make positive/negative text colors use the new vars
css = re.sub(r'\.positive \{ color: var\(--accent-green\) !important; \}', r'''.positive { color: var(--accent-green) !important; }''', css)
css = re.sub(r'\.negative \{ color: var\(--accent-red\) !important; \}', r'''.negative { color: var(--accent-red) !important; }''', css)

# Make badges cleaner
css = re.sub(r'\.decision-badge \{\n  border-radius: var\(--radius-md\);\n  border-color: rgba\(247, 201, 72, 0\.34\);\n  color: var\(--accent-yellow\);\n  background:\n    linear-gradient\(135deg, rgba\(247, 201, 72, 0\.14\), transparent\),\n    rgba\(247, 201, 72, 0\.07\);\n\}', r'''.decision-badge {
  border-radius: var(--radius-md);
  border: 1px solid var(--accent-yellow);
  color: var(--accent-yellow);
  background: rgba(255, 214, 10, 0.1);
  padding: 12px;
  text-align: center;
  font-weight: 600;
}''', css)

css = re.sub(r'\.decision-badge\.good \{\n  color: var\(--accent-green\);\n  border-color: rgba\(66, 245, 167, 0\.4\);\n  background:\n    linear-gradient\(135deg, rgba\(66, 245, 167, 0\.15\), transparent\),\n    rgba\(66, 245, 167, 0\.08\);\n\}', r'''.decision-badge.good {
  color: var(--accent-green);
  border-color: var(--accent-green);
  background: rgba(50, 215, 75, 0.1);
}''', css)

css = re.sub(r'\.decision-badge\.bad \{\n  color: var\(--accent-red\);\n  border-color: rgba\(255, 93, 125, 0\.4\);\n  background:\n    linear-gradient\(135deg, rgba\(255, 93, 125, 0\.16\), transparent\),\n    rgba\(255, 93, 125, 0\.08\);\n\}', r'''.decision-badge.bad {
  color: var(--accent-red);
  border-color: var(--accent-red);
  background: rgba(255, 69, 58, 0.1);
}''', css)


# Wide metric cleaner
css = re.sub(r'\.wide-metric \{\n  border-color: rgba\(66, 245, 167, 0\.28\) !important;\n  background:\n    linear-gradient\(135deg, rgba\(66, 245, 167, 0\.11\), rgba\(109, 231, 255, 0\.055\)\),\n    rgba\(8, 15, 16, 0\.92\) !important;\n\}', r'''.wide-metric {
  border-color: var(--accent-green) !important;
  background: rgba(50, 215, 75, 0.05) !important;
}''', css)


with open('components.css', 'w') as f:
    f.write(css)
