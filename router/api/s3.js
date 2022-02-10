const express = require('express');
const router = express.Router();
const { delFile } = require('../../lib/aws/fileupload').ufile;
const db = require('../../model/db');
// var AWS = require('aws-sdk');
// AWS.config.update({
//   accessKeyId: process.env.AWS_ACESSKEY_ID,
//   secretAccessKey: process.env.AWS_ACESS_SECREY,
// });
// var s3 = new AWS.S3();

// router.post('/', (req, res) => {
//   var params = {
//     Bucket: 'ordercheck',
//     Delimiter: '/form2',
//   };

//   s3.listObjects(params, function (err, data) {
//     data.Contents.forEach((data) => {
//       // console.log(del);
//       if (data.Key.includes('form2')) {
//         const [, del] = data.Key.split('/');
//         if (del !== '') {
//           delFile(del, 'ordercheck/form2', (err, data) => {
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

//   // delFile('4V4QI@0� t%.pdf', (err, data) => {
//   //   if (err) {
//   //     console.log(err);
//   //   } else {
//   //     console.log(data);
//   //   }
//   // });
//   // delFile('2R07R@0� t% �.pdf', (err, data) => {
//   //   if (err) {
//   //     console.log(err);
//   //   } else {
//   //     console.log(data);
//   //   }
//   // });
// });

const axios = require('axios');
router.post('/', async (req, res) => {
  const message = `
   [오더킹]
김오더 고객님 간편상담 접수가
완료되었습니다.
감사합니다.

접수 내용 확인:
http://my.ordercheck.io/FEQF
`;
  const user_phone = '01030472952';
  let result = await axios({
    url: '/api/send/sms',
    method: 'post', // POST method
    headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
    data: { user_phone, message },
  });

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
