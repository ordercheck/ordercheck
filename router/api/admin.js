const express = require("express");

const router = express.Router();

const { getInfo } = require("../../controller/admin");

router.get("/info", getInfo);

module.exports = router;
