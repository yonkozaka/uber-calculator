import re

with open('components.css', 'r') as f:
    css = f.read()

# Typography
css = re.sub(r'h1 \{\n  margin: 0;\n  font-size: clamp\(2rem, 3\.8vw, 4\.4rem\);\n  line-height: 0\.95;\n  letter-spacing: 0;\n\}', r'''h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.5rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
  font-weight: 700;
}''', css)

css = re.sub(r'h2 \{\n  margin: 0;\n  font-size: 1\.08rem;\n  line-height: 1\.25;\n  letter-spacing: 0;\n\}', r'''h2 {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.3;
  letter-spacing: -0.01em;
  font-weight: 600;
}''', css)

css = re.sub(r'label \{\n  display: block;\n  margin-bottom: var\(--space-2\);\n  color: var\(--text-soft\);\n  font-size: 0\.78rem;\n  font-weight: 800;\n  letter-spacing: 0\.02em;\n  text-transform: uppercase;\n\}', r'''label {
  display: block;
  margin-bottom: var(--space-2);
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0;
}''', css)

with open('components.css', 'w') as f:
    f.write(css)
