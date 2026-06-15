const express = require("express");
const {
  applyDiscountController,
  addQuantityDiscount,
  getQuantityDiscount,
  deleteQuantityDiscount,
} = require("../../controllers/discountController");

const router = express.Router();

router.route("/apply").post(addQuantityDiscount).put(applyDiscountController).get(getQuantityDiscount).delete(deleteQuantityDiscount);

module.exports = router;
