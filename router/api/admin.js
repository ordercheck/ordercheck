const express = require("express");

const router = express.Router();

const {
  getInfo,
  changePlan,
  chargeFreeSms,
} = require("../../controller/admin");

router.get("/info", getInfo);

router.patch("/company/plan", changePlan);

router.post("/charge/free/sms", chargeFreeSms);
module.exports = router;
