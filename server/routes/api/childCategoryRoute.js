const express = require("express");

const {
  createChildCategoryController,
  getAllChildCategoryController,
  getChildCategoryController,
  updateChildCategoryController,
  deleteChildCategoryController,
  createChildCategoryCascadingController,
} = require("../../controllers/childCategoryController");

const router = express.Router();

router.route("/cascading").post(createChildCategoryCascadingController);

router
  .route("/")
  .post(createChildCategoryController)
  .get(getAllChildCategoryController);

router
  .route("/:id")
  .get(getChildCategoryController)
  .patch(updateChildCategoryController)
  .delete(deleteChildCategoryController);

module.exports = router;
