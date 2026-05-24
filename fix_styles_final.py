import re

with open('styles.css', 'r') as f:
    css = f.read()

css = re.sub(r'\.section-kicker span \{\n  color: #89fbd0;\n  font-size: 0\.7rem;\n\}', r'''.section-kicker span {
  color: var(--accent-green);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}''', css)

css = re.sub(r'\.section-kicker strong \{\n  color: #d9e8e4;\n  font-size: 0\.9rem;\n\}', r'''.section-kicker strong {
  color: var(--text-main);
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}''', css)

# Make pro tips title color match
css = re.sub(r'\.pro-tip-card h2 \{\n  color: #ffffff;\n\}', r'''.pro-tip-card h2 {
  color: var(--text-main);
}''', css)

# Make sure top results font scales well
css = re.sub(r'\.mini-result\.priority-metric span \{\n  font-size: clamp\(1\.55rem, 2\.8vw, 2\.35rem\);\n\}', r'''.mini-result.priority-metric span {
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  color: var(--accent-green);
}''', css)

# Make mobile summary cleaner
css = re.sub(r'\.mobile-summary \{\n  left: 12px;\n  right: 12px;\n  bottom: 12px;\n  border-color: rgba\(66, 245, 167, 0\.38\);\n  border-radius: var\(--radius-lg\);\n  background: rgba\(5, 8, 10, 0\.95\);\n\}', r'''.mobile-summary {
  left: 16px;
  right: 16px;
  bottom: 16px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  background: var(--bg-card-strong);
  box-shadow: var(--shadow-card);
  padding: 12px;
  gap: 8px;
}''', css)

css = re.sub(r'\.mobile-summary div \{\n  border-radius: var\(--radius-md\);\n  background: rgba\(13, 21, 24, 0\.92\);\n\}', r'''.mobile-summary div {
  border-radius: var(--radius-md);
  background: var(--bg-field);
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}''', css)

with open('styles.css', 'w') as f:
    f.write(css)
