const express = require("express");
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
  getAllFolders,
  findUserFolders,
  findIncludeFolders,
  moveFile,
} = require("../../controller/fileStore");
const {
  checkFileLimit,
  checkOverFile,
} = require("../../middleware/checkLimit");
const { multer_file_store_upload } = require("../../lib/aws/aws");
const { loginCheck } = require("../../middleware/auth");
router.get("/customer/list", loginCheck, getUserList);
router.get(
  "/folder/:customerFile_idx/:sort_field/:sort",
  loginCheck,
  showRootFoldersAndFiles
);
router.post("/down/folder/:customerFile_idx", loginCheck, getAllFolders);
router.post("/folder/:customerFile_idx", loginCheck, addFolder);
router.post(
  "/upload/:customerFile_idx",
  loginCheck,
  multer_file_store_upload().array("file"),
  addFile,
  checkFileLimit
);
router.patch("/update/title/:customerFile_idx", loginCheck, changeFileTitle);
router.post("/:customerFile_idx/:sort_field/:sort", loginCheck, showFiles);
router.delete(
  "/file/:customerFile_idx/:isfolder/:uuid",
  loginCheck,
  deleteFile
);
router.get(
  "/detail/:customerFile_idx/:uuid/:isFolder",
  loginCheck,
  showDetailFileFolder
);
router.get("/search", loginCheck, searchFileStore);
router.get("/folders/root/:customerFile_idx", loginCheck, findUserFolders);
router.get("/folders/:uuid", loginCheck, findIncludeFolders);
router.get(
  "/folders/move/:customerFile_idx/:fileUuid/:folderUuid",
  loginCheck,
  moveFile
);

module.exports = router;
