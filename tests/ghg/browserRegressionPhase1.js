import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import path from 'path';

const SCREENSHOT_DIR = 'C:\\Users\\NALINI ARUN\\.gemini\\antigravity\\brain\\9987ccd0-6929-4c34-8088-a34ee720b8f9';

async function runBrowserTest() {
  console.log('--- Starting Phase 1 E2E Browser Test ---');
  
  console.log('Spawning vite preview on port 4173...');
  const preview = spawn('bun.exe', ['run', 'vite', 'preview', '--port', '4173'], {
    cwd: process.cwd(),
    shell: true,
    stdio: 'pipe'
  });

  await new Promise(r => setTimeout(r, 3000));

  let browser;
  try {
    console.log('Launching headless Chromium with Puppeteer...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`[Browser Console Error] ${msg.text()}`);
      }
    });

    console.log('Navigating to http://localhost:4173...');
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });

    // Set visited to true and reload to bypass landing page if needed
    await page.evaluate(() => {
      localStorage.setItem('netzerocalc_has_visited', 'true');
    });
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });

    console.log('Verifying App container and header...');
    await page.waitForSelector('header', { timeout: 5000 });

    // 2. Check Sites Button in Sticky Bar
    console.log('Locating Sites / Facility Registry button...');
    const sitesBtn = await page.waitForSelector('button[title*="facilities and active boundary"]', { timeout: 5000 });
    const sitesText = await page.evaluate(el => el.textContent, sitesBtn);
    console.log(`Found button with text: "${sitesText}"`);
    
    // Click Sites button to open FacilityManagementModal
    console.log('Clicking Sites button...');
    await sitesBtn.click();
    await new Promise(r => setTimeout(r, 800));

    // Verify modal opened
    console.log('Verifying Facility Registry modal...');
    const facilityModalHeader = await page.waitForSelector('div.fixed.inset-0 h2', { timeout: 4000 });
    const modalTitle = await page.evaluate(el => el.textContent, facilityModalHeader);
    console.log(`Modal Title: "${modalTitle}"`);
    if (!modalTitle.includes('Facility Registry')) {
      throw new Error(`Expected Facility Registry modal, got: ${modalTitle}`);
    }

    // Click "Add Facility" inside the modal
    console.log('Clicking "Add Facility" button in modal...');
    const clickedAddFac = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.includes('Add Facility'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    if (!clickedAddFac) throw new Error('Add Facility button could not be clicked');
    await new Promise(r => setTimeout(r, 500));

    // Fill form
    console.log('Filling facility registration form...');
    await page.type('input[placeholder="e.g. Chennai Plant A"]', 'Pune Assembly Plant');
    await page.type('input[placeholder="e.g. FAC-001"]', 'PUN-002');
    await page.type('input[placeholder="e.g. Tamil Nadu"]', 'Maharashtra');

    // Submit form via evaluate click
    console.log('Submitting facility registration form...');
    await page.evaluate(() => {
      const submitBtn = document.querySelector('div.fixed.inset-0 form button[type="submit"]');
      if (submitBtn) submitBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Verify "Pune Assembly Plant" is listed in the table
    const pageText = await page.evaluate(() => document.body.innerText);
    if (!pageText.includes('Pune Assembly Plant')) {
      throw new Error('Pune Assembly Plant not found in facility registry after submit!');
    }
    console.log('✓ Verified: Pune Assembly Plant successfully registered in modal!');

    // Take screenshot of Facility Modal
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'facility_modal_phase1.png') });
    console.log('✓ Saved screenshot: facility_modal_phase1.png');

    // Close Facility Modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const done = btns.find(b => b.textContent && b.textContent.trim() === 'Done');
      if (done) done.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // 3. Check Periods Button in Sticky Bar
    console.log('Locating Reporting Periods button...');
    const periodsBtn = await page.waitForSelector('button[title*="reporting periods, dates, and locking"]', { timeout: 5000 });
    await periodsBtn.click();
    await new Promise(r => setTimeout(r, 800));

    // Verify Period modal opened
    console.log('Verifying Period Registry modal...');
    const periodModalHeader = await page.waitForSelector('div.fixed.inset-0 h2', { timeout: 4000 });
    const periodModalTitle = await page.evaluate(el => el.textContent, periodModalHeader);
    console.log(`Modal Title: "${periodModalTitle}"`);
    if (!periodModalTitle.includes('Reporting Periods Registry')) {
      throw new Error(`Expected Reporting Periods Registry modal, got: ${periodModalTitle}`);
    }

    // Click "Add Period" inside modal
    console.log('Clicking "Add Period" in modal...');
    const clickedAddPer = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.includes('Add Period'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    if (!clickedAddPer) throw new Error('Add Period button could not be clicked');
    await new Promise(r => setTimeout(r, 500));

    // Fill form
    console.log('Filling reporting period form...');
    const labelInput = await page.waitForSelector('input[placeholder="e.g. FY 2024-25"]', { timeout: 2000 });
    await labelInput.click({ clickCount: 3 });
    await labelInput.type('FY 2025-26');

    // Submit period form via evaluate click
    console.log('Submitting period form...');
    await page.evaluate(() => {
      const submitBtn = document.querySelector('div.fixed.inset-0 form button[type="submit"]');
      if (submitBtn) submitBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Verify "FY 2025-26" is listed in the table
    const afterPeriodText = await page.evaluate(() => document.body.innerText);
    if (!afterPeriodText.includes('FY 2025-26')) {
      throw new Error('FY 2025-26 not found in reporting periods registry after submit!');
    }
    console.log('✓ Verified: FY 2025-26 successfully created in period modal!');

    // Take screenshot of Period Modal
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'period_modal_phase1.png') });
    console.log('✓ Saved screenshot: period_modal_phase1.png');

    // Close Period Modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const done = btns.find(b => b.textContent && b.textContent.trim() === 'Done');
      if (done) done.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // 4. Verify LocalStorage Persistence & Reload
    console.log('Reloading page to verify persistence...');
    await page.reload({ waitUntil: 'networkidle0' });

    // Check sticky bar sites count
    const updatedSitesBtn = await page.waitForSelector('button[title*="facilities and active boundary"]', { timeout: 5000 });
    const updatedSitesText = await page.evaluate(el => el.textContent, updatedSitesBtn);
    console.log(`Updated sites text after reload: "${updatedSitesText}"`);

    // Verify localStorage v4 schema
    const storedV4 = await page.evaluate(() => localStorage.getItem('netzerocalc_v4_projects'));
    if (!storedV4) {
      throw new Error('netzerocalc_v4_projects was not persisted to localStorage!');
    }
    const parsedV4 = JSON.parse(storedV4);
    const activeFacCount = parsedV4[0].facilities.length;
    const activePeriodCount = parsedV4[0].periods.length;
    console.log(`✓ LocalStorage v4 verified: ${activeFacCount} facilities, ${activePeriodCount} periods.`);

    // Take final full application screenshot
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'app_phase1_complete.png'), fullPage: false });
    console.log('✓ Saved screenshot: app_phase1_complete.png');

    console.log('=== ALL PHASE 1 BROWSER REGRESSION TESTS PASSED! ===');
  } finally {
    if (browser) await browser.close();
    preview.kill();
  }
}

runBrowserTest().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
