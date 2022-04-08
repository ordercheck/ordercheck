const express = require("express");
const router = express.Router();

const loginCheck = require("../../middleware/auth");
const { checkMember } = require("../../controller/check");
router.get("/company/member/:company_subdomain", loginCheck, checkMember);

module.exports = router;
