import puppeteer from 'puppeteer';
import path from 'path';

const SCREENSHOT_DIR = 'C:\\Users\\NALINI ARUN\\.gemini\\antigravity\\brain\\9987ccd0-6929-4c34-8088-a34ee720b8f9';

async function runBrowserTest() {
  console.log('--- Starting Part 2 Corporate GHG Calculation Ledger E2E Browser Test ---');
  
  let browser;
  try {
    console.log('Launching headless Chromium with Puppeteer...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 950 });

    page.on('console', msg => {
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });

    // Bypass landing page directly to workspace
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('netzerocalc_has_visited', 'true');
    });

    console.log('Navigating to http://localhost:4176...');
    await page.goto('http://localhost:4176', { waitUntil: ['load', 'networkidle0'], timeout: 35000 });

    console.log('Page loaded. Waiting for navigation tabs...');
    await page.waitForSelector('button', { timeout: 10000 });

    // Click on "GHG Master Sheet" tab
    console.log('Locating and clicking "GHG Master Sheet" tab...');
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

    console.log('Clicked "GHG Master Sheet". Waiting for calculation ledger to render...');
    await page.waitForFunction(
      () => document.body.innerText.includes('Corporate Emissions Accounting Engine') ||
            document.body.innerText.includes('Corporate GHG Inventory'),
      { timeout: 15000 }
    );

    // Verify Scope 1 Direct rendered by default
    console.log('Verifying Scope 1 Direct tables...');
    const scope1Text = await page.evaluate(() => document.body.innerText);
    if (!scope1Text.includes('Stationary Combustion') || !scope1Text.includes('Mobile Combustion')) {
      throw new Error('Scope 1 Stationary or Mobile section missing from ledger view');
    }

    // Capture Scope 1 Screenshot
    const scope1Shot = path.join(SCREENSHOT_DIR, 'ghg_ledger_scope1.png');
    await page.screenshot({ path: scope1Shot });
    console.log(`Saved screenshot: ${scope1Shot}`);

    // Switch to Scope 2 Dual-Reporting
    console.log('Clicking "Scope 2 Dual-Reporting" subtab...');
    const clickedScope2 = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const s2Btn = buttons.find(b => b.textContent && b.textContent.includes('Scope 2 Dual-Reporting'));
      if (s2Btn) {
        s2Btn.click();
        return true;
      }
      return false;
    });

    if (!clickedScope2) {
      throw new Error('Failed to click Scope 2 Dual-Reporting subtab');
    }

    await new Promise(r => setTimeout(r, 800));

    // Verify Scope 2 Dual-Reporting content
    const scope2Text = await page.evaluate(() => document.body.innerText);
    if (!scope2Text.includes('Location-Based') || !scope2Text.includes('Market-Based')) {
      throw new Error('Scope 2 Dual-Reporting tables not found');
    }

    // Capture Scope 2 Screenshot
    const scope2Shot = path.join(SCREENSHOT_DIR, 'ghg_ledger_scope2.png');
    await page.screenshot({ path: scope2Shot });
    console.log(`Saved screenshot: ${scope2Shot}`);

    // Switch to Results & Lineage Audit
    console.log('Clicking "Results & Lineage Audit" subtab...');
    const clickedResults = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const resBtn = buttons.find(b => b.textContent && b.textContent.includes('Results & Lineage Audit'));
      if (resBtn) {
        resBtn.click();
        return true;
      }
      return false;
    });

    if (!clickedResults) {
      throw new Error('Failed to click Results & Lineage Audit subtab');
    }

    await new Promise(r => setTimeout(r, 800));

    // Verify Results content
    const resultsText = await page.evaluate(() => document.body.innerText);
    if (!resultsText.includes('Facility Spatial Allocation') || !resultsText.includes('Complete Audit Formula Lineage Log')) {
      throw new Error('Results & Lineage Audit sections not found');
    }

    // Capture Results Screenshot
    const resultsShot = path.join(SCREENSHOT_DIR, 'ghg_ledger_results.png');
    await page.screenshot({ path: resultsShot });
    console.log(`Saved screenshot: ${resultsShot}`);

    console.log('--- ALL PART 2 CORPORATE GHG LEDGER BROWSER TESTS PASSED! ---');
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
