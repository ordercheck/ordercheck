const express = require("express");
const router = express.Router();
const {
  joinDoCustomer,
  getHomeData,
  loginMyPage,
} = require("../../controller/mypage");
const { customerLoginCheck } = require("../../middleware/auth");

router.post("/customer/join/do", joinDoCustomer);

router.post("/customer/login", loginMyPage);

router.get("/customer/home", customerLoginCheck, getHomeData);
module.exports = router;
