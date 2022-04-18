const express = require("express");
const router = express.Router();
const { totalSearch } = require("../../controller/total");
const { loginCheck } = require("../../middleware/auth");
router.get("/search", loginCheck, totalSearch);

module.exports = router;
