const deleteFile = require("../utils/deleteFile");

const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { getOne, getAll } = require("../utils/handleFactory");
const LandingCustomerReview = require("../models/landingCoustomerReviewModel");

exports.createLandingCustomerReviewController = catchAsync(async (req, res, next) => {
  const body = req.body;

  if (req.file) {
    const { fieldname } = req.file;
    body[fieldname] = req.file.filename;
  } else {
    delete body.photo;
  }

  try {
    const banner = await LandingCustomerReview.create(body);
    if (!banner) {
      return next(new AppError("Occured an error while creating banner", 500));
    }

    res.status(201).json({
      status: "success",
      message: "LandingCustomerReview has been added successfully",
      data: {
        banner,
      },
    });
  } catch (error) {
    if (req.file) {
      try {
        await deleteFile(req.file.filename);
      } catch (err) {
        console.error("Failed to delete banner photo:", err);
      }
    }

    if (error.errors) {
      const messages = Object.values(error.errors)
        .map((item) => item.properties.message)
        .join(", ");

      return next(new AppError(`Validation failed, ${messages}.`, 400));
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyPattern).join(" ");
      const capitalizeField =
        field.charAt(0).toUpperCase() + field.slice(1).toLocaleLowerCase();

      const message = `${capitalizeField} already exist, Please use another ${field}.`; // ${err.keyValue.name}
      return next(new AppError(message, 409));
    }

    return next(
      new AppError(`Something went wrong while creating banner`, 400)
    );
  }
});

exports.deleteLandingCustomerReviewController = catchAsync(async (req, res, next) => {
  const banner = await LandingCustomerReview.findByIdAndDelete(req.params.id);
  if (!banner) {
    return next(new AppError("No banner was found with that ID!", 404));
  }

  // PHOTO DELETING FROM SERVER:
  if (banner.photo) {
    try {
      await deleteFile(banner.photo);
    } catch (err) {
      console.error("Failed to delete banner photo:", err);
    }
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getLandingCustomerReviewController = getOne(LandingCustomerReview);

exports.getAllLandingCustomerReviewController = getAll(LandingCustomerReview);
