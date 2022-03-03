const express = require('express');
const router = express.Router();
const { delFile } = require('../../lib/aws/fileupload').ufile;
const db = require('../../model/db');
var AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: process.env.AWS_ACESSKEY_ID,
  secretAccessKey: process.env.AWS_ACESS_SECREY,
});
var s3 = new AWS.S3();

// router.post('/', (req, res) => {
//   var params = {
//     Bucket: 'ordercheck',
//     Delimiter: '/fileStore',
//   };

//   s3.listObjects(params, function (err, data) {
//     data.Contents.forEach((data) => {
//       // console.log(del);
//       if (data.Key.includes('fileStore')) {
//         const [, del] = data.Key.split('/');
//         if (del !== '') {
//           delFile(del, 'ordercheck/fileStore', (err, data) => {
//             if (err) {
//               console.log(err);
//             } else {
//               console.log(data);
//             }
//           });
//         }
//       }
//     });
//   });
// });

const axios = require('axios');
router.post('/', async (req, res) => {
  // for (let i = 1028; i <= 3000; i++) {
  //   try {
  //     const result = await db.customer.create({
  //       customer_name: i,
  //       customer_phoneNumber: i,
  //       address: i,
  //       detail_address: i,
  //       room_size: i,
  //       room_size_kind: i,
  //       active: i,
  //       searchingAddress: i,
  //       searchingPhoneNumber: i,
  //       company_idx: 18,
  //     });
  //     console.log(result);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }
});
module.exports = router;
