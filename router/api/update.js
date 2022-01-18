const express = require('express');
const router = express.Router();
const loginCheck = require('../../middleware/auth');
const { updateCompany } = require('../../controller/update');
const {
  resizeUpload,
  blobUpload,
  upload,
  pdfUpload,
} = require('../../lib/aws/fileupload').ufile;
// update Company
router.post('/company', loginCheck, updateCompany);
module.exports = router;
