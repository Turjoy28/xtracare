const express = require("express");
const {
  createLandingBannerController,
  getAllLandingBannerController,
  getLandingBannerController,
  deleteLandingBannerController,
} = require("../../controllers/landingBannerController");
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
    createLandingBannerController
  )
  .get(getAllLandingBannerController);

router.route("/:id").get(getLandingBannerController).delete(deleteLandingBannerController);

module.exports = router;
