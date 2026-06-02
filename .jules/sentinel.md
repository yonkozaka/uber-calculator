## 2025-02-21 - Add Content Security Policy
**Vulnerability:** The application was lacking a Content Security Policy (CSP), which is a crucial defense-in-depth mechanism to mitigate Cross-Site Scripting (XSS) and other code injection attacks.
**Learning:** The application is a standalone, client-side web app without a build step or external dependencies. This makes it an ideal candidate for a strict CSP, but since it relies heavily on inline styles for layout adjustments, `unsafe-inline` was required for styles.
**Prevention:** Always implement a baseline CSP in web applications to restrict the execution of unauthorized scripts and enforce secure resource loading.
## 2026-05-27 - Replace Math.random with Web Crypto API
**Vulnerability:** The application was using the weak, non-cryptographically secure pseudo-random number generator `Math.random` to generate unique IDs for shift history entries.
**Learning:** While generating UUIDs or random IDs for simple client-side features may seem innocuous, using weak PRNGs can sometimes lead to collisions or predictability in edge cases. The application has access to modern browser APIs, so using standard cryptographic primitives is a better default.
**Prevention:** Always default to using `crypto.getRandomValues` over `Math.random` whenever generating IDs, tokens, or components that benefit from strong randomness, even in purely client-side applications.
