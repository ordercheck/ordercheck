const express = require("express");
const router = express.Router();

const { loginCheck } = require("../../middleware/auth");
const { checkMember, getSubDomain } = require("../../controller/check");
router.get("/company/member/:company_subdomain", loginCheck, checkMember);

router.get("/company/subdomain", loginCheck, getSubDomain);

module.exports = router;
