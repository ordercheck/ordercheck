const express = require('express');
const router = express.Router();
const { delFile } = require('../../lib/aws/fileupload').ufile;
router.post('/', (req, res) => {
  delFile('I1NQM��� 7� |� 3.1.xlsx', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
});

module.exports = router;
