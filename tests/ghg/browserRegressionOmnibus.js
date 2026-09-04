import puppeteer from 'puppeteer';
import path from 'path';

const SCREENSHOT_DIR = 'C:\\Users\\NALINI ARUN\\.gemini\\antigravity\\brain\\9987ccd0-6929-4c34-8088-a34ee720b8f9';

async function runBrowserTest() {
  console.log('--- Starting Part 7 Omnibus Simplification & CSDDD Readiness E2E Browser Test ---');
  
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

    console.log('Navigating to http://localhost:4183...');
    await page.goto('http://localhost:4183', { waitUntil: ['load', 'networkidle0'], timeout: 35000 });

    // 1. Open Tools & Registry Dropdown -> Omnibus & CSDDD Readiness
    console.log('Opening Tools & Registry dropdown...');
    await page.waitForSelector('button', { timeout: 10000 });
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const toolsBtn = buttons.find(b => b.textContent && b.textContent.includes('Tools & Registry'));
      if (toolsBtn) toolsBtn.click();
    });

    await new Promise(r => setTimeout(r, 600));

    console.log('Clicking "Omnibus & CSDDD Readiness" dropdown item...');
    const clickedTab = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.includes('Omnibus & CSDDD Readiness'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!clickedTab) {
      throw new Error('Failed to find "Omnibus & CSDDD Readiness" in Tools dropdown');
    }

    await new Promise(r => setTimeout(r, 1200));

    // Verify Tab 1: Omnibus 61% Audit
    console.log('Verifying Omnibus 61% Audit view elements...');
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (!bodyText.toUpperCase().includes('OMNIBUS') ||
        !bodyText.includes('61%') ||
        !bodyText.includes('ESRS 2')) {
      throw new Error('Omnibus view missing key elements in Tab 1');
    }

    console.log('Capturing omnibus_audit_view.png...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'omnibus_audit_view.png'),
      fullPage: false
    });

    // 2. Click Subtab 2: CSDDD Scope Checker
    console.log('Navigating to Subtab 2: CSDDD Scope Checker...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const scopeBtn = buttons.find(b => b.textContent && b.textContent.includes('Scope Checker'));
      if (scopeBtn) scopeBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const scopeText = await page.evaluate(() => document.body.innerText);
    if (!scopeText.toUpperCase().includes('STATUTORY APPLICABILITY VERDICT')) {
      throw new Error('CSDDD Scope Checker tab failed to render properly');
    }

    console.log('Capturing csddd_scope_view.png...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'csddd_scope_view.png'),
      fullPage: false
    });

    // 3. Click Subtab 3: OECD 6-Step Framework
    console.log('Navigating to Subtab 3: OECD 6-Step Framework...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const ddBtn = buttons.find(b => b.textContent && b.textContent.includes('OECD 6-Step Framework'));
      if (ddBtn) ddBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const ddText = await page.evaluate(() => document.body.innerText);
    if (!ddText.toUpperCase().includes('OECD 6-STEP') ||
        !ddText.toUpperCase().includes('EMBED DUE DILIGENCE')) {
      throw new Error('OECD 6-Step Framework tab failed to render properly');
    }

    // Toggle a checkbox
    await page.evaluate(() => {
      const reqItems = Array.from(document.querySelectorAll('div')).filter(d => d.textContent && d.textContent.includes('ESRS 2 SBM-2'));
      if (reqItems.length > 0) reqItems[0].click();
    });
    await new Promise(r => setTimeout(r, 400));

    console.log('Capturing csddd_oecd_steps_view.png...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'csddd_oecd_steps_view.png'),
      fullPage: false
    });

    // 4. Click Subtab 4: 34 Direct Duplicate Bridge
    console.log('Navigating to Subtab 4: 34 Direct Duplicate Bridge...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const bridgeBtn = buttons.find(b => b.textContent && b.textContent.includes('Bridge'));
      if (bridgeBtn) bridgeBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const bridgeText = await page.evaluate(() => document.body.innerText);
    if (!bridgeText.toUpperCase().includes('34 DIRECT DUPLICATE')) {
      throw new Error('34 Bridge tab failed to render properly');
    }

    // Filter by S2
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const s2Btn = buttons.find(b => b.textContent && b.textContent.trim() === 'S2');
      if (s2Btn) s2Btn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    console.log('Capturing csddd_34_bridge_view.png...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'csddd_34_bridge_view.png'),
      fullPage: false
    });

    // 5. Click Subtab 5: Risk & Supplier Register
    console.log('Navigating to Subtab 5: Risk & Supplier Register...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const riskBtn = buttons.find(b => b.textContent && b.textContent.includes('Risk & Supplier'));
      if (riskBtn) riskBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const riskText = await page.evaluate(() => document.body.innerText);
    if (!riskText.toUpperCase().includes('SUPPLIER DUE DILIGENCE REGISTER')) {
      throw new Error('Risk & Supplier Register tab failed to render properly');
    }

    console.log('Capturing csddd_risk_register_view.png...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'csddd_risk_register_view.png'),
      fullPage: false
    });

    // 6. Click Subtab 6: Art. 22 Transition Plan
    console.log('Navigating to Subtab 6: Art. 22 Transition Plan...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const transBtn = buttons.find(b => b.textContent && b.textContent.includes('Transition Plan'));
      if (transBtn) transBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const transText = await page.evaluate(() => document.body.innerText);
    if (!transText.toUpperCase().includes('TRANSITION PLAN')) {
      throw new Error('Art. 22 Transition Plan tab failed to render properly');
    }

    console.log('Capturing csddd_transition_plan_view.png...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'csddd_transition_plan_view.png'),
      fullPage: false
    });

    console.log('--- ALL PART 7 E2E SCREENSHOTS CAPTURED SUCCESSFULLY! ---');
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
  }
}

runBrowserTest();
