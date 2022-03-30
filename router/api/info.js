const express = require("express");
const router = express.Router();
const { multer_upload_img } = require("../../lib/aws/aws");
const {
  getUserProfile,
  checkUserCompany,
  delUser,
  exitCompany,
  addUserProfile,
  delUserProfile,
  changeUserProfile,
  showUserAlarmConfig,
  changeUserAlarmConfig,
  joinCompany,
} = require("../../controller/info");

const loginCheck = require("../../middleware/auth");

router.get("/user", loginCheck, getUserProfile);

router.patch("/user", loginCheck, changeUserProfile);

router.get("/user/check/del", loginCheck, checkUserCompany);

router.post("/user/del", loginCheck, delUser);

router.post(
  "/user/profile",
  loginCheck,
  multer_upload_img().single("img"),
  addUserProfile
);

router.delete("/user/profile", loginCheck, delUserProfile);

router.get("/user/alarm/config", loginCheck, showUserAlarmConfig);

router.patch("/user/alarm/config", loginCheck, changeUserAlarmConfig);

router.get("/user/join/company/:company_subdomain", loginCheck, joinCompany);

router.post("/company/exit", loginCheck, exitCompany);

module.exports = router;
