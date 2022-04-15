const express = require("express");
const router = express.Router();
const { joinDoCustomer, getHome } = require("../../controller/mypage");
const loginCheck = require("../../middleware/auth");

router.post("/customer/join/do", joinDoCustomer);
router.post("/customer/home", getHome);
module.exports = router;
