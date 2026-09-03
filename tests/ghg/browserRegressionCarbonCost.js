import puppeteer from 'puppeteer';
import path from 'path';

const SCREENSHOT_DIR = 'C:\\Users\\NALINI ARUN\\.gemini\\antigravity\\brain\\9987ccd0-6929-4c34-8088-a34ee720b8f9';

async function runBrowserTest() {
  console.log('--- Starting Part 5 Carbon Cost Exposure & Shadow Pricing E2E Browser Test ---');
  
  let browser;
  try {
    console.log('Launching headless Chromium with Puppeteer...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1100 });

    page.on('console', msg => {
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });

    // Bypass landing page directly to workspace
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('netzerocalc_has_visited', 'true');
    });

    console.log('Navigating to http://localhost:4180...');
    await page.goto('http://localhost:4180', { waitUntil: ['load', 'networkidle0'], timeout: 35000 });

    // 1. Test Access Point 1: Tools & Registry Dropdown -> Carbon Cost
    console.log('Opening Tools & Registry dropdown...');
    await page.waitForSelector('button', { timeout: 10000 });
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const toolsBtn = buttons.find(b => b.textContent && b.textContent.includes('Tools & Registry'));
      if (toolsBtn) toolsBtn.click();
    });

    await new Promise(r => setTimeout(r, 600));

    console.log('Clicking "Carbon Cost & Shadow Pricing" dropdown item...');
    const clickedCarbonCost = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const carbonBtn = buttons.find(b => b.textContent && b.textContent.includes('Carbon Cost & Shadow Pricing'));
      if (carbonBtn) {
        carbonBtn.click();
        return true;
      }
      return false;
    });

    if (!clickedCarbonCost) {
      throw new Error('Failed to find "Carbon Cost & Shadow Pricing" in Tools dropdown');
    }

    await new Promise(r => setTimeout(r, 1200));

    // Verify Carbon Cost view rendered
    console.log('Verifying Carbon Cost view elements...');
    const text1 = await page.evaluate(() => document.body.innerText);
    if (!text1.includes('Carbon Cost Exposure & Shadow Pricing') ||
        !text1.includes('2030 Exposure Target') ||
        !text1.includes('Corporate Carbon Balance Sheet Liability Matrix') ||
        !text1.includes('Internal Shadow Carbon Pricing')) {
      throw new Error('Missing key Carbon Cost sections from rendered DOM');
    }

    // Capture standalone view screenshot
    const shot1 = path.join(SCREENSHOT_DIR, 'ghg_carbon_cost_view.png');
    await page.screenshot({ path: shot1 });
    console.log(`Saved screenshot: ${shot1}`);

    // 2. Test Access Point 2: Corporate GHG Ledger Sub-Tab
    console.log('Clicking "GHG Master Sheet" tab...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const ghgTab = buttons.find(b => b.textContent && b.textContent.includes('GHG Master Sheet'));
      if (ghgTab) ghgTab.click();
    });

    await page.waitForFunction(
      () => document.body.innerText.includes('Corporate Emissions Accounting Engine'),
      { timeout: 15000 }
    );

    console.log('Clicking "Carbon Cost Exposure" subtab inside ledger...');
    const clickedSubtab = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const subtabBtn = buttons.find(b => b.textContent && b.textContent.includes('Carbon Cost Exposure'));
      if (subtabBtn) {
        subtabBtn.click();
        return true;
      }
      return false;
    });

    if (!clickedSubtab) {
      throw new Error('Failed to click Carbon Cost Exposure subtab');
    }

    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => window.scrollBy(0, 400));
    await new Promise(r => setTimeout(r, 500));

    // Capture subtab screenshot
    const shot2 = path.join(SCREENSHOT_DIR, 'ghg_carbon_cost_subtab.png');
    await page.screenshot({ path: shot2 });
    console.log(`Saved screenshot: ${shot2}`);

    console.log('--- ALL PART 5 CARBON COST BROWSER TESTS PASSED! ---');
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
