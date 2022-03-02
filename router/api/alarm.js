const express = require('express');
const router = express.Router();
const { delAlarm } = require('../../controller/alarm');
const loginCheck = require('../../middleware/auth');
router.delete('/', loginCheck, delAlarm);

module.exports = router;
