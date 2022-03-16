const express = require("express");
const router = express.Router();
const loginCheck = require("../../middleware/auth");
const { smsCheck } = require("../../middleware/smsCheck");
const {
  sendEmail,
  showStandbyUser,
  joinStandbyUser,
  refuseUser,
  sendSMS,
  rejoinCompany,
  cancelJoinCompany,
} = require("../../controller/invite");

// update Company
router.post("/email", loginCheck, sendEmail);
router.post("/SMS", loginCheck, smsCheck, sendSMS);
router.get("/standby", loginCheck, showStandbyUser);
router.get("/join/do/:memberId", loginCheck, joinStandbyUser);
router.get("/refuse/:memberId", loginCheck, refuseUser);
router.post("/rejoin", loginCheck, rejoinCompany);
router.post("/join/cancel", loginCheck, cancelJoinCompany);

module.exports = router;
