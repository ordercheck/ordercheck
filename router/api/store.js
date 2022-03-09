const express = require('express');
const router = express.Router();
const { storeBread, delBread } = require('../../controller/store');
const loginCheck = require('../../middleware/auth');
router.post('/root', loginCheck, storeBread);
router.delete('/root/:breadId', loginCheck, delBread);

module.exports = router;
