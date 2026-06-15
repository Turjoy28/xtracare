const slugify = require("slugify");
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      unique: true,
    },

    isBundle: {
      type: Boolean,
      default: false,
    },

    price: {
      type: Number,
    },

    totalPrice: {
      type: Number,
      default: 0,
    },

    bundleProducts: {
      type: [Schema.Types.ObjectId],
      ref: "Product",
    },

    photos: [
      {
        type: String,
        required: [true, "Photo is required"],
        trim: true,
      },
    ],

    description: {
      type: String,
      // required: [true, "Product description is required"],
      trim: true,
      required:false
    },

    slug: {
      type: String,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },

    subCategory: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: [true, "Sub-Category is required"],
    },

    childCategory: {
      type: Schema.Types.ObjectId,
      ref: "ChildCategory"
    },

    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
    },

    variants: [
      {
        type: Schema.Types.ObjectId,
        ref: "Variant",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Custom validation for photos field only on creation
productSchema.pre("validate", function (next) {
  if (this.isNew && (!this.photos || this.photos.length === 0)) {
    this.invalidate("photos", "At least one photo is required");
  }
  next();
});

productSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Product = model("Product", productSchema);
module.exports = Product;
