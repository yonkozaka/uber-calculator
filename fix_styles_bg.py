import re

with open('styles.css', 'r') as f:
    css = f.read()

css = re.sub(r'border-radius: 0 0 var\(--radius-2xl\) var\(--radius-2xl\);\n  background:\n    radial-gradient\(circle at 80% 5%, rgba\(100, 216, 255, 0\.06\), transparent 24rem\),\n    rgba\(5, 9, 20, 0\.48\);\n  box-shadow: var\(--shadow-card\);\n  backdrop-filter: blur\(24px\);\n\}', r'''border-radius: 0 0 var(--radius-2xl) var(--radius-2xl);
  background: var(--bg-main);
  box-shadow: var(--shadow-card);
}''', css)

with open('styles.css', 'w') as f:
    f.write(css)
