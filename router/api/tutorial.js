const express = require("express");
const router = express.Router();

const { loginCheck } = require("../../middleware/auth");

const { changeReload } = require("../../controller/tutorial");
router.patch("/reload", loginCheck, changeReload);

module.exports = router;
