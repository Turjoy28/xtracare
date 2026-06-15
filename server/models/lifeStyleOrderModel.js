const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const LifeStyleOrderSchema = new Schema(
  {
    title: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

const LifeStyleOrder = model("LifeStyleOrder", LifeStyleOrderSchema);
module.exports = LifeStyleOrder;
