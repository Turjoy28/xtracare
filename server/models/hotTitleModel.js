const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const HotTitleSchema = new Schema(
  {
    title: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const HotTitle = model("HotTitle", HotTitleSchema);
module.exports = HotTitle;
