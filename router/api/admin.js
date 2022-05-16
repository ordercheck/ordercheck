const express = require("express");

const router = express.Router();

const { getInfo, changePlan } = require("../../controller/admin");

router.get("/info", getInfo);

router.patch("/company/plan", changePlan);

module.exports = router;
