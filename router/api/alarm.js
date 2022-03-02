const express = require('express');
const router = express.Router();
const { delAlarm, confirmAlarm } = require('../../controller/alarm');
const loginCheck = require('../../middleware/auth');
router.delete('/:alarmId', loginCheck, delAlarm);
router.post('/confirm', loginCheck, confirmAlarm);

module.exports = router;
