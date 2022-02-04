const express = require('express');
const router = express.Router();
const { schedulePay, getPayment } = require('../../lib/payFunction');
const _f = require('../../lib/functions');
const db = require('../../model/db');

// 정기 결제 완료 후 다음달 결제 예약
router.post('/', async (req, res) => {
  try {
    const { imp_uid, merchant_uid, status } = req.body;
    const getResult = await getPayment(imp_uid);
    if (
      getResult.amount == 1000 ||
      status == 'cancelled' ||
      !getResult.buyer_email
    ) {
      return res.send({ success: 400 });
    }
    console.log('가져온 결과', getResult);
    // 계속 스케줄을 할 때
    if (status == 'paid') {
      await db.pay.create({
        imp_uid,
        user_name: getResult.buyer_name,
        user_phone: getResult.buyer_tel,
        user_email: getResult.buyer_email,
        customer_uid: getResult.customer_uid,
      });
      const now = new Date();
      let afterMonth = new Date(now.setMonth(now.getMonth() + 1));

      afterMonth = afterMonth.getTime() / 1000;

      const newMerchant_uid = _f.random5();

      const scheduleResult = await schedulePay(
        afterMonth,
        getResult.customer_uid,
        getResult.amount,
        getResult.buyer_name,
        getResult.buyer_tel,
        getResult.buyer_email,
        newMerchant_uid,
        getResult.user_idx,
        getResult.company_idx
      );

      const result = await db.plan.update(
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
        await db.plan.update(
          {
            plan: 'FREE',
            whiteLabelChecked: true,
            start_plan: null,
            free_plan: null,
            expire_plan: null,
            result_price: 0,
            chatChecked: false,
            analysticChecked: false,
          },
          { where: { merchant_uid } }
        );
        await db.userCompany.destroy({
          where: { company_idx: getResult.company_idx },
        });
        await db.userCompany.create({
          user_idx: getResult.user_idx,
          company_idx: getResult.company_idx,
        });
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
