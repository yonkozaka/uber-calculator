import json

with open('pr_details.json', 'w') as f:
    json.dump({
        "branch_name": "palette-ux-improvements",
        "commit_message": "🎨 Palette: [UX improvement] Enhance UI layout, spacing, typography and inputs",
        "title": "🎨 Palette: [UX improvement] Enhance UI layout, spacing, typography and inputs",
        "description": "💡 What: Refined typography, spacing, input/button styling for a more modern, premium look.\n🎯 Why: To make the interface feel like a polished production web app and improve usability.\n📸 Before/After: Visual layout checked via desktop and mobile screenshots.\n♿ Accessibility: Preserved all WAI-ARIA implementations, focus rings, and contrast."
    }, f)
