from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:8080')
    page.wait_for_timeout(1000)

    # Press Tab a few times to focus a tab button
    page.keyboard.press('Tab')
    page.keyboard.press('Tab')
    page.keyboard.press('Tab')
    page.keyboard.press('Tab')
    page.keyboard.press('Tab')
    page.keyboard.press('Tab')
    page.keyboard.press('Tab')
    page.keyboard.press('Tab')
    page.keyboard.press('Tab')
    page.keyboard.press('Tab')

    page.wait_for_timeout(500)
    page.screenshot(path='screenshot-focus.png')

    browser.close()
