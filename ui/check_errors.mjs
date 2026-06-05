import puppeteer from 'puppeteer';

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.toString()));

  console.log("Navigating to http://localhost:5000...");
  try {
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log("Page loaded successfully.");
    
    // Take a screenshot just in case
    await page.screenshot({ path: 'screenshot_debug.png' });
    console.log("Screenshot saved.");
  } catch (err) {
    console.error("Navigation failed:", err.message);
  }

  await browser.close();
})();
