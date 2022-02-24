const express = require('express');
const router = express.Router();
const {
  getCompanyProfile,
  changeCompanyLogo,
  changeCompanyInfo,
  changeCompanyEnrollment,
  getCompanyProfileMember,
  searchMember,
  delCompanyMember,
  showTemplateList,
  addTemplate,
  delTemplate,
  showPlan,
  showPlanHistory,
  showDetailPlan,
  showSmsInfo,
  changeSms,
  showSmsHistory,
  paySms,
  showCardsInfo,
  showCardDetailInfo,
  delCard,
} = require('../../controller/config');
const {
  multer_company_logo_upload,
  multer_company_Enrollment_upload,
} = require('../../lib/aws/aws');
const loginCheck = require('../../middleware/auth');

router.get('/company', loginCheck, getCompanyProfile);
router.get('/company/member', loginCheck, getCompanyProfileMember);
router.get('/company/search/member', loginCheck, searchMember);
router.get('/company/template', loginCheck, showTemplateList);
router.post('/company/template', loginCheck, addTemplate);
router.get('/company/plan', loginCheck, showPlan);
router.get('/company/plan/history', loginCheck, showPlanHistory);
router.get('/company/plan/detail/:planId', loginCheck, showDetailPlan);
router.get('/company/sms', loginCheck, showSmsInfo);
router.get('/company/card', loginCheck, showCardsInfo);
router.get('/company/card/detail/:cardId', loginCheck, showCardDetailInfo);
router.delete('/company/card/:cardId', loginCheck, delCard);

router.get('/company/sms/history', loginCheck, showSmsHistory);

router.post('/company/sms/pay', loginCheck, paySms);
router.patch('/company/sms', loginCheck, changeSms);
router.patch('/company', loginCheck, changeCompanyInfo);

router.delete('/company/member/:memberId', loginCheck, delCompanyMember);
router.delete('/company/template/:templateId', loginCheck, delTemplate);
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
