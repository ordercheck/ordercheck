const express = require('express');
const router = express.Router();
const { getUserList } = require('../../controller/fileStore');
const loginCheck = require('../../middleware/auth');
router.get('/list', loginCheck, getUserList);

module.exports = router;
