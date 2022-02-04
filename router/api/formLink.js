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
  showFormDetail,
  searchFormLink,
  updateForm,
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

// form 제목 화이트라벨 업데이트
router.patch('/update', loginCheck, updateForm);

// form 삭제하기
router.delete('/', loginCheck, delFormLink);
// form 제목으로 검색
router.get('/search', loginCheck, searchFormLink);
// form 상세보기
router.get('/:formId', loginCheck, showFormDetail);

module.exports = router;
