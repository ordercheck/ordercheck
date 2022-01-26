const express = require('express');
const router = express.Router();
const { delFile } = require('../../lib/aws/fileupload').ufile;
router.post('/', (req, res) => {
  delFile('75WF3@0� t% �.pdf', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
});

module.exports = router;
