from playwright.sync_api import sync_playwright, expect

def verify(page):
    print("Navigating to tech demo...")
    response = page.goto("http://localhost:4321/blog/2024-05-20_tech-demo/")
    print(f"Response status: {response.status}")

    if response.status != 200:
        print("Failed to load page")
        return

    # Wait for hydration
    page.wait_for_load_state("networkidle")

    # Take screenshot
    print("Taking screenshot...")
    page.screenshot(path="/app/verification/tech-demo.png", full_page=True)
    print("Screenshot saved.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
