const cloudinary = require("../config/cloudinaryConfig");

const getPublicIdFromUrl = (url) => {
  try {
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;
    
    // The part after 'upload' is the version (e.g., v123456789), skip it
    const publicIdWithExt = parts.slice(uploadIndex + 2).join("/");
    
    // Remove the extension
    const lastDotIndex = publicIdWithExt.lastIndexOf(".");
    if (lastDotIndex === -1) return publicIdWithExt;
    return publicIdWithExt.substring(0, lastDotIndex);
  } catch (error) {
    return null;
  }
};

const deleteFile = (fileUrl) => {
  return new Promise((resolve, reject) => {
    // Check if it's a Cloudinary URL
    if (fileUrl && fileUrl.includes("cloudinary.com")) {
      const publicId = getPublicIdFromUrl(fileUrl);
      if (publicId) {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) {
            console.error("Cloudinary deletion error:", error);
            return reject(error);
          }
          resolve(result);
        });
      } else {
        resolve(); // Cannot parse, just resolve
      }
    } else {
      // Fallback for old local files if any
      const fs = require("fs");
      fs.unlink(fileUrl, (err) => {
        if (err) {
          // If local file doesn't exist, just resolve
          if (err.code === "ENOENT") return resolve();
          return reject(err);
        }
        resolve();
      });
    }
  });
};

module.exports = deleteFile;
