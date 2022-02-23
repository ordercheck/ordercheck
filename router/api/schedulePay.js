const express = require('express');
const { generateRandomCode } = require('../../lib/functions');
const router = express.Router();
const { schedulePay, getPayment } = require('../../lib/payFunction');
const _f = require('../../lib/functions');
const db = require('../../model/db');

// 정기 결제 완료 후 다음달 결제 예약
router.post('/', async (req, res, next) => {
  try {
    const { imp_uid, merchant_uid, status } = req.body;
    const getResult = await getPayment(imp_uid);

    const doSchedule = async (pay_type_data) => {
      let payDate;
      if (pay_type_data == 'month') {
        const now = new Date();
        let afterMonth = new Date(now.setMonth(now.getMonth() + 1));
        payDate = afterMonth.getTime() / 1000;
      } else {
        const now = new Date();
        let afterMonth = new Date(now.setFullYear(now.getFullYear() + 1));
        payDate = afterMonth.getTime() / 1000;
      }

      const newMerchant_uid = generateRandomCode(6);

      await schedulePay(
        payDate,
        getResult.customer_uid,
        getResult.amount,
        getResult.buyer_name,
        getResult.buyer_tel,
        getResult.buyer_email,
        newMerchant_uid
      );

      const findPlanResult = await db.plan.findOne({
        where: { merchant_uid },
        attributes: { exclude: ['idx', 'createdAt', 'updatedAt'] },
        raw: true,
      });

      await db.plan.update(
        { active: 0 },
        {
          where: { merchant_uid },
        }
      );

      findPlanResult.merchant_uid = newMerchant_uid;

      await db.plan.create(findPlanResult);
    };

    if (
      getResult.amount == 1000 ||
      status == 'cancelled' ||
      !getResult.buyer_email
    ) {
      return res.send({ success: 400 });
    }

    // 계속 스케줄을 할 때
    if (status == 'paid') {
      // payType 체크 (month, year)

      getResult.pay_type == 'month'
        ? await doSchedule('month')
        : await doSchedule('year');

      return res.send({ success: 200 });
    }
    // 정기결제 실패했을 때
    if (status == 'failed') {
      try {
        const findPlanResult = await db.plan.findOne(
          { where: { merchant_uid } },
          { attributes: ['company_idx'] }
        );
        await db.plan.update(
          { active: 0 },
          {
            where: { merchant_uid },
          }
        );

        await db.userCompany.destroy({
          where: { company_idx: findPlanResult.company_idx },
        });

        return res.send({ success: 200, message: '플랜 비활성화 성공' });
      } catch (err) {
        return res.send({ success: 400, message: err.message });
      }
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
