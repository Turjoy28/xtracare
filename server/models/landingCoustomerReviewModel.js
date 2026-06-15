const slugify = require("slugify");
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const landingCustomerReviewSchema = new Schema(
  {
    photo: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);


const LandingCustomerReview = model("LandingCustomerReview", landingCustomerReviewSchema);
module.exports = LandingCustomerReview;
