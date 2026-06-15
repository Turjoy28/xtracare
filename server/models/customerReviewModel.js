const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const CustomerReviewSchema = new Schema(
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

const CustomerReview = model("CustomerReview", CustomerReviewSchema);
module.exports = CustomerReview;
