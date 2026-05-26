## 2025-02-21 - Add Content Security Policy
**Vulnerability:** The application was lacking a Content Security Policy (CSP), which is a crucial defense-in-depth mechanism to mitigate Cross-Site Scripting (XSS) and other code injection attacks.
**Learning:** The application is a standalone, client-side web app without a build step or external dependencies. This makes it an ideal candidate for a strict CSP, but since it relies heavily on inline styles for layout adjustments, `unsafe-inline` was required for styles.
**Prevention:** Always implement a baseline CSP in web applications to restrict the execution of unauthorized scripts and enforce secure resource loading.
