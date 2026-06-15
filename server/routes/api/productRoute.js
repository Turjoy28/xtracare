const express = require("express");
const {
  uploadPhotoMiddleware,
  resizePhotoMiddleware,
} = require("../../middlewares/uploadPhotoMiddleware");
const {
  createProductController,
  getAllProductsController,
  getProductController,
  updateProductController,
  deleteProductController,
  getVariantsByProduct,
  getOptionsByProduct,
  createProductBundleController,
  deleteProductBundleController,
  updateProductBundleController,
  getProductBundleController,
  getAllBundleController
} = require("../../controllers/productController");

const router = express.Router();

router
  .route("/")
  .post(
    uploadPhotoMiddleware(true, 10),
    resizePhotoMiddleware("products"),
    createProductController
  )
  .get(getAllProductsController);

router
  .route("/bundle")
  .post(
    uploadPhotoMiddleware(true, 10),
    resizePhotoMiddleware("products"),
    createProductBundleController
  )
  .get(getAllBundleController);

router
  .route("/:id")
  .get(getProductController)
  .patch(
    uploadPhotoMiddleware(true, 10),
    resizePhotoMiddleware("products"),
    updateProductController
  )
  .delete(deleteProductController);

router
  .route("/bundle/:id")
  .get(getProductBundleController)
  .patch(
    uploadPhotoMiddleware(true, 10),
    resizePhotoMiddleware("products"),
    updateProductBundleController
  )
  .delete(deleteProductBundleController);

// Get all (Variants, Options) of a Product:
router.get("/:productId/variants", getVariantsByProduct);
router.get("/:productId/options", getOptionsByProduct);

module.exports = router;
