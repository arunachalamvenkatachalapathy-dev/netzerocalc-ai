import puppeteer from 'puppeteer';
import path from 'path';

const SCREENSHOT_DIR = 'C:\\Users\\NALINI ARUN\\.gemini\\antigravity\\brain\\9987ccd0-6929-4c34-8088-a34ee720b8f9';

async function runBrowserTest() {
  console.log('--- Starting Part 3 Multi-Year Trends & YoY E2E Browser Test ---');
  
  let browser;
  try {
    console.log('Launching headless Chromium with Puppeteer...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1050 });

    page.on('console', msg => {
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });

    // Bypass landing page directly to workspace
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('netzerocalc_has_visited', 'true');
    });

    console.log('Navigating to http://localhost:4177...');
    await page.goto('http://localhost:4177', { waitUntil: ['load', 'networkidle0'], timeout: 35000 });

    console.log('Page loaded. Locating and clicking "GHG Master Sheet" tab...');
    await page.waitForSelector('button', { timeout: 10000 });

    const clickedTab = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const ghgTab = buttons.find(b => b.textContent && b.textContent.includes('GHG Master Sheet'));
      if (ghgTab) {
        ghgTab.click();
        return true;
      }
      return false;
    });

    if (!clickedTab) {
      throw new Error('Failed to find and click "GHG Master Sheet" tab');
    }

    console.log('Clicked "GHG Master Sheet". Waiting for ledger view...');
    await page.waitForFunction(
      () => document.body.innerText.includes('Corporate Emissions Accounting Engine'),
      { timeout: 15000 }
    );

    // Locate and click "Trends & YoY Trajectory" subtab
    console.log('Locating and clicking "Trends & YoY Trajectory" subtab...');
    const clickedTrends = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const trendsBtn = buttons.find(b => b.textContent && b.textContent.includes('Trends & YoY Trajectory'));
      if (trendsBtn) {
        trendsBtn.click();
        return true;
      }
      return false;
    });

    if (!clickedTrends) {
      throw new Error('Failed to find and click "Trends & YoY Trajectory" subtab');
    }

    await new Promise(r => setTimeout(r, 1200));

    // Verify Trends & YoY content rendered
    console.log('Verifying Trends & YoY view elements...');
    const trendsText = await page.evaluate(() => document.body.innerText);
    if (!trendsText.includes('Multi-Year Emissions Trends & SBTi Trajectory') ||
        !trendsText.includes('Multi-Year Emissions Trajectory') ||
        !trendsText.includes('Scope Breakdown') ||
        !trendsText.includes('Year-on-Year (YoY) Change Analysis')) {
      throw new Error('Missing key Trends & YoY sections from rendered DOM');
    }

    // Verify SVG Line Chart and Donut Chart exist
    const hasSvgElements = await page.evaluate(() => {
      const svgs = document.querySelectorAll('svg');
      return svgs.length >= 2;
    });

    if (!hasSvgElements) {
      throw new Error('Expected SVG line and donut charts in DOM');
    }

    // Capture Line & Donut Chart Screenshot
    const chartShot = path.join(SCREENSHOT_DIR, 'ghg_trends_line_and_donut.png');
    await page.screenshot({ path: chartShot });
    console.log(`Saved screenshot: ${chartShot}`);

    // Scroll down to YoY Cards and Historical Table
    await page.evaluate(() => {
      window.scrollBy(0, 450);
    });
    await new Promise(r => setTimeout(r, 500));

    // Capture YoY and Table Screenshot
    const yoyShot = path.join(SCREENSHOT_DIR, 'ghg_trends_yoy_and_table.png');
    await page.screenshot({ path: yoyShot });
    console.log(`Saved screenshot: ${yoyShot}`);

    console.log('--- ALL PART 3 TRENDS & YOY BROWSER TESTS PASSED! ---');
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runBrowserTest();
