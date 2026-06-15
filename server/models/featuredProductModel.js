/* eslint-disable no-unused-vars */
const slugify = require("slugify");
const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

const featuredProductsSchema = new Schema(
  {
    productRef: { type: Schema.Types.ObjectId, ref: "Product" },
  },

  {
    timestamps: true,
  }
);

// const FeaturedProduct = model("FeaturedProduct", featuredProductsSchema);
// Prevent OverwriteModelError
const FeaturedProduct =
  models.FeaturedProduct || model("FeaturedProduct", featuredProductsSchema);
module.exports = FeaturedProduct;
