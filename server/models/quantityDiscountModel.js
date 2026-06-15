const mongoose = require("mongoose");

const quantityDiscountSchema = new mongoose.Schema({
  minQuantity: { type: Number, required: true },
  discountType: {
    type: String,
    enum: ["percent", "amount", "none"],
    required: true,
  },
  discountValue: { type: Number, required: true },
});

const QuantityDiscount = mongoose.model(
  "QuantityDiscount",
  quantityDiscountSchema
);

module.exports = QuantityDiscount;
