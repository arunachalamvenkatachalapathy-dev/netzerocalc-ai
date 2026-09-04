import puppeteer from 'puppeteer';
import path from 'path';

const SCREENSHOT_DIR = 'C:\\Users\\NALINI ARUN\\.gemini\\antigravity\\brain\\9987ccd0-6929-4c34-8088-a34ee720b8f9';

async function runBrowserTest() {
  console.log('--- Starting Part 6 CSRD Double Materiality & ESRS Benchmark E2E Browser Test ---');
  
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

    console.log('Navigating to http://localhost:4181...');
    await page.goto('http://localhost:4181', { waitUntil: ['load', 'networkidle0'], timeout: 35000 });

    // 1. Open Tools & Registry Dropdown -> CSRD Double Materiality
    console.log('Opening Tools & Registry dropdown...');
    await page.waitForSelector('button', { timeout: 10000 });
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const toolsBtn = buttons.find(b => b.textContent && b.textContent.includes('Tools & Registry'));
      if (toolsBtn) toolsBtn.click();
    });

    await new Promise(r => setTimeout(r, 600));

    console.log('Clicking "CSRD Double Materiality" dropdown item...');
    const clickedCsrd = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const csrdBtn = buttons.find(b => b.textContent && b.textContent.includes('CSRD Double Materiality'));
      if (csrdBtn) {
        csrdBtn.click();
        return true;
      }
      return false;
    });

    if (!clickedCsrd) {
      throw new Error('Failed to find "CSRD Double Materiality" in Tools dropdown');
    }

    await new Promise(r => setTimeout(r, 1200));

    // Verify CSRD Matrix view rendered
    console.log('Verifying CSRD Double Materiality view elements...');
    const text1 = await page.evaluate(() => document.body.innerText);
    if (!text1.includes('CSRD Double Materiality & ESRS Benchmark Matrix') ||
        !text1.includes('Double Materiality Principle') ||
        !text1.includes('E1') ||
        !text1.includes('Climate Change')) {
      throw new Error('Missing key CSRD Matrix sections from rendered DOM');
    }

    // Capture Matrix Screenshot
    const shot1 = path.join(SCREENSHOT_DIR, 'csrd_materiality_matrix.png');
    await page.screenshot({ path: shot1 });
    console.log(`Saved screenshot: ${shot1}`);

    // 2. Click "Progress & Readiness" subtab
    console.log('Clicking "Progress & Readiness" subtab...');
    const clickedDashboard = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const dashBtn = buttons.find(b => b.textContent && b.textContent.includes('Progress & Readiness'));
      if (dashBtn) {
        dashBtn.click();
        return true;
      }
      return false;
    });

    if (!clickedDashboard) {
      throw new Error('Failed to click Progress & Readiness subtab');
    }

    await new Promise(r => setTimeout(r, 1000));

    // Verify Dashboard KPI Cards
    const dashText = await page.evaluate(() => document.body.innerText);
    if (!dashText.includes('Material Standards') ||
        !dashText.includes('Overall Completion') ||
        !dashText.includes('Non-Phaseable Mandatory') ||
        !dashText.includes('CSDDD Direct Duplicates')) {
      throw new Error('Missing Dashboard KPI elements');
    }

    // Capture Dashboard Screenshot
    const shot2 = path.join(SCREENSHOT_DIR, 'csrd_readiness_dashboard.png');
    await page.screenshot({ path: shot2 });
    console.log(`Saved screenshot: ${shot2}`);

    // 3. Click "Danish Brands Benchmark (Brief 01)" subtab
    console.log('Clicking "Danish Brands Benchmark (Brief 01)" subtab...');
    const clickedBench = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const benchBtn = buttons.find(b => b.textContent && b.textContent.includes('Danish Brands Benchmark'));
      if (benchBtn) {
        benchBtn.click();
        return true;
      }
      return false;
    });

    if (!clickedBench) {
      throw new Error('Failed to click Danish Brands Benchmark subtab');
    }

    await new Promise(r => setTimeout(r, 1000));

    // Verify Danish Benchmark Elements
    const benchText = await page.evaluate(() => document.body.innerText);
    if (!benchText.includes('CSRD Benchmarking: Danish Global Brands') ||
        !benchText.includes('Danish Peer Benchmark') ||
        !benchText.includes('4.0 / 5.0') ||
        !benchText.includes('Quantified Scenario Analysis')) {
      throw new Error('Missing Danish Benchmark elements');
    }

    // Capture Benchmark Screenshot
    const shot3 = path.join(SCREENSHOT_DIR, 'csrd_danish_benchmark.png');
    await page.screenshot({ path: shot3 });
    console.log(`Saved screenshot: ${shot3}`);

    console.log('--- ALL PART 6 CSRD DOUBLE MATERIALITY BROWSER TESTS PASSED! ---');
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
