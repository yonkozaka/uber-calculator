import re

with open('styles.css', 'r') as f:
    css = f.read()

# Update spacing and layout to be cleaner
css = re.sub(r'\.app-shell \{\n  position: relative;\n  width: min\(1840px, calc\(100% - 30px\)\);\n  margin: 0 auto;\n  padding: var\(--space-5\) 0 112px;\n\}', r'''.app-shell {
  position: relative;
  width: min(1600px, calc(100% - 48px));
  margin: 0 auto;
  padding: var(--space-8) 0 112px;
}''', css)

css = re.sub(r'\.topbar \{\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: var\(--space-6\);\n  min-height: 126px;\n  padding: var\(--space-6\) var\(--space-8\);\n  border: 1px solid var\(--border-subtle\);\n  border-radius: var\(--radius-2xl\) var\(--radius-2xl\) 0 0;\n  background:\n    linear-gradient\(120deg, rgba\(100, 216, 255, 0\.08\), transparent 34%\),\n    rgba\(4, 8, 22, 0\.86\);\n  box-shadow: var\(--shadow-card\);\n  backdrop-filter: blur\(24px\);\n\}', r'''.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  min-height: 100px;
  padding: var(--space-6) var(--space-8);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  background: var(--bg-card);
  box-shadow: var(--shadow-card);
  backdrop-filter: blur(24px);
}''', css)

css = re.sub(r'\.hero-strip \{\n  display: grid;\n  grid-template-columns: minmax\(280px, 0\.95fr\) minmax\(340px, 1\.05fr\);\n  gap: var\(--space-7\);\n  align-items: stretch;\n  padding: var\(--space-7\) var\(--space-8\);\n  border-right: 1px solid var\(--border-subtle\);\n  border-left: 1px solid var\(--border-subtle\);\n  border-bottom: 1px solid var\(--border-subtle\);\n  background:\n    radial-gradient\(circle at 0% 50%, rgba\(155, 108, 255, 0\.14\), transparent 22rem\),\n    rgba\(5, 10, 26, 0\.64\);\n  backdrop-filter: blur\(24px\);\n\}', r'''.hero-strip {
  display: grid;
  grid-template-columns: minmax(280px, 0.95fr) minmax(340px, 1.05fr);
  gap: var(--space-7);
  align-items: stretch;
  padding: var(--space-7) var(--space-8);
  border-right: 1px solid var(--border-subtle);
  border-left: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-card-strong);
}''', css)

css = re.sub(r'\.dashboard-grid \{\n  display: grid;\n  grid-template-columns: minmax\(0, 1\.07fr\) minmax\(450px, 0\.93fr\);\n  gap: var\(--space-8\);\n  padding: var\(--space-8\);\n  border-right: 1px solid var\(--border-subtle\);\n  border-left: 1px solid var\(--border-subtle\);\n  border-bottom: 1px solid var\(--border-subtle\);\n  border-radius: 0 0 var\(--radius-2xl\) var\(--radius-2xl\);\n  background:\n    radial-gradient\(circle at 80% 5%, rgba\(100, 216, 255, 0\.06\), transparent 24rem\),\n    rgba\(5, 9, 20, 0\.48\);\n  box-shadow: var\(--shadow-card\);\n  backdrop-filter: blur\(24px\);\n\}', r'''.dashboard-grid {
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


css = re.sub(r'\.card-heading,\n\.results-head \{\n  display: flex;\n  align-items: flex-start;\n  gap: var\(--space-4\);\n  padding: var\(--space-6\);\n  border-bottom: 1px solid var\(--border-subtle\);\n\}', r'''.card-heading,
.results-head {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-card-strong);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}''', css)


with open('styles.css', 'w') as f:
    f.write(css)
