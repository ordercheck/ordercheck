const express = require('express');
const router = express.Router();
const { schedulePay, getPayment } = require('../../lib/payFunction');
const db = require('../../model/db');
// 정기 결제 완료 후 다음달 결제 예약
router.post('/', async (req, res) => {
  console.log(req.body);
  try {
    const { imp_uid, merchant_uid, status } = req.body;
    const getResult = await getPayment(imp_uid);

    if (getResult.amount == 100 || status == 'cancelled') {
      return res.send({ success: 400 });
    }
    // 계속 스케줄을 할 때
    if (status == 'paid') {
      // const now = new Date();
      // const afterMonth = new Date(now.setMonth(now.getMonth() + 1));
      const now = new Date();
      let afterMonth = new Date(now.setSeconds(now.getSeconds() + 20));
      afterMonth = afterMonth.getTime() / 1000;

      const {
        user_name,
        user_email,
        user_phone,
        customer_uid,
      } = await db.pay.findOne({
        where: { imp_uid },
        attributes: ['user_name', 'user_phone', 'user_email', 'customer_uid'],
      });
      const newMerchant_uid = _f.random5();
      console.log('hi');
      const scheduleResult = await schedulePay(
        afterMonth,
        customer_uid,
        getResult.amount,
        user_name,
        user_phone,
        user_email,
        newMerchant_uid
      );
      console.log(scheduleResult);
      const result = await db.planExpect.update(
        { merchant_uid: newMerchant_uid },
        {
          where: { merchant_uid },
        }
      );
      console.log('업데이트 결과', result);

      return res.send({ success: 200 });
    }
    // 정기결제 실패했을 때
    if (status == 'failed') {
      try {
        const expectResult = await db.planExpect.findOne({
          where: { merchant_uid },
        });
        await db.plan.update(
          { active: 0 },
          { where: { idx: expectResult.idx } }
        );
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
