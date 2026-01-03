from playwright.sync_api import sync_playwright

def verify_tech_demo():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            page.goto("http://localhost:4321/blog/tech-demo/", timeout=60000)
        except Exception as e:
            print(f"Failed to load page: {e}")
            browser.close()
            return

        # 1. Verify Theme Toggle is present in Header
        try:
            toggle = page.get_by_role("radiogroup", name="Theme toggle")
            toggle.wait_for(state="visible", timeout=10000)
            print("Theme toggle is visible")
        except Exception as e:
            print(f"Theme toggle not found: {e}")

        # 2. Verify Icons are present (check for new variant style class or just text)
        try:
            lightning = page.get_by_text("Lightning Fast")
            lightning.wait_for(state="visible", timeout=5000)
            print("IconBlock 'Lightning Fast' visible")
        except Exception as e:
            print(f"IconBlock 'Lightning Fast' not found: {e}")

        # Screenshot icons
        try:
            icons_section = page.get_by_text("1. Icons and styling") # Updated header text
            icons_section.scroll_into_view_if_needed()
            page.wait_for_timeout(500)
            page.screenshot(path="verification/tech_demo_icons_v2.png")
            print("Screenshot saved to verification/tech_demo_icons_v2.png")
        except Exception as e:
            print(f"Failed to screenshot icons: {e}")

        # 3. Test Toggle Interaction
        try:
            dark_btn = page.get_by_role("radio", name="Dark")
            if dark_btn.is_visible():
                dark_btn.click()
                page.wait_for_selector("html.dark", timeout=5000)
                print("Dark mode activated")
                page.wait_for_timeout(1000)
                page.screenshot(path="verification/tech_demo_dark_v2.png")
                print("Screenshot saved to verification/tech_demo_dark_v2.png")
            else:
                print("Dark radio button not visible")
        except Exception as e:
            print(f"Failed to test dark mode toggle: {e}")

        browser.close()

if __name__ == "__main__":
    verify_tech_demo()
