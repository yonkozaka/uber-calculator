import re

with open('components.css', 'r') as f:
    css = f.read()

# Make rounded corners bigger
css = css.replace('--radius-sm: 6px;', '--radius-sm: 8px;')
css = css.replace('--radius-md: 8px;', '--radius-md: 12px;')
css = css.replace('--radius-lg: 8px;', '--radius-lg: 16px;')
css = css.replace('--radius-xl: 8px;', '--radius-xl: 20px;')
css = css.replace('--radius-2xl: 8px;', '--radius-2xl: 24px;')

# Remove gradients from buttons and use solid colors
css = re.sub(r'button \{\n  min-height: 48px;\n  border-radius: var\(--radius-md\);\n  color: #04100c;\n  background: linear-gradient\(180deg, #7bffc2, #36d98f\);\n  box-shadow: 0 16px 34px rgba\(66, 245, 167, 0\.16\), inset 0 1px 0 rgba\(255, 255, 255, 0\.36\);\n\}', r'''button {
  min-height: 44px;
  border-radius: var(--radius-md);
  color: #fff;
  background: var(--primary-blue);
  box-shadow: var(--shadow-soft);
  border: none;
  font-weight: 600;
  transition: all var(--transition-fast);
}''', css)

css = re.sub(r'button:hover,\nbutton:focus-visible \{\n  transform: translateY\(-1px\);\n  border-color: rgba\(66, 245, 167, 0\.55\);\n  box-shadow: var\(--focus-ring\), 0 18px 42px rgba\(0, 0, 0, 0\.32\);\n\}', r'''button:hover,
button:focus-visible {
  transform: translateY(-1px);
  background: #0071E3; /* Darker Apple Blue */
  box-shadow: var(--shadow-card);
}''', css)

# Make inputs look more Apple-like
css = re.sub(r'input,\nselect \{\n  min-height: 52px;\n  border-radius: var\(--radius-md\);\n  border-color: rgba\(190, 223, 217, 0\.16\);\n  color: #f8fffb;\n  background:\n    linear-gradient\(180deg, rgba\(255, 255, 255, 0\.04\), transparent\),\n    var\(--bg-field\);\n  box-shadow: inset 0 1px 0 rgba\(255, 255, 255, 0\.055\), 0 1px 0 rgba\(255, 255, 255, 0\.025\);\n\}', r'''input,
select {
  min-height: 44px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  background: var(--bg-field);
  padding: 0 12px;
  font-size: 15px;
  transition: all var(--transition-fast);
  box-shadow: none;
}''', css)

css = re.sub(r'input:hover,\nselect:hover \{\n  border-color: rgba\(109, 231, 255, 0\.34\);\n  background: var\(--bg-field-hover\);\n\}', r'''input:hover,
select:hover {
  border-color: var(--border-strong);
  background: var(--bg-field-hover);
}''', css)

css = re.sub(r'input:focus,\nselect:focus,\ninput:focus-visible,\nselect:focus-visible \{\n  border-color: rgba\(66, 245, 167, 0\.72\);\n  box-shadow: var\(--focus-ring\), inset 0 1px 0 rgba\(255, 255, 255, 0\.07\);\n\}', r'''input:focus,
select:focus,
input:focus-visible,
select:focus-visible {
  border-color: var(--primary-blue);
  box-shadow: var(--focus-ring);
  outline: none;
}''', css)

# Simplify secondary buttons
css = re.sub(r'button\.secondary,\n\.icon-button \{\n  color: #f4fffb;\n  background:\n    linear-gradient\(180deg, rgba\(255, 255, 255, 0\.055\), rgba\(255, 255, 255, 0\.015\)\),\n    rgba\(10, 16, 19, 0\.88\);\n  border-color: rgba\(190, 223, 217, 0\.18\);\n  box-shadow: inset 0 1px 0 rgba\(255, 255, 255, 0\.055\);\n\}', r'''button.secondary,
.icon-button {
  color: var(--text-main);
  background: var(--bg-raised);
  border: 1px solid var(--border-subtle);
  box-shadow: none;
}''', css)

css = re.sub(r'button\.secondary:hover,\nbutton\.secondary:focus-visible,\n\.icon-button:hover,\n\.icon-button:focus-visible \{\n  border-color: rgba\(109, 231, 255, 0\.52\);\n  box-shadow: var\(--shadow-glow-blue\), 0 18px 42px rgba\(0, 0, 0, 0\.28\);\n\}', r'''button.secondary:hover,
button.secondary:focus-visible,
.icon-button:hover,
.icon-button:focus-visible {
  border-color: var(--border-strong);
  background: #3a3a3c;
  box-shadow: var(--shadow-soft);
}''', css)

# Simplify danger button
css = re.sub(r'button\.danger \{\n  color: #fff;\n  background: linear-gradient\(180deg, #ff849b, #db3c5f\);\n  box-shadow: 0 16px 34px rgba\(255, 93, 125, 0\.16\), inset 0 1px 0 rgba\(255, 255, 255, 0\.24\);\n\}', r'''button.danger {
  color: #fff;
  background: var(--accent-red);
  box-shadow: none;
  border: none;
}''', css)

with open('components.css', 'w') as f:
    f.write(css)
