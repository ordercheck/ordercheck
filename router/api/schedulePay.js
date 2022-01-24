const express = require('express');
const router = express.Router();
const { schedulePay, getPayment } = require('../../lib/payFunction');
const db = require('../../model/db');
// 정기 결제 완료 후 다음달 결제 예약
router.post('/', async (req, res) => {
  console.log(req.body);
  try {
    const { imp_uid, status } = req.body;
    const getResult = await getPayment(imp_uid);

    if (getResult.amount == 100 || status == 'cancelled') {
      return res.send({ success: 400 });
    }
    if (status == 'paid') {
      const now = new Date();
      const afterMonth = new Date(now.setMonth(now.getMonth() + 1));
      const {
        user_name,
        user_email,
        user_phone,
        customer_uid,
      } = await db.pay.findOne({
        where: { imp_uid },
        attributes: ['user_name', 'user_phone', 'user_email', 'customer_uid'],
      });

      await schedulePay(
        afterMonth,
        customer_uid,
        getResult.customer_uid,
        getResult.amount,
        user_name,
        user_phone,
        user_email
      );
      return res.send({ success: 200 });
    }
    if (status == 'failed') {
      try {
        await db.plan.update({ active: 0 }, { where: { imp_uid } });
        return res.send({ success: 200, message: '플랜 비활성화 성공' });
      } catch (err) {
        return res.send({ success: 400, message: err.message });
      }
    }
  } catch (err) {
    return res.send({ success: 500, message: err.message });
  }
});

module.exports = router;
