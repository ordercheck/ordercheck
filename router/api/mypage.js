const express = require("express");
const router = express.Router();
const {
  joinDoCustomer,
  getConsultList,
  loginMyPage,
  getDetailConsulting,
  getCalculateList,
} = require("../../controller/mypage");
const { customerLoginCheck } = require("../../middleware/auth");

router.post("/customer/join/do", joinDoCustomer);

router.post("/customer/login", loginMyPage);

router.get("/customer/consult/list", customerLoginCheck, getConsultList);

router.get(
  "/customer/consult/:consulting_idx",
  customerLoginCheck,
  getDetailConsulting
);

router.get("/customer/calculate/list", customerLoginCheck, getCalculateList);

module.exports = router;
