// import puppeteer from "puppeteer-extra";
// import StealthPlugin from "puppeteer-extra-plugin-stealth";
// import fs from "fs";
// import path from "path";

// // Enable stealth plugin
// puppeteer.use(StealthPlugin());

// (async () => {
//   try {
//     // Launch browser with stealth mode
//     const browser = await puppeteer.launch({ headless: false }); // Set to `true` for headless
//     const page = await browser.newPage();

//     // Navigate to the target URL
//     const targetUrl = "https://web.facebook.com/jacq4ever/photos";
//     console.log("Navigating to the page...");
//     await page.goto(targetUrl, { waitUntil: "networkidle2" });

//     console.log("Page loaded successfully!");

//     // Scroll to ensure all images are loaded
//     await page.evaluate(async () => {
//       const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
//       for (let i = 0; i < 10; i++) { // Scroll 10 times
//         window.scrollBy(0, window.innerHeight);
//         await delay(1000); // Wait for 1 second
//       }
//     });

//     console.log("Scrolling completed!");

//     // Extract image URLs
//     const imageUrls = await page.evaluate(() => {
//       const images = Array.from(document.querySelectorAll("img"));
//       return images.map(img => img.src).filter(src => src && src.startsWith("http"));
//     });

//     console.log(`Found ${imageUrls.length} images.`);

//     if (imageUrls.length === 0) {
//       console.log("No images found. Try inspecting the page manually to confirm element selectors.");
//       await browser.close();
//       return;
//     }

//     // Create a folder to save images
//     const downloadDir = path.resolve("facebook_images");
//     if (!fs.existsSync(downloadDir)) {
//       fs.mkdirSync(downloadDir);
//     }

//     // Download images
//     for (let i = 0; i < imageUrls.length; i++) {
//       const imageUrl = imageUrls[i];
//       const imagePath = path.resolve(downloadDir, `image_${i + 1}.jpg`);

//       console.log(`Downloading image ${i + 1}...`);
//       const viewSource = await page.goto(imageUrl);
//       fs.writeFileSync(imagePath, await viewSource.buffer());
//       console.log(`Downloaded: image_${i + 1}.jpg`);
//     }

//     console.log("All images downloaded successfully!");

//     // Close browser
//     await browser.close();
//   } catch (error) {
//     console.error("An error occurred:", error);
//   }
// })();

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { fileURLToPath } from "url";

// Get the current directory path using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadWithRetry(url, savePath, retries = 3) {
  let attempt = 0;

  // Function to download the file with retry logic
  const download = () => {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith("https") ? https : http;

      protocol
        .get(url, (res) => {
          if (res.statusCode !== 200) {
            reject(
              new Error(
                `Failed to download: ${url} (Status code: ${res.statusCode})`
              )
            );
            return;
          }

          const fileStream = fs.createWriteStream(savePath);
          res.pipe(fileStream);

          fileStream.on("finish", () => {
            resolve();
          });

          fileStream.on("error", (err) => {
            reject(err);
          });
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  };

  // Retry logic
  while (attempt < retries) {
    try {
      await download();
      console.log(`Downloaded: ${path.basename(url)}`);
      return;
    } catch (err) {
      attempt++;
      console.error(
        `Error downloading ${url}: ${err.message}. Attempt ${attempt}/${retries}`
      );
      if (attempt === retries) {
        console.error(`Failed to download ${url} after ${retries} attempts.`);
      }
    }
  }
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Define the routes you want to scrape
  const routes = [
    "https://web.facebook.com/jacq4ever/photos",
    "https://www.facebook.com/share/DNG1muL1PFaYVbDG/?mibextid=JRoKGi",
    // 'https://judilica.eu.auth0.com/u/login/identifier?state=hKFo2SAtbTJNa1NhNDN5cHdMMmJwVXlzeGNTdFc4ZVliWF9TTqFur3VuaXZlcnNhbC1sb2dpbqN0aWTZIEIxcmpUQWZSdEpRclV5bUtHa0xGYkZTVWpDa1JlMTdBo2NpZNkgVU1jakpLZWZXYXdmMXRybzZFWkNzN05JQ2szdzloMnA'
  ];

  // Intercept requests and filter out unwanted resources
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (
      ["image", "font", "script", "stylesheet"].includes(request.resourceType())
    ) {
      request.abort(); // Abort the request for unwanted resources
    } else {
      request.continue(); // Continue for other resources
    }
  });

  // Function to download resources (images, SVGs, and videos)
  async function downloadResources(url) {
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Extract image and SVG URLs
    const imageUrls = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img, svg"));
      return imgs.map((img) => img.src || img.getAttribute("href")); // handles both img and svg elements
    });

    // Save images and SVGs
    for (const url of imageUrls) {
      if (url) {
        const fileName = path.basename(url);
        const savePath = path.resolve(__dirname, "downloads", fileName);

        // Retry logic for downloading images
        await downloadWithRetry(url, savePath);
      }
    }

    // Extract video URLs (handling multiple sources)
    const videoUrls = await page.evaluate(() => {
      const video = document.querySelector("video");
      if (video) {
        const sources = Array.from(video.querySelectorAll("source"));
        return sources.map((source) => source.src); // Get all video sources
      }
      return null;
    });

    // Download video files if available
    if (videoUrls && videoUrls.length > 0) {
      videoUrls.forEach((videoUrl) => {
        if (videoUrl) {
          // Check if the video URL is valid
          const fileName = path.basename(videoUrl);
          const savePath = path.resolve(__dirname, "downloads", fileName);

          // Retry logic for downloading videos
          downloadWithRetry(videoUrl, savePath);
        }
      });
    }

    // Extract and save inline SVGs
    const svgContents = await page.evaluate(() => {
      const svgs = Array.from(document.querySelectorAll("svg"));
      return svgs.map((svg) => svg.outerHTML); // Get the SVG markup
    });

    // Save each SVG as a file
    svgContents.forEach((svgContent, index) => {
      const filePath = path.resolve(
        __dirname,
        "downloads",
        `image${index + 1}.svg`
      );
      fs.writeFileSync(filePath, svgContent);
      console.log(`SVG Saved: ${filePath}`);
    });
  }

  // Create a downloads directory if it doesn't exist
  if (!fs.existsSync(path.resolve(__dirname, "downloads"))) {
    fs.mkdirSync(path.resolve(__dirname, "downloads"));
  }

  // Scrape each route
  for (const route of routes) {
    await downloadResources(route);
  }

  await browser.close();
})();
