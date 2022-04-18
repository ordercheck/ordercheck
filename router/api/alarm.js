const express = require("express");
const router = express.Router();
const {
  delAlarm,
  confirmAlarm,
  repeatAlarm,
} = require("../../controller/alarm");
const { loginCheck } = require("../../middleware/auth");

router.post("/confirm", loginCheck, confirmAlarm);

router.post("/repeat", loginCheck, repeatAlarm);

router.post("/del", loginCheck, delAlarm);

module.exports = router;
