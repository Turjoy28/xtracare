const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const LifeStyleProductSchema = new Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },

  },
  {
    timestamps: true,
  }
);

const LifeStyleProduct = model("LifeStyleProduct", LifeStyleProductSchema);
module.exports = LifeStyleProduct;
