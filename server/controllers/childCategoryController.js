const ChildCategory = require("../models/childCategoryModel");
const SubCategory = require("../models/subCategoryModel");
const Category = require("../models/categoryModel");

const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const { createOne, getAll, getOne, updateOne } = require("../utils/handleFactory");

// ========= CRUD (standard) =========
exports.createChildCategoryController = createOne(ChildCategory);

exports.getAllChildCategoryController = getAll(ChildCategory, [
  { path: "subCategory", select: "title slug category" },
]);

exports.getChildCategoryController = getOne(ChildCategory, [
  { path: "subCategory", select: "title slug category" },
]);

exports.updateChildCategoryController = updateOne(ChildCategory);

exports.deleteChildCategoryController = catchAsync(async (req, res, next) => {
  const childCategory = await ChildCategory.findById(req.params.id);
  if (!childCategory) {
    return next(new AppError("No Child-Category was found with that ID!", 404));
  }

  const subCategoryId = childCategory.subCategory;

  // Delete child category
  await ChildCategory.findByIdAndDelete(req.params.id);

  // Remove ref from SubCategory.childCategories
  if (subCategoryId) {
    await SubCategory.findByIdAndUpdate(subCategoryId, {
      $pull: { childCategories: req.params.id },
    });
  }

  res.status(204).json({
    status: "success",
    message: "Child-Category deleted successfully",
    data: null,
  });
});

// ========= DRY Cascading Create =========
// Level 1: Category - if exists by title use it, else create
// Level 2: SubCategory - if exists by title (within category) use it, else create under Category
// Level 3: ChildCategory - ALWAYS create new under targeted SubCategory
exports.createChildCategoryCascadingController = catchAsync(
  async (req, res, next) => {
    const {
      categoryTitle,
      subCategoryTitle,
      childCategoryTitle,
    } = req.body || {};

    if (!categoryTitle || !subCategoryTitle) {
      return next(
        new AppError(
          "categoryTitle and subCategoryTitle are required.",
          400
        )
      );
    }

    // 1) Category: find-or-create by title
    let category = await Category.findOne({ title: categoryTitle });
    if (!category) {
      category = await Category.create({ title: categoryTitle });
    }

    // Ensure SubCategory is linked from Category (belt + suspenders)
    // (Existing flow relies on pushing into Category.subCategories, so we keep that DRY)
    // 2) SubCategory: find-or-create within category by title
    let subCategory = await SubCategory.findOne({
      category: category._id,
      title: subCategoryTitle,
    });

    if (!subCategory) {
      subCategory = await SubCategory.create({
        title: subCategoryTitle,
        category: category._id,
      });

      // Push reference from Category -> subCategories
      await Category.findByIdAndUpdate(category._id, {
        $addToSet: { subCategories: subCategory._id },
      });
    }

    // 3) ChildCategory: Create new under subCategory if provided
    let childCategory = null;
    if (childCategoryTitle) {
      childCategory = await ChildCategory.create({
        title: childCategoryTitle,
        subCategory: subCategory._id,
      });

      // Push reference from SubCategory -> childCategories
      await SubCategory.findByIdAndUpdate(subCategory._id, {
        $addToSet: { childCategories: childCategory._id },
      });
    }

    res.status(201).json({
      status: "success",
      message: "Category/SubCategory cascading logic completed successfully",
      data: {
        category,
        subCategory,
        childCategory,
      },
    });
  }
);
