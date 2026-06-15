const fs = require("fs");

const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { getOne, getAll } = require("../utils/handleFactory");
const HotTitle = require("../models/hotTitleModel");
const CustomerReview = require("../models/customerReviewModel");
const LifeStyleProduct = require("../models/lifeStyleProductModel");
const LifeStyleOrder = require("../models/lifeStyleOrderModel");


exports.createlifeStyleHotTitleController = catchAsync(async (req, res, next) => {
  const { title } = req.body;
  console.log(title);

  await HotTitle.deleteMany();

  const newHotTitle = await HotTitle.create({ title });

  res.status(201).json({
    status: "success",
    data: newHotTitle,
  });
});
exports.getAlllifeStyleHotTitleController = getAll(HotTitle);
exports.deletelifeStyleHotTitleController = catchAsync(async (req, res, next) => {
  const hottile = await HotTitle.findByIdAndDelete(req.params.id);
  if (!hottile) {
    return next(new AppError("No hottile was found with that ID!", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});


exports.createlifeStyleCustomerReviewController = catchAsync(async (req, res, next) => {
  const { title, description } = req.body;
  console.log(title);

  await CustomerReview.deleteMany();

  const newCustomerReview = await CustomerReview.create({ title, description });

  res.status(201).json({
    status: "success",
    data: newCustomerReview,
  });
});
exports.getAlllifeStyleCustomerReviewController = getAll(CustomerReview);
exports.deletelifeStyleCustomerReviewController = catchAsync(async (req, res, next) => {
  const hottile = await CustomerReview.findByIdAndDelete(req.params.id);
  if (!hottile) {
    return next(new AppError("No lifestyle customer review was found with that ID!", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createlifeStyleProductController = catchAsync(async (req, res, next) => {
  const { title, description } = req.body;
  console.log(title);

  await LifeStyleProduct.deleteMany();

  const newProduct = await LifeStyleProduct.create({ title, description });

  res.status(201).json({
    status: "success",
    data: newProduct,
  });
});
exports.getAlllifeStyleProductController = getAll(LifeStyleProduct);
exports.deletelifeStyleProductController = catchAsync(async (req, res, next) => {
  const hottile = await LifeStyleProduct.findByIdAndDelete(req.params.id);
  if (!hottile) {
    return next(new AppError("No lifestyle product was found with that ID!", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createlifeStyleOrderController = catchAsync(async (req, res, next) => {
  const { title } = req.body;
  console.log(title);

  await LifeStyleOrder.deleteMany();

  const newOrder = await LifeStyleOrder.create({ title });

  res.status(201).json({
    status: "success",
    data: newOrder,
  });
});
exports.getAlllifeStyleOrderController = getAll(LifeStyleOrder);
exports.deletelifeStyleOrderController = catchAsync(async (req, res, next) => {
  const hottile = await LifeStyleOrder.findByIdAndDelete(req.params.id);
  if (!hottile) {
    return next(new AppError("No lifestyle order was found with that ID!", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});




