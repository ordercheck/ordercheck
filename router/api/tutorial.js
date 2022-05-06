const express = require("express");
const router = express.Router();

const { loginCheck } = require("../../middleware/auth");

const { changeReload } = require("../../controller/tutorial");
router.post("/reload", loginCheck, changeReload);

module.exports = router;
