const express = require('express');
const router = express.Router();
const {
  getUserList,
  showRootFoldersAndFiles,
  addFolder,
  addFile,
  showFiles,
  deleteFile,
  changeFileTitle,
  searchFileStore,
  showDetailFileFolder,
} = require('../../controller/fileStore');

const { multer_file_store_upload } = require('../../lib/aws/aws');
const loginCheck = require('../../middleware/auth');
router.get('/customer/list', loginCheck, getUserList);
router.get(
  '/folder/:customerFile_idx/:sort_field/:sort',
  loginCheck,
  showRootFoldersAndFiles
);
router.post('/folder/:customerFile_idx', loginCheck, addFolder);
router.post(
  '/upload/:customerFile_idx',
  loginCheck,
  multer_file_store_upload().single('file'),
  addFile
);
router.patch('/update/title/:customerFile_idx', loginCheck, changeFileTitle);
router.post('/:customerFile_idx', loginCheck, showFiles);
router.delete(
  '/file/:customerFile_idx/:isfolder/:uuid',
  loginCheck,
  deleteFile
);
router.get(
  '/detail/:customerFile_idx/:uuid/:isFolder',
  loginCheck,
  showDetailFileFolder
);
router.get('/search', loginCheck, searchFileStore);

module.exports = router;
