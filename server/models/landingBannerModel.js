const slugify = require("slugify");
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const landingBannerSchema = new Schema(
  {
    photo: {
      type: String,
    },

  },

  {
    timestamps: true,
  }
);


const LandingBanner = model("LandingBanner", landingBannerSchema);
module.exports = LandingBanner;
