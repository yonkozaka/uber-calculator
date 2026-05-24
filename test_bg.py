import re

with open('styles.css', 'r') as f:
    css = f.read()

# Replace the old dashboard grid background with var(--bg-main) directly
css = re.sub(
    r'\.dashboard-grid \{\n  display: grid;\n  grid-template-columns: minmax\(0, 1\.1fr\) minmax\(400px, 0\.9fr\);\n  gap: var\(--space-8\);\n  padding: var\(--space-8\);\n  border-right: 1px solid var\(--border-subtle\);\n  border-left: 1px solid var\(--border-subtle\);\n  border-bottom: 1px solid var\(--border-subtle\);\n  border-radius: 0 0 var\(--radius-2xl\) var\(--radius-2xl\);\n  background: var\(--bg-main\);\n  box-shadow: var\(--shadow-card\);\n\}',
    r'''.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(400px, 0.9fr);
  gap: var(--space-8);
  padding: var(--space-8);
  border-right: 1px solid var(--border-subtle);
  border-left: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
  border-radius: 0 0 var(--radius-2xl) var(--radius-2xl);
  background: var(--bg-main);
  box-shadow: var(--shadow-card);
}''', css)

# Make sure it's saved. But actually it looks like the previous replacement didn't work because the original string had changed.
with open('styles.css', 'w') as f:
    f.write(css)
