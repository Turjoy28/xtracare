/* eslint-disable no-unused-vars */
const fs = require("fs");
const Brand = require("../models/brandModel");
const Variant = require("../models/variantModel");
const Option = require("../models/optionModel");
const APIFeatures = require("../utils/APIFeatures");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const deleteFile = require("../utils/deleteFile");
const { getAll, getOne } = require("../utils/handleFactory");
const FeaturedProduct = require("../models/featuredProductModel");

exports.createFeaturedProductController = catchAsync(async (req, res, next) => {
  const body = req.body;
  const { id } = body;



  try {
    // Check if a product with the given ID exists
    const existingProduct = await FeaturedProduct.findOne({ productRef: id });


    if (existingProduct) {
      // If found, delete the existing product
      const data = await FeaturedProduct.deleteOne({
        _id: existingProduct._id,
      });

      return res.status(200).json({
        status: "success",
        message: "FeaturedProduct has been deleted successfully",
      });
    } else {
      // If not found, create a new product
      const product = await FeaturedProduct.create({
        productRef: id,
      });
      return res.status(201).json({
        status: "success",
        message: "FeaturedProduct has been created successfully",
        data: {
          product,
        },
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: "Error processing FeaturedProduct",
      error: error.message,
    });
  }
});

exports.createFeaturedProductBundleController = catchAsync(
  async (req, res, next) => {
    const body = req.body;



    const isLocalhost = req.get("host").includes("localhost");
    const protocol = isLocalhost ? "http" : "https";



    if (req.files && req.files.length > 0) {
      body.photos = req.files.map((file) => file.filename);
    } else {
      delete body.photos;
    }


    // Add YouTube video URL to the photos array
    if (body.videoUrl && body.videoUrl) {
      body.photos = body.photos || [];
      body.photos.push(body.videoUrl);
    }
    if (body.videoUrl) {
      return next(
        new AppError("Invalid link, Please provide a valid YouTube URL", 400)
      );
    }

    try {


      if (body?.brand == "undefined") {
        delete body.brand;
      }

      const product = await FeaturedProduct.create(body);


      const brand = await Brand.findOneAndUpdate(
        { _id: product?.brand },
        {
          $push: { products: product._id },
        },
        { new: true }
      );



      res.status(201).json({
        status: "success",
        message: "FeaturedProduct has been created successfully",
        data: {
          product,
        },
      });
    } catch (error) {

      if (error.errors) {
        const messages = Object.values(error.errors)
          .map((item) => item.properties.message)
          .join(", ");

        return next(new AppError(`Validation failed, ${messages}.`, 400));
      } else if (error.code === 11000) {

        const field = Object.keys(error.keyPattern).join(" ");
        const capitalizeField =
          field.charAt(0).toUpperCase() + field.slice(1).toLocaleLowerCase();

        const message = `${capitalizeField} already exist, Please use another ${field}.`;

        return next(new AppError(message, 409));
      }

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            await deleteFile(file.filename);
          } catch (err) {
            console.error(`Error removing file: ${file.filename}`, err);
          }
        }
      }

      return next(
        new AppError(`Something went wrong while creating varient`, 400)
      );
    }
  }
);

exports.getAllFeaturedProductsController = catchAsync(
  async (req, res, next) => {
    const allFeaturedProduct = await FeaturedProduct.find().populate([
      {
        path: "productRef",
        // select: "category -subCategory -brand -product -__v",
      },
    ]);

    res.status(200).json({
      status: "success",
      message: "FeaturedProduct has been updated successfully",
      data: {
        allFeaturedProduct,
      },
    });
  }
);

exports.getAllBundleController = catchAsync(async (req, res, next) => {
  const allFeaturedProduct = await FeaturedProduct.find().populate([
    {
      path: "category subCategory brand",
      select: "title",
    },
    {
      path: "bundleFeaturedProducts",
      select: "name",
    },
    {
      path: "variants",
      select: "-category -subCategory -brand -product -__v",
      populate: {
        path: "options",
        select: "size price stock",
      },
    },
    // {
    //   path: "variants.options",
    //   // select: "category -subCategory -brand -product -__v",
    // },
  ]);

  res.status(200).json({
    status: "success",
    message: "FeaturedProduct has been updated successfully",
    data: {
      allFeaturedProduct,
    },
  });
});

// exports.getAllFeaturedProductsController = getAll(FeaturedProduct, [
//   {
//     path: "category subCategory brand",
//     select: "title",
//   },
//   {
//     path: "variants",
//     select: "-category -subCategory -brand -product -__v",
//   },
//   {
//     path: "variants.options",
//     // select: "category -subCategory -brand -product -__v",
//   },
// ]);

exports.getFeaturedProductController = getOne(FeaturedProduct, [
  {
    path: "category subCategory brand",
    select: "title",
  },
  {
    path: "bundleFeaturedProducts",
    select: "name photos",
  },
  {
    path: "variants",
    select: "-category -subCategory -brand -product -__v",
    populate: {
      path: "options",
      select: "-category -subCategory -brand -product -variant -__v",
    },
  },
]);

exports.getFeaturedProductBundleController = getOne(FeaturedProduct, [
  {
    path: "category subCategory brand",
    select: "title",
  },
  {
    path: "variants",
    select: "-category -subCategory -brand -product -__v",
    populate: {
      path: "options",
      select: "-category -subCategory -brand -product -variant -__v",
    },
  },
]);

exports.updateFeaturedProductController = catchAsync(async (req, res, next) => {
  const product = await FeaturedProduct.findById(req.params.id);
  if (!product) {
    return next(new AppError("No product was found with that ID!", 404));
  }

  const body = req.body;

  // Handle photo uploads if present
  if (req.files && req.files.length > 0) {
    // Remove old photos from file system
    if (product.photos && product.photos.length > 0) {
      for (const photoPath of product.photos) {
        try {
          await deleteFile(photoPath);
        } catch (err) {
          console.error(`Failed to delete file: ${err.message}`);
        }
      }
    }

    // Update photos
    body.photos = req.files.map((file) => file.filename);
  }

  const isValidYouTubeUrl = (url) => {
    const regex =
      /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]{11}\?si=[a-zA-Z0-9_-]+$/;
    return regex.test(url);
  };

  if (body.videoUrl) {
    if (!isValidYouTubeUrl(body.videoUrl)) {
      return next(
        new AppError("Invalid link, Please provide a valid YouTube URL", 400)
      );
    }

    // Check if the videoUrl already exists in the photos array
    if (!product.photos.includes(body.videoUrl)) {
      if (body.photos) {
        body.photos.push(body.videoUrl);
      } else {
        product.photos = product.photos || [];
        product.photos.push(body.videoUrl);
      }
    }
  }

  // Update only the fields that are present in the request body
  Object.keys(body).forEach((key) => {
    product[key] = body[key];
  });

  await product.save();

  res.status(200).json({
    status: "success",
    message: "FeaturedProduct has been updated successfully",
    data: {
      product,
    },
  });
});

exports.updateFeaturedProductController = catchAsync(async (req, res, next) => {
  const product = await FeaturedProduct.findById(req.params.id);
  if (!product) {
    return next(new AppError("No product was found with that ID!", 404));
  }

  const body = req.body;

  // Handle photo uploads if present
  if (req.files && req.files.length > 0) {
    // Remove old photos from file system
    if (product.photos && product.photos.length > 0) {
      for (const photoPath of product.photos) {
        try {
          await deleteFile(photoPath);
        } catch (err) {
          console.error(`Failed to delete file: ${err.message}`);
        }
      }
    }

    // Update photos
    body.photos = req.files.map((file) => file.filename);
  }

  const isValidYouTubeUrl = (url) => {
    const regex =
      /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]{11}\?si=[a-zA-Z0-9_-]+$/;
    return regex.test(url);
  };

  if (body.videoUrl) {
    if (!isValidYouTubeUrl(body.videoUrl)) {
      return next(
        new AppError("Invalid link, Please provide a valid YouTube URL", 400)
      );
    }

    // Check if the videoUrl already exists in the photos array
    if (!product.photos.includes(body.videoUrl)) {
      if (body.photos) {
        body.photos.push(body.videoUrl);
      } else {
        product.photos = product.photos || [];
        product.photos.push(body.videoUrl);
      }
    }
  }

  // Update only the fields that are present in the request body
  Object.keys(body).forEach((key) => {
    product[key] = body[key];
  });

  await product.save();

  res.status(200).json({
    status: "success",
    message: "FeaturedProduct has been updated successfully",
    data: {
      product,
    },
  });
});

exports.updateFeaturedProductBundleController = catchAsync(
  async (req, res, next) => {
    const product = await FeaturedProduct.findById(req.params.id);
    if (!product) {
      return next(new AppError("No product was found with that ID!", 404));
    }

    const body = req.body;

    // Handle photo uploads if present
    if (req.files && req.files.length > 0) {
      // Remove old photos from file system
      if (product.photos && product.photos.length > 0) {
        for (const photoPath of product.photos) {
          try {
            await deleteFile(photoPath);
          } catch (err) {
            console.error(`Failed to delete file: ${err.message}`);
          }
        }
      }

      // Update photos
      body.photos = req.files.map((file) => file.filename);
    }

    const isValidYouTubeUrl = (url) => {
      const regex =
        /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]{11}\?si=[a-zA-Z0-9_-]+$/;
      return regex.test(url);
    };

    if (body.videoUrl) {
      if (!isValidYouTubeUrl(body.videoUrl)) {
        return next(
          new AppError("Invalid link, Please provide a valid YouTube URL", 400)
        );
      }

      // Check if the videoUrl already exists in the photos array
      if (!product.photos.includes(body.videoUrl)) {
        if (body.photos) {
          body.photos.push(body.videoUrl);
        } else {
          product.photos = product.photos || [];
          product.photos.push(body.videoUrl);
        }
      }
    }

    // Update only the fields that are present in the request body
    Object.keys(body).forEach((key) => {
      product[key] = body[key];
    });

    await product.save();

    res.status(200).json({
      status: "success",
      message: "FeaturedProduct has been updated successfully",
      data: {
        product,
      },
    });
  }
);

exports.deleteFeaturedProductController = catchAsync(async (req, res, next) => {
  const product = await FeaturedProduct.findById(req.params.id);
  if (!product) {
    return next(new AppError("No product was found with that ID!", 404));
  }

  if (product.photos && product.photos.length > 0) {
    for (const photoPath of product.photos) {
      try {
        await deleteFile(photoPath);
      } catch (err) {
        console.error(`Failed to delete file: ${err.message}`);
        // Continue with the deletion process even if the file deletion fails
      }
    }
  }

  // Find and delete all variants associated with the product
  const variants = await Variant.find({ product: product._id });

  for (const variant of variants) {
    await Option.deleteMany({ variant: variant._id });

    await Variant.findByIdAndDelete(variant._id);
  }

  // Remove the product ID from the associated brand's products array
  await Brand.findOneAndUpdate(
    { _id: product.brand },
    { $pull: { products: product._id } },
    { new: true }
  );

  // Delete the product
  await FeaturedProduct.findByIdAndDelete(product._id);

  res.status(204).json({
    status: "success",
    message:
      "FeaturedProduct and associated variants & options have been deleted successfully",
    data: null,
  });
});

exports.deleteFeaturedProductBundleController = catchAsync(
  async (req, res, next) => {
    const product = await FeaturedProduct.findById(req.params.id);
    if (!product) {
      return next(new AppError("No product was found with that ID!", 404));
    }

    if (product.photos && product.photos.length > 0) {
      for (const photoPath of product.photos) {
        try {
          await deleteFile(photoPath);
        } catch (err) {
          console.error(`Failed to delete file: ${err.message}`);
          // Continue with the deletion process even if the file deletion fails
        }
      }
    }

    // Find and delete all variants associated with the product
    const variants = await Variant.find({ product: product._id });

    for (const variant of variants) {
      await Option.deleteMany({ variant: variant._id });

      await Variant.findByIdAndDelete(variant._id);
    }

    // Remove the product ID from the associated brand's products array
    await Brand.findOneAndUpdate(
      { _id: product.brand },
      { $pull: { products: product._id } },
      { new: true }
    );

    // Delete the product
    await FeaturedProduct.findByIdAndDelete(product._id);

    res.status(204).json({
      status: "success",
      message:
        "FeaturedProduct and associated variants & options have been deleted successfully",
      data: null,
    });
  }
);

// Get all (Variants, Options) of a FeaturedProduct:
exports.getVariantsByFeaturedProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const product = await FeaturedProduct.findById(productId);
  if (!product) {
    return next(new AppError("No product found with that ID!", 404));
  }

  // Find variants associated with the product
  const variants = await Variant.find({ product: productId }).select("-__v");

  res.status(200).json({
    status: "success",
    results: variants.length,
    data: {
      variants,
    },
  });
});

exports.getOptionsByFeaturedProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const product = await FeaturedProduct.findById(productId);
  if (!product) {
    return next(new AppError("No product found with that ID!", 404));
  }

  // Find options associated with the product
  const query = Option.find({ product: productId })
    .populate([
      {
        path: "category subCategory brand",
        select: "title",
      },
      {
        path: "product",
        select: "-category -subCategory -brand -variants -__v",
      },
      {
        path: "variant",
        select: "colorName colorCode details",
      },
    ])
    .select("-__v");

  const features = new APIFeatures(query, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const options = await features.query;

  res.status(200).json({
    status: "success",
    results: options.length,
    data: {
      options,
    },
  });
});
