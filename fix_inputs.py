import re

with open('components.css', 'r') as f:
    css = f.read()

# Make the feature details alert cleaner
css = re.sub(r'\.feature-details \{\n  border-radius: var\(--radius-md\);\n  border-color: rgba\(109, 231, 255, 0\.28\);\n  color: #e8fff7;\n  background:\n    linear-gradient\(135deg, rgba\(109, 231, 255, 0\.12\), rgba\(66, 245, 167, 0\.07\)\),\n    rgba\(5, 11, 14, 0\.78\);\n\}', r'''.feature-details {
  border-radius: var(--radius-lg);
  border: 1px solid var(--primary-blue);
  color: var(--text-main);
  background: rgba(10, 132, 255, 0.1);
  padding: 16px;
  font-weight: 500;
}''', css)

# Fix live dot
css = re.sub(r'\.live-dot \{\n  padding: 8px 10px;\n  border: 1px solid rgba\(66, 245, 167, 0\.18\);\n  border-radius: 999px;\n  color: #a9ffd5;\n  background: rgba\(66, 245, 167, 0\.08\);\n\}', r'''.live-dot {
  padding: 6px 12px;
  border: 1px solid var(--accent-green);
  border-radius: 999px;
  color: var(--accent-green);
  background: rgba(50, 215, 75, 0.1);
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}''', css)

# Make pro tip card cleaner
css = re.sub(r'\.pro-tip-card \{\n  grid-template-columns: 52px minmax\(0, 1fr\) 150px;\n  min-height: 158px;\n  padding: 22px;\n  border-color: rgba\(66, 245, 167, 0\.2\);\n  background:\n    linear-gradient\(115deg, rgba\(66, 245, 167, 0\.14\), transparent 36%\),\n    linear-gradient\(145deg, rgba\(30, 25, 47, 0\.86\), rgba\(8, 13, 17, 0\.92\)\);\n\}', r'''.pro-tip-card {
  grid-template-columns: 52px minmax(0, 1fr) 150px;
  min-height: 140px;
  padding: 24px;
  border: 1px solid var(--accent-green);
  background: var(--bg-card-strong);
  border-radius: var(--radius-xl);
}''', css)

css = re.sub(r'\.tip-art \{\n  width: 138px;\n  height: 90px;\n  border-radius: var\(--radius-lg\);\n  background:\n    linear-gradient\(90deg, rgba\(66, 245, 167, 0\.82\) 0 9px, transparent 9px 18px\),\n    linear-gradient\(180deg, rgba\(109, 231, 255, 0\.5\), rgba\(247, 201, 72, 0\.34\)\),\n    rgba\(255, 255, 255, 0\.05\);\n  filter: drop-shadow\(0 18px 30px rgba\(0, 0, 0, 0\.34\)\);\n\}', r'''.tip-art {
  display: none;
}''', css)

# Fix scenario card
css = re.sub(r'\.scenario-card \{\n  padding: 16px;\n  border-color: rgba\(190, 223, 217, 0\.13\);\n  border-radius: var\(--radius-md\);\n  background: rgba\(5, 10, 12, 0\.58\);\n\}', r'''.scenario-card {
  padding: 24px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: var(--bg-field);
}''', css)


with open('components.css', 'w') as f:
    f.write(css)
