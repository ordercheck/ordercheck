const express = require('express');
const router = express.Router();
const { storeBread } = require('../../controller/store');
const loginCheck = require('../../middleware/auth');
router.post('/root', loginCheck, storeBread);

module.exports = router;
