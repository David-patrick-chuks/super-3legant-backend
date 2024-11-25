import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Define the websites you want to screenshot
  const websites = [
    'https://www.leya.law',
    'https://www.leya.law/news',
    'https://www.leya.law/product',
    'https://www.leya.law/security',
    'https://www.leya.law/company',
    'https://www.leya.law/customers',
  ];

  // Create a screenshots directory if it doesn't exist
  const screenshotsDir = path.resolve(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  for (const url of websites) {
    try {
      // Navigate to the URL
      await page.goto(url, { waitUntil: 'load', timeout: 0 });

    //   // Adjust the viewport to ensure proper screenshot dimensions
    await page.setViewport({ width: 1440, height: 900 });
    //   await page.setViewport({ width: 1920, height: 1080 });

      // Generate a unique and clean filename
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace(/\./g, '_'); // Replace dots with underscores
      const pathName = urlObj.pathname.replace(/\//g, '_'); // Replace slashes with underscores
      const fileName = `${domain}${pathName || '_homepage'}.png`;

      const savePath = path.resolve(screenshotsDir, fileName);

      // Take a full-page screenshot
      await page.screenshot({
        path: savePath,
        fullPage: true, // Ensures the entire page is captured
      });

      console.log(`Screenshot saved: ${savePath}`);
    } catch (err) {
      console.error(`Failed to capture screenshot for ${url}: ${err.message}`);
    }
  }

  await browser.close();
})();
