import re

with open('styles.css', 'r') as f:
    css = f.read()

# Just force replace the background rule for dashboard-grid
css = re.sub(r'(\.dashboard-grid \{[^}]+?)background:[^;}]+;([^}]+?\})', r'\1background: var(--bg-main);\2', css)

with open('styles.css', 'w') as f:
    f.write(css)
