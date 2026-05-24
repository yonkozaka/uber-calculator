import re

with open('components.css', 'r') as f:
    css = f.read()

# Make background clean solid
css = re.sub(r'body \{\n  margin: 0;\n  min-height: 100vh;\n  color: var\(--text-main\);\n  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;\n  font-size: 15px;\n  line-height: 1\.5;\n  background:\n    radial-gradient\(circle at 12% 0%, rgba\(155, 108, 255, 0\.28\), transparent 28rem\),\n    radial-gradient\(circle at 82% 5%, rgba\(100, 216, 255, 0\.2\), transparent 32rem\),\n    radial-gradient\(circle at 48% 100%, rgba\(56, 248, 165, 0\.1\), transparent 34rem\),\n    linear-gradient\(145deg, var\(--bg-main\), var\(--bg-page-2\) 48%, #030611\);\n\}', r'''body {
  margin: 0;
  min-height: 100vh;
  color: var(--text-main);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 15px;
  line-height: 1.5;
  background: var(--bg-main);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}''', css)

# Remove the grid pattern overlay
css = re.sub(r'body::before \{\n  content: "";\n  position: fixed;\n  inset: 0;\n  pointer-events: none;\n  background-image:\n    linear-gradient\(rgba\(255, 255, 255, 0\.032\) 1px, transparent 1px\),\n    linear-gradient\(90deg, rgba\(255, 255, 255, 0\.032\) 1px, transparent 1px\);\n  background-size: 54px 54px;\n  mask-image: linear-gradient\(to bottom, rgba\(0, 0, 0, 0\.6\), transparent 78%\);\n\}', r'''body::before {
  display: none;
}''', css)


# Fix glass card
css = re.sub(r'\.glass-card \{\n  position: relative;\n  overflow: hidden;\n  border: 1px solid var\(--border-subtle\);\n  border-radius: var\(--radius-xl\);\n  background:\n    linear-gradient\(145deg, rgba\(100, 216, 255, 0\.08\), transparent 36%\),\n    linear-gradient\(180deg, rgba\(255, 255, 255, 0\.07\), rgba\(255, 255, 255, 0\.018\)\),\n    var\(--bg-card\);\n  box-shadow: var\(--shadow-soft\);\n  backdrop-filter: blur\(22px\);\n  transition: transform var\(--transition-med\), border-color var\(--transition-med\), box-shadow var\(--transition-med\), background var\(--transition-med\);\n\}', r'''.glass-card {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  background: var(--bg-card);
  box-shadow: var(--shadow-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: all var(--transition-med);
}''', css)

css = re.sub(r'\.glass-card::before \{\n  content: "";\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n  background: linear-gradient\(115deg, rgba\(100, 216, 255, 0\.12\), transparent 34%, rgba\(155, 108, 255, 0\.1\)\);\n  opacity: 0\.52;\n\}', r'''.glass-card::before {
  display: none;
}''', css)

css = re.sub(r'\.glass-card:hover \{\n  transform: translateY\(-2px\);\n  border-color: rgba\(100, 216, 255, 0\.28\);\n  box-shadow: var\(--shadow-lift\);\n\}', r'''.glass-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-strong);
  box-shadow: var(--shadow-lift);
}''', css)


with open('components.css', 'w') as f:
    f.write(css)
