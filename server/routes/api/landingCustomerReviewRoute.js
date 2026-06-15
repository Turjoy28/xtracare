const express = require("express");
const {
  createLandingCustomerReviewController,
  getAllLandingCustomerReviewController,
  getLandingCustomerReviewController,
  deleteLandingCustomerReviewController,
} = require("../../controllers/landingCustomerReviewController");
const {
  uploadPhotoMiddleware,
  resizePhotoMiddleware,
} = require("../../middlewares/uploadPhotoMiddleware");

const router = express.Router();

router
  .route("/")
  .post(
    uploadPhotoMiddleware(),
    resizePhotoMiddleware("banner"),
    createLandingCustomerReviewController
  )
  .get(getAllLandingCustomerReviewController);

router.route("/:id").get(getLandingCustomerReviewController).delete(deleteLandingCustomerReviewController);

module.exports = router;
