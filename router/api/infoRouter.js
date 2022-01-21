const express = require('express');
const router = express.Router();
const { getUserProfile, getCompanyProfile } = require('../../controller/info');
const loginCheck = require('../../middleware/auth');
router.get('/user', loginCheck, getUserProfile);
router.get('/company', loginCheck, getCompanyProfile);

module.exports = router;
