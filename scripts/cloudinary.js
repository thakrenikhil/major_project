// Require the cloudinary library
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

cloudinary.config({
  secure: true,
  cloud_name: "dzw1efzds",
  api_key: "116765335799453",
  api_secret: "09TeB8CTjwqwxDtnzpS6tL8QBqw",
});

// Log the configuration
console.log(cloudinary.config());

const uploadOnCloud = async (filePath) => {
  try {
    if (!filePath) {
      console.log("no  filepath given ");
      return null;
    }

    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    return response.url;
  } catch (error) {
    // fs.unlinkSync(filePath);
    console.log(error);
    return null;
  }
};

let pth = path.join(process.cwd(), "public", "p.pdf");
const f = async () => {
  console.log(pth);
  const url = await uploadOnCloud(pth);
  console.log(url);
  return url;
};
f();


