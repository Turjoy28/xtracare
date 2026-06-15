const QuantityDiscount = require("../models/quantityDiscountModel"); // Import the new model
const Option = require("../models/optionModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.addQuantityDiscount = catchAsync(async (req, res, next) => {
  const { discountType, discountValue, minQuantity } = req.body;

  // Validate discount type and value
  if (
    !["percent", "amount", "none"].includes(discountType) ||
    discountValue == null ||
    isNaN(discountValue) ||
    discountValue < 0
  ) {
    return next(new AppError("Invalid discount type or value", 400));
  }

  // Validate minQuantity
  if (!minQuantity || isNaN(minQuantity) || minQuantity <= 0) {
    return next(new AppError("Valid minQuantity is required", 400));
  }

  // Check if a discount with the same minQuantity already exists
  const existingDiscount = await QuantityDiscount.findOne({ minQuantity });

  if (existingDiscount) {
    return next(
      new AppError(`A discount for Quantity ${minQuantity} already exists`, 400)
    );
  }

  // Create a new quantity-based discount
  const newDiscount = await QuantityDiscount.create({
    type: "quantity",
    discountType,
    discountValue,
    minQuantity,
  });

  res.status(201).json({
    status: "success",
    message: "Quantity discount created successfully",
    data: newDiscount,
  });
});

exports.getQuantityDiscount = catchAsync(async (req, res, next) => {
  // Retrieve all quantity discounts from the database
  const quantityDiscounts = await QuantityDiscount.find();

  // Return the fetched quantity discounts
  res.status(200).json({
    status: "success",
    message: "Quantity discounts fetched successfully",
    data: quantityDiscounts,
  });
});

exports.deleteQuantityDiscount = catchAsync(async (req, res, next) => {
  const { id } = req.body; // Get the ID from the request body

  // Validate if the ID is provided
  if (!id) {
    return next(
      new AppError("ID is required to delete the quantity discount", 400)
    );
  }

  // Find and delete the quantity discount with the specified ID
  const quantityDiscount = await QuantityDiscount.findByIdAndDelete(id);

  // If no discount found, send an error response
  if (!quantityDiscount) {
    return next(
      new AppError("No quantity discount found with the provided ID", 404)
    );
  }

  // Successfully deleted the discount
  res.status(200).json({
    status: "success",
    message: "Quantity discount deleted successfully",
  });
});

exports.applyDiscountController = catchAsync(async (req, res, next) => {
  let { type, id, discountType, discountValue, minQuantity } = req.body;

  if (
    !["percent", "amount", "none"].includes(discountType) ||
    discountValue == null ||
    isNaN(discountValue) ||
    discountValue < 0
  ) {
    return next(new AppError("Invalid discount type or value", 400));
  }

  if (!id && type == "percent") {
    return next(new AppError("ID is required to implement discount", 400));
  }

  if (
    ![
      "category",
      "subCategory",
      "brand",
      "product",
      "variant",
      "option",
      "quantity",
    ].includes(type)
  ) {
    return next(
      new AppError(
        "Invalid type, must be category, subCategory, brand, product, variant, option, or quantity",
        400
      )
    );
  }

  // Store quantity discounts in a different model
  if (type === "quantity") {
    if (!minQuantity || isNaN(minQuantity) || minQuantity <= 0) {
      return next(
        new AppError("Valid minQuantity is required for quantity discount", 400)
      );
    }

    // Find and update the existing quantity discount instead of creating a new one
    const quantityDiscount = await QuantityDiscount.findOneAndUpdate(
      { _id: id }, // Find based on type and typeId
      { minQuantity, discountType, discountValue }, // Update these fields
      { new: true, upsert: false } // Do not create if not found
    );

    if (!quantityDiscount) {
      return next(new AppError("No existing quantity discount found", 404));
    }

    return res.status(200).json({
      status: "success",
      message: "Quantity discount updated successfully",
      data: quantityDiscount,
    });
  }

  // Determine the filter based on the type for non-quantity discounts
  let filter;
  if (type === "category") {
    filter = { category: id };
  } else if (type === "subCategory") {
    filter = { subCategory: id };
  } else if (type === "brand") {
    filter = { brand: id };
  } else if (type === "product") {
    filter = { product: id };
  } else if (type === "variant") {
    filter = { variant: id };
  } else if (type === "option") {
    filter = { _id: id };
  }

  // Find all the options matching with the filter
  const options = await Option.find(filter);

  // Check each option to ensure the discount is valid
  for (const option of options) {
    const effectivePrice =
      option.price -
      (discountType === "percent"
        ? (option.price * discountValue) / 100
        : discountValue);

    if (effectivePrice <= 0) {
      return next(
        new AppError(
          `Discounted price for ${option.title} cannot be equal to or less than zero`,
          400
        )
      );
    }
  }

  // Apply discount to the options
  for (const option of options) {
    let salePrice =
      discountValue === 0
        ? 0
        : discountType === "percent"
        ? option.price - (option.price * discountValue) / 100
        : option.price - discountValue;

    await Option.findOneAndUpdate(
      { _id: option._id },
      {
        salePrice,
        discountType: discountValue == 0 ? "none" : discountType,
        discountValue,
      },
      { new: true }
    );
  }

  res.status(200).json({
    status: "success",
    message: `Discount applied successfully to all applicable ${type}-based options`,
  });
});
