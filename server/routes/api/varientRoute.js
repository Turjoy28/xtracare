const express = require("express");
const {
  createVarientController,
  getAllVarientsController,
  getVarientController,
  updateVarientController,
  deleteVarientController,
  getOptionsByVariant,
  getVariantsByProductNameController,
  getAllVarientsFeaturedProductController,
} = require("../../controllers/varientController");

const router = express.Router();

router.route("/").post(createVarientController).get(getAllVarientsController);
router.route("/featuredProduct").get(getAllVarientsFeaturedProductController);
router.route("/product/:name").get(getVariantsByProductNameController);

router
  .route("/:id")
  .get(getVarientController)
  .patch(updateVarientController)
  .delete(deleteVarientController);

// Get all (Options) of a Variant:
router.get("/:variantId/options", getOptionsByVariant);

module.exports = router;
