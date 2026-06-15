/* eslint-disable no-unused-vars */
const express = require("express");
const {
  uploadPhotoMiddleware,
  resizePhotoMiddleware,
} = require("../../middlewares/uploadPhotoMiddleware");
const {
  createFeaturedProductController,
  getAllFeaturedProductsController,
  getFeaturedProductController,
  updateFeaturedProductController,
  deleteFeaturedProductController,
  getVariantsByFeaturedProduct,
  getOptionsByFeaturedProduct,
  createFeaturedProductBundleController,
  deleteFeaturedProductBundleController,
  updateFeaturedProductBundleController,
  getFeaturedProductBundleController,
  getAllBundleController
} = require("../../controllers/featuredProductController");

const router = express.Router();

router
  .route("/")
  .post(
    createFeaturedProductController
  )
  .get(getAllFeaturedProductsController);

// router
//   .route("/bundle")
//   .post(
//     uploadPhotoMiddleware(true, 10),
//     resizePhotoMiddleware("products"),
//     createFeaturedProductBundleController
//   )
//   .get(getAllBundleController);

// router
//   .route("/:id")
//   .get(getFeaturedProductController)
//   .patch(
//     uploadPhotoMiddleware(true, 10),
//     resizePhotoMiddleware("products"),
//     updateFeaturedProductController
//   )
//   .delete(deleteFeaturedProductController);

// router
//   .route("/bundle/:id")
//   .get(getFeaturedProductBundleController)
//   .patch(
//     uploadPhotoMiddleware(true, 10),
//     resizePhotoMiddleware("products"),
//     updateFeaturedProductBundleController
//   )
//   .delete(deleteFeaturedProductBundleController);

// Get all (Variants, Options) of a FeaturedProduct:
// router.get("/:productId/variants", getVariantsByFeaturedProduct);
// router.get("/:productId/options", getOptionsByFeaturedProduct);

module.exports = router;
