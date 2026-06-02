## 2024-05-25 - Standardize Component Colors
**Learning:** Having competing CSS paradigms (utility classes, complex BEM, and broad HTML tag styling) can cause subtle visual bugs like default blue browser colors overriding intended theming. Consolidating identical global CSS rules is just as important as fixing the specific miscolored elements.
**Action:** Always scan for duplicate tag-level styles in `components.css` when cleaning up UI themes, and lean heavily into single source of truth CSS custom variables (e.g., `var(--accent-green)`) replacing hardcoded RGBA and disjoint color classes.
## 2026-06-02 - Mobile Logo Alignment
**Learning:** Using `align-items: flex-start;` in flexbox containers with responsive layout can cause branding elements like logos and text titles to appear unaligned or visually unbalanced on smaller screens.
**Action:** Always prefer `align-items: center;` when creating header branding blocks to ensure consistent vertical alignment of logos with their accompanying titles, especially during responsive breakpoints.
