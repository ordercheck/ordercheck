const express = require('express');
const router = express.Router();
const { addCard } = require('../../controller/card');
const loginCheck = require('../../middleware/auth');
router.post('/', loginCheck, addCard);

module.exports = router;
