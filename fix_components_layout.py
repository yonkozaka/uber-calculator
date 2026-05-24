import re

with open('styles.css', 'r') as f:
    css = f.read()

# Space out inputs
css = re.sub(r'\.form-grid \{\n  gap: 14px;\n  padding: 20px;\n\}', r'''.form-grid {
  gap: 20px;
  padding: 24px;
}''', css)

css = re.sub(r'\.stacked-fields \{\n  gap: 14px;\n  padding: 20px;\n\}', r'''.stacked-fields {
  gap: 20px;
  padding: 24px;
}''', css)

css = re.sub(r'\.scenario-editor \{\n  gap: 12px;\n  padding: 20px;\n\}', r'''.scenario-editor {
  gap: 20px;
  padding: 24px;
}''', css)

css = re.sub(r'\.top-results,\n\.results-grid \{\n  gap: 12px;\n  padding: 0 20px 20px;\n\}', r'''.top-results,
.results-grid {
  gap: 16px;
  padding: 0 24px 24px;
}''', css)

css = re.sub(r'\.analytics-grid \{\n  gap: 12px;\n  padding: 20px;\n\}', r'''.analytics-grid {
  gap: 16px;
  padding: 24px;
}''', css)


with open('styles.css', 'w') as f:
    f.write(css)
