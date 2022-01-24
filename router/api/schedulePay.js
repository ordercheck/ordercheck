const express = require('express');
const router = express.Router();
// 정기 결제 완료 후 다음달 결제 예약
router.post('/', (req, res) => {
  const { imp_uid, merchant_uid, status } = req.body;
  console.log('imp_uid', imp_uid);
  console.log(' merchant_uid', merchant_uid);
  console.log(' status', status);
  if (status == 'paid') {
    const changeToTime = new Date();
    const changeToUnix = changeToTime.getTime() / 1000;
    console.log(changeToUnix);
  }
});

module.exports = router;
