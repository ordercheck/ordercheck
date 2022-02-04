const express = require('express');
const router = express.Router();
const loginCheck = require('../../middleware/auth');
const {
  sendEmail,
  joinToCompany,
  showStandbyUser,
  joinStandbyUser,
} = require('../../controller/invite');

// update Company
router.post('/email', loginCheck, sendEmail);
router.post('/join/company', joinToCompany);
router.get('/standby', loginCheck, showStandbyUser);
router.post('/join/do', loginCheck, joinStandbyUser);
module.exports = router;
