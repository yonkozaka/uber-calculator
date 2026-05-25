## 2024-05-25 - Standardize Component Colors
**Learning:** Having competing CSS paradigms (utility classes, complex BEM, and broad HTML tag styling) can cause subtle visual bugs like default blue browser colors overriding intended theming. Consolidating identical global CSS rules is just as important as fixing the specific miscolored elements.
**Action:** Always scan for duplicate tag-level styles in `components.css` when cleaning up UI themes, and lean heavily into single source of truth CSS custom variables (e.g., `var(--accent-green)`) replacing hardcoded RGBA and disjoint color classes.
