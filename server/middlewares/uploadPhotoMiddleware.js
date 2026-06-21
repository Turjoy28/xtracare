const path = require("path");
const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image, Please upload images only", 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

const uploadPhotoMiddleware = (multiple = false, maxFiles = 7) => {
  return multiple ? upload.array("photos", maxFiles) : upload.single("photo");
};

// IMAGE PROCESSING USING SHARP
const cloudinary = require("../config/cloudinaryConfig");
const streamifier = require("streamifier");

const resizePhotoMiddleware = (directory) => {
  return catchAsync(async (req, res, next) => {
    // Handle both single and multiple files
    const files = req.file ? [req.file] : req.files || [];

    if (files.length === 0) return next();

    // Define unique suffix function
    const uniqueSuffix = () =>
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    const dimensions = {}[directory] || {};

    const processImage = async (file) => {
      // Get the original file extension
      const originalExtension = path.extname(file.originalname);
      const filename = `${directory}-${uniqueSuffix()}`; // without extension for Cloudinary public_id

      const transformer = sharp(file.buffer);

      // Ignore resize() for Banner and Brand
      if (directory !== "banner") {
        transformer.resize(dimensions.width, dimensions.height);
      }

      const format = originalExtension ? originalExtension.slice(1).toLowerCase() : "jpeg";
      
      const buffer = await transformer.toFormat(format).toBuffer();

      // Upload buffer to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { 
            folder: `xtracare/${directory}`, 
            public_id: filename,
            format: format
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });

      // Save the Cloudinary URL to the file object
      file.filename = result.secure_url;
      file.fileName = result.secure_url; 
    };

    try {
      // Process all files
      await Promise.all(files.map(processImage));
      next();
    } catch (err) {
      console.error("Image processing error:", err);
      return next(new AppError("Failed while processing the image", 500));
    }
  });
};

module.exports = { uploadPhotoMiddleware, resizePhotoMiddleware };
