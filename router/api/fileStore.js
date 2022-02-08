const express = require('express');
const router = express.Router();
const {
  getUserList,
  getFolderPath,
  addFolder,
  addFile,
  showFiles,
} = require('../../controller/fileStore');
const { multer_file_store_upload } = require('../../lib/aws/aws');
const loginCheck = require('../../middleware/auth');
router.get('/customer/list', loginCheck, getUserList);
router.get('/folder/:customerFile_idx', loginCheck, getFolderPath);
router.post('/folder/:customerFile_idx', loginCheck, addFolder);
router.post(
  '/upload/:customerFile_idx',
  loginCheck,
  multer_file_store_upload().single('file'),
  addFile
);

router.post('/:customerFile_idx', loginCheck, showFiles);

module.exports = router;
