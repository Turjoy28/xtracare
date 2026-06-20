const express = require("express");
const baseURL = process.env.BASE_URL || "/api/v1";
const apiRoutes = require("./api");
const errorRouteMiddleware = require("../middlewares/errorRouteMiddleware");

const router = express.Router();

router.use(baseURL, apiRoutes);
router.all("*", errorRouteMiddleware);

module.exports = router;
