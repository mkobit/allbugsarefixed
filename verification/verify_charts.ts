import { chromium } from '@playwright/test';

async function verifyCharts() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:4321/blog/tech-demo/');

    // Wait for the chart to be visible
    const chart = page.locator('.echart-container canvas').first();
    await chart.waitFor({ state: 'visible', timeout: 5000 });

    // Scroll to the chart
    await chart.scrollIntoViewIfNeeded();

    // Take a screenshot
    await page.screenshot({ path: 'verification/charts.png', fullPage: true });

    console.log('Verification screenshot saved to verification/charts.png');
  } catch (e) {
    console.error('Verification failed:', e);
  } finally {
    await browser.close();
  }
}

verifyCharts();
