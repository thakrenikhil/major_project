// Require the cloudinary library
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
// Return "https" URLs by setting secure: true
cloudinary.config({
  secure: true,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_KEY_SECRET,
});

// Log the configuration
console.log(cloudinary.config());

const uploadOnCloud = async (filePath) => {
  try {
    if (!filePath) return null;
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    return response.url;
  } catch (error) {
    fs.unlinkSync(filePath);
    return null;
  }
};

module.exports = {
  uploadOnCloud,
};
