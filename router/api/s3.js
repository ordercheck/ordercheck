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
  delFile('9QMOU@0� t%1.pdf', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
  delFile('FKSAF@0� t%.pdf', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
  delFile('IK4E1@0� t%.pdf', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
  delFile('W9Q3F@0� t%.pdf', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
  delFile('SQDI6@0� t%.pdf', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
  delFile('9ML44��� 7� |� 3.1.xlsx', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
  delFile('8U5C5t�l��.hwp', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
  delFile('8L0LT��� 7� |� 3.1.xlsx', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
});

module.exports = router;
