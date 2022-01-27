const express = require('express');
const router = express.Router();
const { delFile } = require('../../lib/aws/fileupload').ufile;
router.post('/', (req, res) => {
  delFile('SQZ63@0� t%1.pdf', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
  delFile('4V4QI@0� t%.pdf', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
  delFile('2R07R@0� t% �.pdf', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
});

module.exports = router;
