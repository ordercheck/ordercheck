const express = require("express");
const router = express.Router();
const { getHomeBoard } = require("../../controller/home");
const loginCheck = require("../../middleware/auth");

router.get("/", loginCheck, getHomeBoard);

module.exports = router;
