from playwright.sync_api import sync_playwright

def verify_blog_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the blog index page
        print("Navigating to /blog/...")
        page.goto("http://localhost:4321/blog/")

        # Verify the H1 header change
        print("Checking H1 header...")
        h1 = page.locator("h1")
        h1_text = h1.inner_text()
        print(f"H1 text: '{h1_text}'")
        if h1_text != "All posts":
            print(f"FAIL: Expected H1 'All posts', got '{h1_text}'")
        else:
            print("PASS: H1 is 'All posts'")

        # Take a screenshot of the blog index
        page.screenshot(path="verification/blog_index.png")
        print("Screenshot saved to verification/blog_index.png")

        # Click on the new post link
        print("Clicking on 'Measuring the cost of work commuting'...")
        # Note: The BlogCard might truncate description, but title should be there
        # We can find the link by the text or href. The href relies on the ID.
        # ID is 2024-01-01_measuring-commute-cost

        # Verify the post exists in the list by title
        post_link = page.get_by_role("link", name="Measuring the cost of work commuting")
        if post_link.count() > 0:
             print("PASS: Post link found")
             post_link.first.click()
             page.wait_for_load_state("networkidle")

             # Verify Post Title H1
             post_h1 = page.locator("h1").inner_text()
             print(f"Post H1: '{post_h1}'")

             # Take a screenshot of the post
             page.screenshot(path="verification/blog_post.png")
             print("Screenshot saved to verification/blog_post.png")
        else:
             print("FAIL: Post link not found. Dumping page text:")
             print(page.inner_text("body"))

        browser.close()

if __name__ == "__main__":
    verify_blog_changes()
