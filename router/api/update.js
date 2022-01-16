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
// try {
//   let pdf_data = req.body;
//   let file = pdf_data.bi;
//   let query = {
//     file: file,
//     fileName: pdf_data.pdf_name,
//     fileType: pdf_data.pdf_type,
//   };
//   pdfUpload(query, async (err, url) => {
//     console.log(err);
//     console.log(url);
//     if (err) {
//       res.send({ success: 400, message: err });
//     } else {
//       res.send({ success: 200, url });
//     }
//   });
// } catch (err) {
//   console.log(err);
// }
// try {
//   let image_data = req.body;
//   let file = image_data.bi;
//   let query = {
//     file: file,
//     fileName: image_data.image_name,
//     fileType: image_data.image_type,
//   };
//   blobUpload(query, async (err, url) => {
//     console.log(err);
//     console.log(url);
//     if (err) {
//       res.send({ success: 400, message: err });
//     } else {
//       res.send({ success: 200, url });
//     }
//   });
// } catch (err) {
//   console.log(err);
// }
