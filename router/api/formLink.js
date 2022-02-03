const express = require('express');
const router = express.Router();
const {
  multer_calculate_upload,
  multer_form_upload,
  multer_form_thumbNail_upload,
} = require('../../lib/aws/aws');
const loginCheck = require('../../middleware/auth');

const {
  createFormLink,
  showFormLink,
  createThumbNail,
} = require('../../controller/formLink');

// formlink 만들기
router.post('/', loginCheck, createFormLink);

// 만든 fomlink Form 보여주기
router.get('/list', loginCheck, showFormLink);
// 만든 fomlink thumbNail 만들기
router.post(
  '/thumbNail',
  loginCheck,
  multer_form_thumbNail_upload().single('img'),
  createThumbNail
);
module.exports = router;
