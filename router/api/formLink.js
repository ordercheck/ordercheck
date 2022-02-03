const express = require('express');
const router = express.Router();
const { multer_form_thumbNail_upload } = require('../../lib/aws/aws');
const loginCheck = require('../../middleware/auth');

const {
  createFormLink,
  showFormLink,
  createThumbNail,
  duplicateForm,
  delFormLink,
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

// form 복사하기
router.post('/duplicate', loginCheck, duplicateForm);

// form 삭제하기
router.delete('/', loginCheck, delFormLink);
module.exports = router;
