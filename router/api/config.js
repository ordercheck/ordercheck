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
  changeTemplate,
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
  showDetailTemplate,
  setCardMain,
  getReceiptList,
  getReceiptDetail,
  showFormList,
  setFormOpenMembers,
  showChatTemplate,
  delCompanyLogo,
  changeMemberInfo,
  addTemplate,
} = require('../../controller/config');
const {
  multer_upload_img,
  multer_company_Enrollment_upload,
} = require('../../lib/aws/aws');
const loginCheck = require('../../middleware/auth');

router.get('/company', loginCheck, getCompanyProfile);
router.get('/company/member', loginCheck, getCompanyProfileMember);
router.get('/company/search/member', loginCheck, searchMember);
router.get('/company/template', loginCheck, showTemplateList);
router.post('/company/template', loginCheck, addTemplate);
router.patch('/company/template/:templateId', loginCheck, changeTemplate);
router.get(
  '/company/template/detail/:templateId',
  loginCheck,
  showDetailTemplate
);

router.get('/company/plan', loginCheck, showPlan);
router.get('/company/plan/history', loginCheck, showPlanHistory);
router.get('/company/plan/detail/:planId', loginCheck, showDetailPlan);
router.get('/company/sms', loginCheck, showSmsInfo);
router.get('/company/card', loginCheck, showCardsInfo);
router.get('/company/card/detail/:cardId', loginCheck, showCardDetailInfo);
router.post('/company/card/set/main/:cardId', loginCheck, setCardMain);
router.delete('/company/card/:cardId', loginCheck, delCard);
router.get('/company/card/receipt/list', loginCheck, getReceiptList);
router.get(
  '/company/card/receipt/detail/:receiptId',
  loginCheck,
  getReceiptDetail
);

router.get('/company/sms/history', loginCheck, showSmsHistory);

router.post('/company/sms/pay', loginCheck, paySms);
router.patch('/company/sms', loginCheck, changeSms);
router.patch('/company', loginCheck, changeCompanyInfo);

router.delete('/company/member/:memberId', loginCheck, delCompanyMember);
router.patch('/company/member/:memberId', loginCheck, changeMemberInfo);

router.delete('/company/template/:templateId', loginCheck, delTemplate);
router.patch(
  '/company/logo',
  loginCheck,
  multer_upload_img().single('img'),
  changeCompanyLogo
);
router.delete('/company/logo', loginCheck, delCompanyLogo);

router.patch(
  '/company/enrollment',
  loginCheck,
  multer_company_Enrollment_upload().single('file'),
  changeCompanyEnrollment
);

router.get('/company/form/list', loginCheck, showFormList);
router.post('/company/form/set/member/:formId', loginCheck, setFormOpenMembers);
router.get('/company/chat/template', loginCheck, showChatTemplate);

module.exports = router;
