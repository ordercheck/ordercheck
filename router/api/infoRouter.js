const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  getCompanyProfile,
  changeCompanyLogo,
} = require('../../controller/info');
const { multer_company_logo_upload } = require('../../lib/aws/aws');
const loginCheck = require('../../middleware/auth');
router.get('/user', loginCheck, getUserProfile);
router.get('/company', loginCheck, getCompanyProfile);

router.patch(
  '/company/logo',
  loginCheck,
  multer_company_logo_upload().single('img'),
  changeCompanyLogo
);

module.exports = router;
