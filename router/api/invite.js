const express = require('express');
const router = express.Router();
const loginCheck = require('../../middleware/auth');
const { updateCompany } = require('../../controller/invite');
const {
  resizeUpload,
  blobUpload,
  upload,
  pdfUpload,
} = require('../../lib/aws/fileupload').ufile;
// update Company
router.post('/email', loginCheck, updateCompany);
module.exports = router;
