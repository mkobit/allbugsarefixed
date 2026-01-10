from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:4321")

    # Desktop View
    page.set_viewport_size({"width": 1280, "height": 720})
    page.wait_for_selector("header")
    page.screenshot(path="verification/desktop.png")

    # Mobile View
    page.set_viewport_size({"width": 375, "height": 667})
    page.screenshot(path="verification/mobile_closed.png")

    # Open Mobile Menu
    page.click("button[aria-label=\"Open menu\"]")
    page.wait_for_timeout(300) # Wait for animation
    page.screenshot(path="verification/mobile_open.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
