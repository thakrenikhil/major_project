const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const { uploadOnCloud } = require("../cloudinary/config.cloudinary");
const genCertificate = async (name, course) => {
  try {
    // 1️⃣ Render EJS into HTML
    const html = await ejs.renderFile(
      path.join(process.cwd(), "views", "certificate.ejs"),
      {
        name,
        course,
        date: new Date().toLocaleDateString(),
      }
    );

    // 2️⃣ Launch Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // 3️⃣ Load HTML content
    await page.setContent(html, { waitUntil: "networkidle0" });

    // 4️⃣ Generate PDF
    const pdfPath = path.join(
      process.cwd(),
      "public",
      `${name}_certificate.pdf`
    );
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
    });

    await browser.close();
    // 5️⃣ Send file as response (or upload to Cloudinary later)
    let uploadUrl = uploadOnCloud(pdfPath);
    fs.unlinkSync(pdfPath);
    return uploadUrl;
  } catch (err) {
    console.error(err);
    fs.unlinkSync(pdfPath);
    return null;
  }
};
module.exports = {
  genCertificate,
};
