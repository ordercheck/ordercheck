const express = require("express");
const router = express.Router();
const {
  joinDoCustomer,
  getConsultList,
  loginMyPage,
  getDetailConsulting,
  getCalculateList,
  setFavoritesCalculate,
  unsetFavoritesCalculate,
  getFavoritesCalculateList,
  getDetailCalculate,
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

router.post(
  "/customer/calculate/set/favorites",
  customerLoginCheck,
  setFavoritesCalculate
);

router.post(
  "/customer/calculate/unset/favorites",
  customerLoginCheck,
  unsetFavoritesCalculate
);

router.get(
  "/customer/calculate/favorites/list",
  customerLoginCheck,
  getFavoritesCalculateList
);

router.get(
  "/customer/calculate/detail/:calculate_idx",
  customerLoginCheck,
  getDetailCalculate
);

module.exports = router;
