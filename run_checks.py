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
import subprocess
import sys

print("Running test_utils.js...")
result_utils = subprocess.run(['node', 'test_utils.js'], capture_output=True, text=True)
print(result_utils.stdout)
if result_utils.returncode != 0:
    print(result_utils.stderr)
    print("Utils tests failed!")
    sys.exit(1)

print("Running test_app.js...")
result = subprocess.run(['node', 'test_app.js'], capture_output=True, text=True)
print(result.stdout)
if result.returncode != 0:
    print(result.stderr)
    print("JS tests failed!")
    sys.exit(1)
