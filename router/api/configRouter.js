const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  getCompanyProfile,
  changeCompanyLogo,
  changeCompanyInfo,
  changeCompanyEnrollment,
  getCompanyProfileMember,
  searchMember,
  delCompanyMember,
  showTemplateList,
} = require('../../controller/config');
const {
  multer_company_logo_upload,
  multer_company_Enrollment_upload,
} = require('../../lib/aws/aws');
const loginCheck = require('../../middleware/auth');
router.get('/user', loginCheck, getUserProfile);
router.get('/company', loginCheck, getCompanyProfile);
router.get('/company/member', loginCheck, getCompanyProfileMember);
router.get('/company/search/member', loginCheck, searchMember);
router.get('/company/template', loginCheck, showTemplateList);
router.patch('/company', loginCheck, changeCompanyInfo);
router.delete('/company/member/:memberId', loginCheck, delCompanyMember);
router.patch(
  '/company/logo',
  loginCheck,
  multer_company_logo_upload().single('img'),
  changeCompanyLogo
);
router.patch(
  '/company/enrollment',
  loginCheck,
  multer_company_Enrollment_upload().single('file'),
  changeCompanyEnrollment
);

module.exports = router;
