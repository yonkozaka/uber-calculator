import subprocess
from playwright.sync_api import sync_playwright

proc = subprocess.Popen(["python3", "-m", "http.server", "8080"])
try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: errors.append(err))

        page.goto('http://localhost:8080/index.html')
        page.wait_for_timeout(2000)

        print("Errors:", errors)
        browser.close()
finally:
    proc.terminate()
