const express = require('express');
const router = express.Router();
const loginCheck = require('../../middleware/auth');
const {
  sendEmail,
  joinToCompanyByRegist,
  showStandbyUser,
  joinStandbyUser,
  joinToCompanyByLogin,
} = require('../../controller/invite');

// update Company
router.post('/email', loginCheck, sendEmail);
router.post('/join/company/regist', joinToCompanyByRegist);
router.post('/join/company/login', joinToCompanyByLogin);
router.get('/standby', loginCheck, showStandbyUser);
router.get('/join/do/:memberId', loginCheck, joinStandbyUser);
module.exports = router;
