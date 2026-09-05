import puppeteer from 'puppeteer';
import path from 'path';
import { spawn } from 'child_process';

const SCREENSHOT_DIR = 'C:\\Users\\NALINI ARUN\\.gemini\\antigravity\\brain\\9987ccd0-6929-4c34-8088-a34ee720b8f9';
const PORT = 4188;

async function runBrowserTest() {
  console.log('--- Starting Part 10 Executive CEO Insights E2E Browser Test ---');
  
  let previewProcess;
  let browser;

  try {
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

    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('netzerocalc_has_visited', 'true');
    });

    console.log(`Navigating to http://localhost:${PORT}...`);
    await page.goto(`http://localhost:${PORT}`, { waitUntil: ['load', 'networkidle0'], timeout: 35000 });

    // Open Tools & Registry dropdown -> Executive CEO Insights
    console.log('Opening Tools & Registry dropdown...');
    await page.waitForSelector('button', { timeout: 10000 });
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const toolsBtn = buttons.find((b) => b.textContent && b.textContent.includes('Tools & Registry'));
      if (toolsBtn) toolsBtn.click();
    });

    await new Promise((r) => setTimeout(r, 600));

    console.log('Clicking "Executive CEO Insights" dropdown item...');
    const clickedTab = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find((b) => b.textContent && b.textContent.includes('Executive CEO Insights'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!clickedTab) {
      throw new Error('Failed to find "Executive CEO Insights" in Tools dropdown');
    }

    await new Promise((r) => setTimeout(r, 1200));

    // Verify Executive Header & Elements
    console.log('Verifying CEO Insights executive header & badges...');
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (!bodyText.toUpperCase().includes('EXECUTIVE CEO INSIGHTS') ||
        !bodyText.toUpperCase().includes('BOARDROOM DECISION HUB') ||
        !bodyText.toUpperCase().includes('STRATEGIC BRIEFS')) {
      throw new Error('Executive CEO Insights failed to render expected executive headers');
    }
    console.log('Executive CEO Insights header successfully verified.');

    // Screenshot 1: Strategic Briefs Hub (CSRD Brief View)
    console.log('Capturing Screenshot 1: ceo_insights_briefs_hub.png...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'ceo_insights_briefs_hub.png'),
      fullPage: false
    });

    // Test clicking a decision question checkbox
    console.log('Interacting with decision question checklist...');
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('div')).filter(d => d.textContent && d.textContent.includes('Has our board examined'));
      if (items.length > 0) items[0].click();
    });

    await new Promise((r) => setTimeout(r, 400));

    // Switch to Sub-Tab: Boardroom Maturity Scorecard
    console.log('Switching to "Boardroom Maturity Scorecard" sub-tab...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.includes('Boardroom Maturity Scorecard'));
      if (btn) btn.click();
    });

    await new Promise((r) => setTimeout(r, 800));

    // Screenshot 2: Boardroom Maturity Scorecard
    console.log('Capturing Screenshot 2: ceo_insights_maturity_scorecard.png...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'ceo_insights_maturity_scorecard.png'),
      fullPage: false
    });

    // Switch to Sub-Tab: Regulatory Cohesion Matrix
    console.log('Switching to "Regulatory Cohesion Matrix" sub-tab...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.includes('Regulatory Cohesion Matrix'));
      if (btn) btn.click();
    });

    await new Promise((r) => setTimeout(r, 800));

    // Screenshot 3: Regulatory Cohesion Matrix
    console.log('Capturing Screenshot 3: ceo_insights_cohesion_matrix.png...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'ceo_insights_cohesion_matrix.png'),
      fullPage: false
    });

    // Switch back to Strategic Briefs Hub and select "Carbon Economics" brief
    console.log('Switching back to Strategic Briefs Hub and selecting Carbon Economics brief...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.includes('Strategic Briefs Hub'));
      if (btn) btn.click();
    });

    await new Promise((r) => setTimeout(r, 500));

    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div')).filter(d => d.textContent && d.textContent.includes('Balance Sheet Decarbonization'));
      if (cards.length > 0) cards[0].click();
    });

    await new Promise((r) => setTimeout(r, 800));

    // Screenshot 4: Carbon Economics Brief Deep Dive
    console.log('Capturing Screenshot 4: ceo_insights_carbon_brief_view.png...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'ceo_insights_carbon_brief_view.png'),
      fullPage: false
    });

    console.log('--- ALL PART 10 EXECUTIVE CEO INSIGHTS PUPPETEER TESTS PASSED CLEANLY ---');
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
