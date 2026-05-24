import re

with open('components.css', 'r') as f:
    css = f.read()

# Make the advisor chat more Apple-like
css = re.sub(r'\.advisor-panel \{\n  border-color: rgba\(109, 231, 255, 0\.18\);\n  background:\n    linear-gradient\(145deg, rgba\(18, 28, 36, 0\.93\), rgba\(7, 11, 14, 0\.92\)\);\n\}', r'''.advisor-panel {
  background: var(--bg-card);
}''', css)

css = re.sub(r'\.advisor-message \{\n  border-radius: var\(--radius-md\);\n  color: #dce9e6;\n  background: rgba\(8, 13, 16, 0\.76\);\n\}', r'''.advisor-message {
  border-radius: var(--radius-lg);
  color: var(--text-main);
  padding: 12px 16px;
  margin-bottom: 8px;
  max-width: 85%;
}''', css)

css = re.sub(r'\.advisor-message\.assistant \{\n  border-color: rgba\(66, 245, 167, 0\.22\);\n  background: linear-gradient\(145deg, rgba\(66, 245, 167, 0\.095\), rgba\(8, 13, 16, 0\.72\)\);\n\}', r'''.advisor-message.assistant {
  background: var(--bg-card-strong);
  border: 1px solid var(--border-subtle);
  border-bottom-left-radius: 4px;
}''', css)

css = re.sub(r'\.advisor-message\.user \{\n  border-color: rgba\(109, 231, 255, 0\.24\);\n  background: linear-gradient\(145deg, rgba\(109, 231, 255, 0\.12\), rgba\(8, 13, 16, 0\.72\)\);\n\}', r'''.advisor-message.user {
  background: var(--primary-blue);
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}''', css)

# Fix advisor message container to allow align-self
css += '''
.advisor-messages {
  display: flex;
  flex-direction: column;
}
'''

# Make the decision console cleaner
css = re.sub(r'\.decision-console \{\n  gap: 14px;\n  padding: 18px;\n  border-color: rgba\(190, 223, 217, 0\.13\);\n  border-radius: var\(--radius-lg\);\n  background:\n    linear-gradient\(160deg, rgba\(66, 245, 167, 0\.08\), transparent 42%\),\n    rgba\(5, 10, 12, 0\.68\);\n\}', r'''.decision-console {
  gap: 16px;
  padding: 24px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  background: var(--bg-card-strong);
  display: flex;
  flex-direction: column;
}''', css)


with open('components.css', 'w') as f:
    f.write(css)
