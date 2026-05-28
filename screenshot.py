from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:8080')
    page.wait_for_timeout(1000)
    page.screenshot(path='screenshot.png')

    # Try tab interaction
    page.click('button[data-tab="trip-evaluator"]')
    page.wait_for_timeout(500)
    page.screenshot(path='screenshot-tab.png')

    browser.close()
