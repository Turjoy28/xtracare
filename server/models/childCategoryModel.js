const mongoose = require("mongoose");
const slugify = require("slugify");
const { Schema, model } = mongoose;

const childCategorySchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Child Category title is required"],
      trim: true,
    },
    slug: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // ব্যাক-রেফারেন্সের জন্য সাব-ক্যাটাগরি আইডি রাখা ভালো (অপশনাল)
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
    },
  },
  {
    timestamps: true,
  }
);

// childCategorySchema.pre("save", function (next) {
//   if (this.title) {
//     this.slug = slugify(this.title, { lower: true });
//   }
//   next();
// });

const ChildCategory = model("ChildCategory", childCategorySchema);
module.exports = ChildCategory;