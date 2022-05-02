const express = require("express");
const router = express.Router();
const { storePairpaceInfo } = require("../../controller/pairpace");

router.post("/store/info", storePairpaceInfo);

module.exports = router;
