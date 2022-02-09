const express = require('express');
const router = express.Router();
const { delFile } = require('../../lib/aws/fileupload').ufile;
const { kakaoPush } = require('../../lib/functions');

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

router.post('/', (req, res) => {
  kakaoPush('01067196919');
});
module.exports = router;
