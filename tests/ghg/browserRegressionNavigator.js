import puppeteer from 'puppeteer';
import path from 'path';
import { spawn } from 'child_process';

const SCREENSHOT_DIR = 'C:\\Users\\NALINI ARUN\\.gemini\\antigravity\\brain\\9987ccd0-6929-4c34-8088-a34ee720b8f9';
const PORT = 4184;

async function runBrowserTest() {
  console.log('--- Starting Part 8 EU ESG Regulation Navigator E2E Browser Test ---');
  
  let previewProcess;
  let browser;

  try {
    // 1. Spawn vite preview on port 4184 using direct node entry point
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

    // Open Tools & Registry dropdown -> EU ESG Regulation Navigator
    console.log('Opening Tools & Registry dropdown...');
    await page.waitForSelector('button', { timeout: 10000 });
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const toolsBtn = buttons.find((b) => b.textContent && b.textContent.includes('Tools & Registry'));
      if (toolsBtn) toolsBtn.click();
    });

    await new Promise((r) => setTimeout(r, 600));

    console.log('Clicking "EU ESG Regulation Navigator" dropdown item...');
    const clickedTab = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find((b) => b.textContent && b.textContent.includes('EU ESG Regulation Navigator'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!clickedTab) {
      throw new Error('Failed to find "EU ESG Regulation Navigator" in Tools dropdown');
    }

    await new Promise((r) => setTimeout(r, 1200));

    // Verify Navigator header and KPI elements
    console.log('Verifying EU Navigator executive header & KPIs...');
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (!bodyText.toUpperCase().includes('EU ESG REGULATION NAVIGATOR') ||
        !bodyText.includes('60') ||
        !bodyText.toUpperCase().includes('BOARD CRITICAL')) {
      throw new Error('EU Navigator view missing core header or KPI elements');
    }

    console.log('Capturing eu_navigator_scatter_view.png...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'eu_navigator_scatter_view.png'),
      fullPage: false
    });

    // Interact with Statutory Checklist in Inspector
    console.log('Testing interactive statutory checklist in Profile Inspector...');
    const checklistClicked = await page.evaluate(() => {
      const checkBoxes = Array.from(document.querySelectorAll('.cursor-pointer'));
      const item = checkBoxes.find((el) => el.textContent && (el.textContent.includes('Assess double materiality') || el.textContent.includes('surrender allowances')));
      if (item) {
        item.click();
        return true;
      }
      return false;
    });
    console.log(`Checklist item clicked: ${checklistClicked}`);

    await new Promise((r) => setTimeout(r, 600));

    console.log('Capturing eu_navigator_detail_radar_view.png...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'eu_navigator_detail_radar_view.png'),
      fullPage: false
    });

    // Scroll to Boardroom Compliance Shortlist Table
    console.log('Scrolling to Boardroom Compliance Shortlist Table...');
    await page.evaluate(() => {
      window.scrollTo({ top: 900, behavior: 'instant' });
    });
    await new Promise((r) => setTimeout(r, 800));

    console.log('Capturing eu_navigator_shortlist_table_view.png...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'eu_navigator_shortlist_table_view.png'),
      fullPage: false
    });

    // Test cross-link from Regulations 2026 tab
    console.log('Testing cross-linking from Regulations 2026 tab...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const regBtn = buttons.find((b) => b.textContent && b.textContent.includes('Regulations 2026'));
      if (regBtn) regBtn.click();
    });

    await new Promise((r) => setTimeout(r, 1000));

    const regPageText = await page.evaluate(() => document.body.innerText);
    if (!regPageText.toUpperCase().includes('LAUNCH NAVIGATOR')) {
      throw new Error('Regulations 2026 tab missing Launch Navigator cross-link button');
    }

    console.log('Clicking "Launch Navigator" cross-link button...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const launchBtn = buttons.find((b) => b.textContent && b.textContent.includes('Launch Navigator'));
      if (launchBtn) launchBtn.click();
    });

    await new Promise((r) => setTimeout(r, 1000));

    const returnPageText = await page.evaluate(() => document.body.innerText);
    if (!returnPageText.toUpperCase().includes('EU ESG REGULATION NAVIGATOR')) {
      throw new Error('Failed to return to EU ESG Regulation Navigator via cross-link');
    }

    console.log('Cross-link navigation test passed successfully!');
    console.log('--- ALL PART 8 E2E BROWSER TESTS PASSED PERFECTLY ---');

  } catch (err) {
    console.error('Test failed with error:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (previewProcess) {
      console.log('Terminating Vite preview server...');
      previewProcess.kill();
    }
  }
}

runBrowserTest();
