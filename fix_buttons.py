import re

with open('components.css', 'r') as f:
    css = f.read()

# Make icon button match Apple style
css = re.sub(r'button\.small \{\n  min-height: 36px;\n  border-radius: var\(--radius-sm\);\n\}', r'''button.small {
  min-height: 32px;
  border-radius: var(--radius-sm);
  padding: 0 12px;
  font-size: 13px;
}''', css)

# Make sure buttons look clean inside rows
css += '''
.preset-row button,
.actions button,
.history-actions button {
  flex: 1;
}
'''

# Update button text color for blue
css = re.sub(r'button\.blue \{\n  color: #031014;\n  background: linear-gradient\(180deg, #9ff4ff, #54d7ef\);\n  box-shadow: 0 16px 34px rgba\(109, 231, 255, 0\.16\), inset 0 1px 0 rgba\(255, 255, 255, 0\.34\);\n\}', r'''button.blue {
  color: #fff;
  background: var(--primary-blue);
  box-shadow: none;
  border: none;
}''', css)

with open('components.css', 'w') as f:
    f.write(css)
