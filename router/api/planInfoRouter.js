const express = require("express");
const router = express.Router();
const { inputPlanInfo } = require("../../controller/planInfo");

router.post("/", inputPlanInfo);

module.exports = router;
