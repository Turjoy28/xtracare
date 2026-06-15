const express = require("express");
const {
  createlifeStyleHotTitleController, getAlllifeStyleHotTitleController,deletelifeStyleHotTitleController,
  createlifeStyleCustomerReviewController,getAlllifeStyleCustomerReviewController,deletelifeStyleCustomerReviewController,
  createlifeStyleProductController,getAlllifeStyleProductController,deletelifeStyleProductController,
  createlifeStyleOrderController,
  getAlllifeStyleOrderController,
  deletelifeStyleOrderController, 
} = require("../../controllers/lifestyleTitleController");



const router = express.Router();

router.route("/hot-title")
  .post(createlifeStyleHotTitleController)
  .get(getAlllifeStyleHotTitleController);
router.route("/hot-title/:id")
  .delete(deletelifeStyleHotTitleController);

  router.route("/customer-review")
  .post(createlifeStyleCustomerReviewController)
  .get(getAlllifeStyleCustomerReviewController);
router.route("/customer-review/:id")
  .delete(deletelifeStyleCustomerReviewController);

  router.route("/product")
  .post(createlifeStyleProductController)
  .get(getAlllifeStyleProductController);
router.route("/product/:id")
  .delete(deletelifeStyleProductController);

  router.route("/order")
  .post(createlifeStyleOrderController)
  .get(getAlllifeStyleOrderController);
router.route("/order/:id")
  .delete(deletelifeStyleOrderController);

module.exports = router;
