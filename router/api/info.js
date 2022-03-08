const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  checkUserCompany,
} = require('../../controller/profile');

const loginCheck = require('../../middleware/auth');

router.get('/user', loginCheck, getUserProfile);
router.get('/check/del', loginCheck, checkUserCompany);
router.post('/del', loginCheck, checkUserCompany);

module.exports = router;
