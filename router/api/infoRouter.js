const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../../controller/info');
const loginCheck = require('../../middleware/auth');
router.get('/user', loginCheck, getUserProfile);

module.exports = router;
