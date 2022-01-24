const express = require('express');
const router = express.Router();
const { schedulePay, getPayment } = require('../../lib/payFunction');
const db = require('../../model/db');
// 정기 결제 완료 후 다음달 결제 예약
router.post('/', async (req, res) => {
  console.log(req.body);
  const { imp_uid, merchant_uid, status } = req.body;
  const getResult = await getPayment(imp_uid);
  if (getResult.amount == 100) {
    return res.send({ success: 400 });
  }
  if (status == 'paid') {
    const now = new Date();
    const afterMonth = new Date(now.setMonth(now.getMonth() + 1));

    const { user_name, user_email, user_phone } = await db.pay.findOne({
      where: { imp_uid },
      attributes: ['user_name', 'user_phone', 'user_email'],
    });

    await schedulePay(
      afterMonth,
      getResult.customer_uid,
      getResult.amount,
      user_name,
      user_phone,
      user_email
    );
  }
});

module.exports = router;
