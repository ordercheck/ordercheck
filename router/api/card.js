const express = require("express");
const router = express.Router();
const { enrollmentCard } = require("../../controller/card");
const { loginCheck } = require("../../middleware/auth");
router.post("/", loginCheck, enrollmentCard);

module.exports = router;
