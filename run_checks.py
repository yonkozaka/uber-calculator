import re

with open('variables.css', 'r') as f:
    css_vars = f.read()
    if '150ms ease' not in css_vars:
        print("Variables issue")

with open('components.css', 'r') as f:
    css_comp = f.read()
    if 'display: none' not in css_comp:
        print("Components issue")

with open('styles.css', 'r') as f:
    css_styles = f.read()
    if 'var(--bg-main)' not in css_styles:
        print("Styles issue")

print("Checks complete")
