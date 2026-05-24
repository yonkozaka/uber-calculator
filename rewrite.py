import re

with open('variables.css', 'w') as f:
    f.write('''/* Clean, Apple/Stripe inspired tokens */
:root {
  color-scheme: dark;

  --bg-main: #000000;
  --bg-page-2: #0a0a0a;
  --bg-page-3: #111111;
  --bg-card: rgba(28, 28, 30, 0.6);
  --bg-card-strong: #1c1c1e;
  --bg-glass: rgba(28, 28, 30, 0.4);
  --bg-field: rgba(255, 255, 255, 0.05);
  --bg-field-hover: rgba(255, 255, 255, 0.08);
  --bg-raised: #2c2c2e;
  --bg-rail: rgba(255, 255, 255, 0.05);

  --primary-blue: #0A84FF;
  --primary-purple: #BF5AF2;
  --primary-pink: #FF375F;
  --primary: #0A84FF;
  --accent-green: #32D74B;
  --accent-yellow: #FFD60A;
  --accent-red: #FF453A;
  --accent-orange: #FF9F0A;
  --accent-teal: #64D2FF;

  --text-main: #F5F5F7;
  --text-secondary: #86868B;
  --text-soft: #A1A1A6;
  --text-muted: #6E6E73;
  --border-subtle: rgba(255, 255, 255, 0.1);
  --border-strong: rgba(255, 255, 255, 0.2);
  --border-glow: rgba(10, 132, 255, 0.3);

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 28px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-14: 56px;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;
  --radius-2xl: 24px;

  --shadow-soft: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-card: 0 8px 24px rgba(0, 0, 0, 0.2);
  --shadow-lift: 0 12px 32px rgba(0, 0, 0, 0.3);
  --shadow-glow-blue: 0 4px 12px rgba(10, 132, 255, 0.2);
  --shadow-glow-green: 0 4px 12px rgba(50, 215, 75, 0.2);
  --shadow-glow-purple: 0 4px 12px rgba(191, 90, 242, 0.2);
  --focus-ring: 0 0 0 4px rgba(10, 132, 255, 0.3);

  --transition-fast: 150ms ease;
  --transition-med: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);
}
''')
