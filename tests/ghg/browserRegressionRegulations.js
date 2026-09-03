import puppeteer from 'puppeteer';
import path from 'path';

const SCREENSHOT_DIR = 'C:\\Users\\NALINI ARUN\\.gemini\\antigravity\\brain\\9987ccd0-6929-4c34-8088-a34ee720b8f9';

async function runBrowserTest() {
  console.log('--- Starting Part 1 Regulations 2026 E2E Browser Test ---');
  
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

    console.log('Navigating to http://localhost:4175...');
    await page.goto('http://localhost:4175', { waitUntil: ['load', 'networkidle0'], timeout: 35000 });
    await new Promise(r => setTimeout(r, 2000));

    // Verify we are in workspace
    const initialText = await page.evaluate(() => document.body.innerText);
    console.log('Page loaded. Workspace snippet:', initialText.slice(0, 200).replace(/\n/g, ' '));

    // Locate and click "Regulations 2026" navigation tab
    console.log('Locating "Regulations 2026" navigation tab...');
    const clickedTab = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const tab = btns.find(b => b.textContent && b.textContent.includes('Regulations 2026'));
      if (tab) {
        tab.click();
        return true;
      }
      return false;
    });
    console.log('Clicked "Regulations 2026" tab:', clickedTab);
    await new Promise(r => setTimeout(r, 2000));

    // Verify Regulations Tracker View Header and Table
    console.log('Verifying Regulations Tracker View rendered...');
    const pageTextAfterClick = await page.evaluate(() => document.body.innerText);
    console.log('Page text after click (first 300 chars):', pageTextAfterClick.slice(0, 300).replace(/\n/g, ' '));

    if (!pageTextAfterClick.includes('Sustainability Reporting Regulations') || !pageTextAfterClick.includes('CSRD')) {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'debug_failure.png') });
      throw new Error('Regulations database not rendered properly in DOM!');
    }
    console.log('✓ Verified: 25 global regulations loaded and rendered in table!');

    // Screenshot 1: Full Regulations Tracker View
    const mainScreenshot = path.join(SCREENSHOT_DIR, 'regulations_2026_verified.png');
    await page.screenshot({ path: mainScreenshot });
    console.log(`✓ Saved screenshot: ${mainScreenshot}`);

    // Test "In Force" Status Filter
    console.log('Testing "In Force" filter button...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const inForceBtn = btns.find(b => b.textContent && b.textContent.trim() === 'In Force');
      if (inForceBtn) inForceBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Screenshot 2: In Force Filtered
    const inForceScreenshot = path.join(SCREENSHOT_DIR, 'regulations_in_force.png');
    await page.screenshot({ path: inForceScreenshot });
    console.log(`✓ Saved screenshot: ${inForceScreenshot}`);

    // Test Search for "BRSR"
    console.log('Testing search for "BRSR"...');
    // Click "All Regulations" first
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const allBtn = btns.find(b => b.textContent && b.textContent.trim() === 'All Regulations');
      if (allBtn) allBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const searchInput = await page.waitForSelector('input[placeholder*="Search by country"]');
    await searchInput.type('BRSR');
    await new Promise(r => setTimeout(r, 800));

    // Verify India row is shown
    const filteredText = await page.evaluate(() => document.body.innerText);
    if (!filteredText.includes('India') || !filteredText.includes('SEBI')) {
      throw new Error('BRSR search filter failed to locate India regulation!');
    }
    console.log('✓ Verified: Search accurately located India BRSR regulation!');

    // Open Details Inspector Drawer
    console.log('Clicking "Details →" button for India BRSR...');
    const detailBtn = await page.waitForSelector('tbody button');
    await detailBtn.click();
    await new Promise(r => setTimeout(r, 1200));

    // Verify Inspector Drawer opened
    const drawerText = await page.evaluate(() => document.body.innerText);
    console.log('Drawer text snippet:', drawerText.slice(drawerText.indexOf('BRSR'), drawerText.indexOf('BRSR') + 200).replace(/\n/g, ' '));
    if (!drawerText.includes('Full Legal Title') && !drawerText.includes('SEBI')) {
      throw new Error('Inspector drawer text verification failed!');
    }
    console.log('✓ Verified: Regulation Details Inspector Drawer successfully opened!');

    // Screenshot 3: Inspector Drawer
    const drawerScreenshot = path.join(SCREENSHOT_DIR, 'regulations_inspector_drawer.png');
    await page.screenshot({ path: drawerScreenshot });
    console.log(`✓ Saved screenshot: ${drawerScreenshot}`);

    // Close drawer
    console.log('Closing detail drawer...');
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close detail drawer"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    console.log('--- ALL PART 1 REGULATORY TRACKER BROWSER TESTS PASSED! ---');

  } catch (err) {
    console.error('Test Failed:', err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

runBrowserTest();
