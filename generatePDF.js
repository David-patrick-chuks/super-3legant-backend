import puppeteer from "puppeteer";
import fs from "fs";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Load the template
  const content = fs.readFileSync("./userstories.html", "utf-8");
  await page.setContent(content);

  // Custom Styling
  await page.setContent(`
    <style>
      body {
        font-family: 'Arial', sans-serif;
        font-size: 12px;
        color: #333;
      }
      h1, h2, h3 {
        color: #003366;
      }
      p {
        line-height: 1.5;
      }
      .page-break {
        page-break-before: always;
      }
    </style>
    ${content}
  `);
  
  // Generate the PDF with added padding (margins)
  await page.pdf({
    path: "AskZen_PRD.pdf",
    format: "A4",
    printBackground: true,
    margin: {
      top: "20mm", // Adjust the top margin (padding)
      right: "10mm", // Adjust the right margin (padding)
      bottom: "20mm", // Adjust the bottom margin (padding)
      left: "10mm", // Adjust the left margin (padding)
    },
    quality: 100,
    displayHeaderFooter: true, // Enable headers and footers
    headerTemplate:
      '<div style="font-size: 10px; text-align: center; width: 100%;">AskZen PRD</div>',
    footerTemplate:
      '<div style="font-size: 10px; text-align: center; width: 100%;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
  });

  await browser.close();
  console.log("PDF created successfully!");
})();
