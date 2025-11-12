const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const { uploadOnCloud } = require("../cloudinary/config.cloudinary");
const genCertificate = async (name, course) => {
  try {
    const html = await ejs.renderFile(
      path.join(process.cwd(), "views", "certificate.ejs"),
      {
        name,
        course,
        date: new Date().toLocaleDateString(),
      }
    );

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfPath = path.join(
      process.cwd(),
      "public",
      `${name}_certificate.pdf`
    );
    console.log(pdfPath);
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
    });

    await browser.close();
    // 5️⃣ Send file as response (or upload to Cloudinary later)
    let uploadUrl = uploadOnCloud(pdfPath);
    // fs.unlinkSync(pdfPath);
    return uploadUrl;
  } catch (err) {
    console.error(err);
    // fs.unlinkSync(pdfPath);
    return null;
  }
};
module.exports = {
  genCertificate,
};
