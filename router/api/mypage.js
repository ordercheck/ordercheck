const express = require("express");
const router = express.Router();
const {
  joinDoCustomer,
  getConsultList,
  checkCustomer,
  getDetailConsulting,
  getCalculateList,
  setFavoritesCalculate,
  unsetFavoritesCalculate,
  getFavoritesCalculateList,
  getDetailCalculate,
  getCustomerProfile,
  changeCustomerName,
} = require("../../controller/mypage");
const { customerLoginCheck } = require("../../middleware/auth");

router.post("/customer/join/do", joinDoCustomer);

router.post("/customer/check/customer", checkCustomer);

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

router.get("/customer/profile", customerLoginCheck, getCustomerProfile);
router.post("/customer", customerLoginCheck, changeCustomerName);

module.exports = router;
