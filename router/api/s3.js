const express = require("express");
const router = express.Router();
const { delFile } = require("../../lib/aws/fileupload").ufile;
const db = require("../../model/db");
const { getPayment } = require("../../lib/payFunction");
var AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: process.env.AWS_ACESSKEY_ID,
  secretAccessKey: process.env.AWS_ACESS_SECREY,
});

var s3 = new AWS.S3();

router.post("/", async (req, res) => {
  const result = await getPayment("imps_064450984385");
  console.log(result);
  // var params = {
  //   Bucket: 'ordercheck',
  //   Delimiter: '/form2',
  // };

  // s3.listObjects(params, function (err, data) {
  //   data.Contents.forEach((data) => {
  //     if (data.Key.includes('form2')) {
  //       const [, del] = data.Key.split('/');

  //       if (del !== '') {
  //         delFile(del, 'ordercheck/form2', (err, data) => {
  //           if (err) {
  //             console.log(err);
  //           } else {
  //             console.log(data);
  //           }
  //         });
  //       }
  //     }
  //   });
  // });
});

module.exports = router;
