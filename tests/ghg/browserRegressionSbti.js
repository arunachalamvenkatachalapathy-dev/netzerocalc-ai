import puppeteer from 'puppeteer';
import path from 'path';

const SCREENSHOT_DIR = 'C:\\Users\\NALINI ARUN\\.gemini\\antigravity\\brain\\9987ccd0-6929-4c34-8088-a34ee720b8f9';

async function runBrowserTest() {
  console.log('--- Starting Part 4 SBTi Target Setting & Net Zero E2E Browser Test ---');
  
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

    console.log('Navigating to http://localhost:4178...');
    await page.goto('http://localhost:4178', { waitUntil: ['load', 'networkidle0'], timeout: 35000 });

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

    // Locate and click "SBTi & Net-Zero 2050" subtab
    console.log('Locating and clicking "SBTi & Net-Zero 2050" subtab...');
    const clickedSbti = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const sbtiBtn = buttons.find(b => b.textContent && b.textContent.includes('SBTi & Net-Zero 2050'));
      if (sbtiBtn) {
        sbtiBtn.click();
        return true;
      }
      return false;
    });

    if (!clickedSbti) {
      throw new Error('Failed to find and click "SBTi & Net-Zero 2050" subtab');
    }

    await new Promise(r => setTimeout(r, 1200));

    // Verify SBTi Simulator view elements
    console.log('Verifying SBTi Simulator view elements...');
    const sbtiText = await page.evaluate(() => document.body.innerText);
    if (!sbtiText.includes('SBTi Target Setting & Net-Zero Trajectory Simulator') ||
        !sbtiText.includes('Absolute Contraction (ACA)') ||
        !sbtiText.includes('SBTi Milestone Target Schedule')) {
      throw new Error('Missing key SBTi Simulator sections from rendered DOM');
    }

    // Capture ACA Mode Screenshot
    const acaShot = path.join(SCREENSHOT_DIR, 'ghg_sbti_aca_view.png');
    await page.screenshot({ path: acaShot });
    console.log(`Saved screenshot: ${acaShot}`);

    // Click on "Net-Zero 2050 Residuals" pill
    console.log('Clicking "Net-Zero 2050 Residuals" pill...');
    const clickedNetZeroPill = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const nzBtn = buttons.find(b => b.textContent && b.textContent.includes('Net-Zero 2050 Residuals'));
      if (nzBtn) {
        nzBtn.click();
        return true;
      }
      return false;
    });

    if (!clickedNetZeroPill) {
      throw new Error('Failed to click Net-Zero 2050 Residuals pill');
    }

    await new Promise(r => setTimeout(r, 1000));

    // Verify Net Zero Residuals content
    const nzText = await page.evaluate(() => document.body.innerText);
    if (!nzText.includes('Residual Removals Budget') ||
        !nzText.includes('Mitigation Hierarchy Mandate')) {
      throw new Error('Missing Net Zero Residual elements');
    }

    // Capture Net-Zero Residuals Screenshot
    const nzShot = path.join(SCREENSHOT_DIR, 'ghg_sbti_netzero_residuals.png');
    await page.screenshot({ path: nzShot });
    console.log(`Saved screenshot: ${nzShot}`);

    console.log('--- ALL PART 4 SBTI SIMULATOR BROWSER TESTS PASSED! ---');
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
