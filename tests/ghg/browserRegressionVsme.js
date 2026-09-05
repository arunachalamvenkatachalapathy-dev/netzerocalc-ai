import puppeteer from 'puppeteer';
import path from 'path';
import { spawn } from 'child_process';

const SCREENSHOT_DIR = 'C:\\Users\\NALINI ARUN\\.gemini\\antigravity\\brain\\9987ccd0-6929-4c34-8088-a34ee720b8f9';
const PORT = 4186;

async function runBrowserTest() {
  console.log('--- Starting Part 9 VSME Voluntary SME Reporting Tool E2E Browser Test ---');
  
  let previewProcess;
  let browser;

  try {
    // 1. Spawn vite preview on port 4186 using direct node entry point
    console.log(`Starting Vite preview server on port ${PORT}...`);
    previewProcess = spawn('node', ['./node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--strictPort'], {
      stdio: 'pipe'
    });

    previewProcess.stdout.on('data', (data) => {
      console.log(`[Vite Preview] ${data.toString().trim()}`);
    });
    previewProcess.stderr.on('data', (data) => {
      console.log(`[Vite Preview Msg] ${data.toString().trim()}`);
    });

    // Wait for server to boot
    await new Promise((resolve) => setTimeout(resolve, 4000));

    console.log('Launching headless Chromium with Puppeteer...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1100 });

    page.on('console', (msg) => {
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });

    // Bypass landing page directly to workspace
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('netzerocalc_has_visited', 'true');
    });

    console.log(`Navigating to http://localhost:${PORT}...`);
    await page.goto(`http://localhost:${PORT}`, { waitUntil: ['load', 'networkidle0'], timeout: 35000 });

    // Open Tools & Registry dropdown -> VSME Voluntary SME Reporting
    console.log('Opening Tools & Registry dropdown...');
    await page.waitForSelector('button', { timeout: 10000 });
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const toolsBtn = buttons.find((b) => b.textContent && b.textContent.includes('Tools & Registry'));
      if (toolsBtn) toolsBtn.click();
    });

    await new Promise((r) => setTimeout(r, 600));

    console.log('Clicking "VSME Voluntary SME Reporting" dropdown item...');
    const clickedTab = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find((b) => b.textContent && b.textContent.includes('VSME Voluntary SME Reporting'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!clickedTab) {
      throw new Error('Failed to find "VSME Voluntary SME Reporting" in Tools dropdown');
    }

    await new Promise((r) => setTimeout(r, 1200));

    // Verify VSME Header & Banner
    console.log('Verifying VSME executive header & legal citation...');
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (!bodyText.toUpperCase().includes('VSME VOLUNTARY SME SUSTAINABILITY REPORTING') ||
        !bodyText.includes('C(2026) 5011') ||
        !bodyText.toUpperCase().includes('READINESS DASHBOARD')) {
      throw new Error('VSME Reporting View failed to render expected executive headers');
    }
    console.log('VSME executive header successfully verified.');

    // Screenshot 1: Readiness Dashboard View
    console.log('Capturing Screenshot 1: vsme_dashboard_view.png...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'vsme_dashboard_view.png'),
      fullPage: false
    });

    // Click Sub-tab: Disclosures Workbench
    console.log('Switching to "Disclosures Workbench" sub-tab...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.includes('Disclosures Workbench'));
      if (btn) btn.click();
    });

    await new Promise((r) => setTimeout(r, 800));

    // Screenshot 2: Disclosures Workbench
    console.log('Capturing Screenshot 2: vsme_disclosures_workbench.png...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'vsme_disclosures_workbench.png'),
      fullPage: false
    });

    // Click Sub-tab: Value Chain Cap Shield (Annex II)
    console.log('Switching to "Value Chain Cap Shield (Annex II)" sub-tab...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.includes('Value Chain Cap Shield'));
      if (btn) btn.click();
    });

    await new Promise((r) => setTimeout(r, 800));

    // Screenshot 3: Value Chain Cap Shield
    console.log('Capturing Screenshot 3: vsme_value_chain_cap.png...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'vsme_value_chain_cap.png'),
      fullPage: false
    });

    // Click Sub-tab: Voluntary Statement Preview
    console.log('Switching to "Voluntary Statement Preview" sub-tab...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.includes('Voluntary Statement Preview'));
      if (btn) btn.click();
    });

    await new Promise((r) => setTimeout(r, 800));

    // Screenshot 4: Voluntary Statement Preview
    console.log('Capturing Screenshot 4: vsme_shadow_report.png...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'vsme_shadow_report.png'),
      fullPage: false
    });

    console.log('--- ALL PART 9 VSME PUPPETEER TESTS PASSED CLEANLY ---');
  } catch (err) {
    console.error('Puppeteer E2E Test Failed:', err);
    process.exitCode = 1;
  } finally {
    if (browser) {
      console.log('Closing Puppeteer browser...');
      await browser.close();
    }
    if (previewProcess) {
      console.log('Terminating Vite preview server...');
      previewProcess.kill();
    }
  }
}

runBrowserTest();
