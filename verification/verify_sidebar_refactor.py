from playwright.sync_api import sync_playwright

def verify_sidebar_refactor():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to homepage
        page.goto("http://localhost:4321/")

        # Wait for sidebar
        page.wait_for_selector("aside")

        # Take screenshot of initial state (desktop)
        page.screenshot(path="verification/refactor_sidebar_desktop.png")

        # Check if search input exists
        if page.is_visible("#sidebar-search-input"):
             print("Search Input Visible")
        else:
             print("Search Input NOT Visible")

        # Type in search
        page.fill("#sidebar-search-input", "tech")
        page.wait_for_timeout(500)
        page.screenshot(path="verification/refactor_sidebar_search.png")

        browser.close()

if __name__ == "__main__":
    verify_sidebar_refactor()
