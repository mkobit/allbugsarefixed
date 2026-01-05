from playwright.sync_api import sync_playwright

def verify_blog_features():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the tech demo blog post
        # Note: slug changed to include date
        url = "http://localhost:4321/blog/2024-05-20-tech-demo/"
        print(f"Navigating to {url}")
        page.goto(url)

        # 1. Verify TOC exists and has entries
        print("Checking TOC...")
        toc = page.locator("nav.toc")
        if toc.count() == 0:
            print("Error: TOC not found")
        else:
            print("TOC found")

        # 2. Verify Tags
        print("Checking Tags...")
        demo_tag = page.get_by_text("Demo", exact=True)
        if demo_tag.count() > 0:
             print("Demo tag found")
        else:
             print("Error: Demo tag not found")

        # 3. Verify Metadata (Reading time)
        print("Checking Metadata...")
        reading_time = page.get_by_text("min read")
        if reading_time.count() > 0:
            print(f"Reading time found: {readingTime.text_content()}")
        else:
            print("Error: Reading time not found")

        # 4. Verify Raw Source Link
        print("Checking Raw Source Link...")
        raw_link = page.get_by_text("View Raw Source")
        if raw_link.count() > 0:
            print("Raw source link found")

            # Click it to verify it goes to the right place (checking exact URL match if possible)
            # We expect /blog/2024-05-20-tech-demo.md

            with page.expect_response("**/blog/2024-05-20-tech-demo.md") as response_info:
                raw_link.click()

            response = response_info.value
            if response.ok:
                print("Raw source link works and returns 200")
                text = response.text()
                if "title: \"Tech demo: charts, code, and callouts\"" in text:
                    print("Raw source content verified (contains title)")
                else:
                    print("Raw source content verification failed")
            else:
                print(f"Raw source link failed with status {response.status}")

            page.go_back()
        else:
            print("Error: Raw source link not found")

        browser.close()

if __name__ == "__main__":
    verify_blog_features()
