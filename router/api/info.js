const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../../controller/config');

const loginCheck = require('../../middleware/auth');

router.get('/user', loginCheck, getUserProfile);
module.exports = router;
