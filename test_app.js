import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating to http://localhost:3000/e-credits/');
  await page.goto('http://localhost:3000/e-credits/', { waitUntil: 'networkidle2' });
  
  console.log('Testing Simulator tab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const simTab = tabs.find(t => t.innerText.includes('Simulator'));
    if (simTab) simTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Testing CBAM tab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const cbamTab = tabs.find(t => t.innerText.includes('CBAM'));
    if (cbamTab) cbamTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Testing DQR tab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const dqrTab = tabs.find(t => t.innerText.includes('DQR'));
    if (dqrTab) dqrTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Done testing tabs.');
  await browser.close();
})();
