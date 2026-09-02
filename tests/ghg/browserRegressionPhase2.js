import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import path from 'path';

const SCREENSHOT_DIR = 'C:\\Users\\NALINI ARUN\\.gemini\\antigravity\\brain\\9987ccd0-6929-4c34-8088-a34ee720b8f9';

async function runBrowserTest() {
  console.log('--- Starting Phase 2 E2E Browser Test ---');
  
  console.log('Spawning vite preview on port 4174...');
  const preview = spawn('bun.exe', ['run', 'vite', 'preview', '--port', '4174'], {
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

    console.log('Navigating to http://localhost:4174...');
    await page.goto('http://localhost:4174', { waitUntil: 'networkidle0' });

    // Set visited to true and reload to bypass landing page if needed
    await page.evaluate(() => {
      localStorage.setItem('netzerocalc_has_visited', 'true');
    });
    await page.goto('http://localhost:4174', { waitUntil: 'networkidle0' });

    console.log('Verifying App container and sticky bar...');
    await page.waitForSelector('header', { timeout: 5000 });

    // 1. Locate EF Registry Button in Sticky Bar
    console.log('Locating EF Registry button in sticky header...');
    const efBtn = await page.waitForSelector('button[title*="Emission Factor Registry"]', { timeout: 5000 });
    const efText = await page.evaluate(el => el.textContent, efBtn);
    console.log(`Found button with text: "${efText}"`);
    
    // Click EF Registry button to open FactorRegistryModal
    console.log('Clicking EF Registry button...');
    await efBtn.click();
    await new Promise(r => setTimeout(r, 800));

    // Verify modal opened
    console.log('Verifying Factor Registry modal opened...');
    const modalTitle = await page.waitForSelector('div.fixed.inset-0 h2', { timeout: 5000 });
    const titleText = await page.evaluate(el => el.textContent, modalTitle);
    console.log(`Modal header text: "${titleText}"`);
    if (!titleText.includes('Emission Factor Registry')) {
      throw new Error(`Expected Emission Factor Registry modal title, got: ${titleText}`);
    }

    // 2. Search for "CEA"
    console.log('Searching for "CEA" in filter bar...');
    const searchInput = await page.waitForSelector('input[placeholder*="Search by fuel"]');
    await searchInput.type('CEA');
    await new Promise(r => setTimeout(r, 600));

    // 3. Inspect factor details
    console.log('Clicking Inspect on CEA National Grid factor...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === 'Inspect');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Verify Detail Drawer opened
    await page.waitForSelector('h3::-p-text(Factor Provenance Detail)', { timeout: 5000 });
    console.log('Detail drawer is open with full provenance and immutability notice.');

    // Screenshot 1: Factor Provenance Drawer
    const drawerScreenshot = path.join(SCREENSHOT_DIR, 'factor_drawer_phase2.png');
    await page.screenshot({ path: drawerScreenshot });
    console.log(`Saved screenshot to ${drawerScreenshot}`);

    // Close detail drawer
    console.log('Closing detail drawer...');
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close factor detail"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Clear search input
    console.log('Clearing search input...');
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Search by fuel"]');
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 600));

    // 4. Create Custom Factor
    console.log('Clicking "+ Add Custom Factor" button...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Add Custom Factor'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    console.log('Filling custom factor form with page.type...');
    await page.waitForSelector('input[placeholder*="Biomass"]', { timeout: 5000 });
    await page.type('input[placeholder*="Biomass"]', 'Custom Biomass Briquettes (Groundnut Shells)');
    await page.type('input[placeholder*="0.1450"]', '0.1450');
    await page.type('input[placeholder*="Testing Laboratory"]', 'Certified Biofuel Testing Lab');
    await page.type('input[placeholder*="TEST-2024"]', 'REPORT-BIOFUEL-2024-991');
    await new Promise(r => setTimeout(r, 400));

    console.log('Submitting custom factor...');
    await page.evaluate(() => {
      const form = document.querySelector('div.fixed.inset-0 form');
      if (form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      }
    });
    await new Promise(r => setTimeout(r, 1200));

    // 5. Verify custom factor appears in the table with Custom badge
    console.log('Verifying custom factor in table...');
    await page.waitForSelector('span::-p-text(Custom v1)', { timeout: 5000 });
    console.log('Custom factor successfully added with Custom v1 badge!');

    // Screenshot 2: Factor Registry with Custom Factor
    const registryScreenshot = path.join(SCREENSHOT_DIR, 'factor_registry_phase2.png');
    await page.screenshot({ path: registryScreenshot });
    console.log(`Saved screenshot to ${registryScreenshot}`);

    // 6. Close Modal
    console.log('Closing Factor Registry Modal...');
    await page.evaluate(() => {
      const doneBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === 'Done');
      if (doneBtn) doneBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // 7. Verify main PCF workbench is intact
    console.log('Verifying BOM Workbench tab is active...');
    await page.waitForSelector('button::-p-text(BOM Workbench)');
    
    // Screenshot 3: App with Phase 2 header and controls
    const appScreenshot = path.join(SCREENSHOT_DIR, 'app_phase2_complete.png');
    await page.screenshot({ path: appScreenshot });
    console.log(`Saved screenshot to ${appScreenshot}`);

    // 8. Test reload and persistence
    console.log('Reloading page to test persistence...');
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));

    const storedProjects = await page.evaluate(() => {
      const raw = localStorage.getItem('netzerocalc_v4_projects');
      return raw ? JSON.parse(raw) : null;
    });

    console.log(`Reloaded projects count: ${storedProjects?.length}`);
    const activeP = storedProjects[0];
    console.log(`Stored custom factors count: ${activeP?.customFactors?.length}`);
    if (!activeP?.customFactors || activeP.customFactors.length === 0) {
      throw new Error('Custom factor was not persisted to localStorage!');
    }

    console.log('All Phase 2 E2E browser tests PASSED successfully!');
  } finally {
    if (browser) await browser.close();
    preview.kill();
  }
}

runBrowserTest().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
