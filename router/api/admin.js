const express = require("express");

const router = express.Router();

const {
  getInfo,
  changePlan,
  chargeFreeSms,
  changePlanInfo,
} = require("../../controller/admin");

router.get("/info", getInfo);

router.patch("/company/plan", changePlan);

router.post("/charge/free/sms", chargeFreeSms);

router.patch("/plan/info", changePlanInfo);

module.exports = router;
