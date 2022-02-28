const express = require('express');
const router = express.Router();
const { socketTest } = require('../../controller/socket');
const loginCheck = require('../../middleware/auth');
router.post('/', socketTest);

module.exports = router;
