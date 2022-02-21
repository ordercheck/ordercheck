const express = require('express');
const uuid = require('uuid').v1;
const router = express.Router();
const { schedulePay, getPayment } = require('../../lib/payFunction');
const _f = require('../../lib/functions');
const db = require('../../model/db');
const { errorFunction } = require('../../lib/apiFunctions');

// 정기 결제 완료 후 다음달 결제 예약
router.post('/', async (req, res) => {
  try {
    const { imp_uid, merchant_uid, status } = req.body;
    const getResult = await getPayment(imp_uid);

    const doSchedule = async (pay_type_data) => {
      await db.pay.create({
        imp_uid,
        user_name: getResult.buyer_name,
        user_phone: getResult.buyer_tel,
        user_email: getResult.buyer_email,
        customer_uid: getResult.customer_uid,
      });

      let payDate;
      // if (pay_type_data == 'month') {
      //   const now = new Date();
      //   let afterMonth = new Date(now.setMonth(now.getMonth() + 1));
      //   payDate = afterMonth.getTime() / 1000;
      // }else{
      //   const now = new Date();
      //   let afterMonth = new Date(now.setMonth(now.getMonth() + 1));
      //   payDate = afterMonth.getTime() / 1000;

      // }

      const newMerchant_uid = uuid();

      await schedulePay(
        payDate,
        getResult.customer_uid,
        getResult.amount,
        getResult.buyer_name,
        getResult.buyer_tel,
        getResult.buyer_email,
        newMerchant_uid
      );

      await db.plan.update(
        { merchant_uid: newMerchant_uid },
        {
          where: { merchant_uid },
        }
      );
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

      if (getResult.pay_type == 'month') {
        await doSchedule('month');
      }

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
          where: { company_idx: findPlanResult.company_idx },
        });

        return res.send({ success: 200, message: '플랜 비활성화 성공' });
      } catch (err) {
        return res.send({ success: 400, message: err.message });
      }
    }
  } catch (err) {
    errorFunction(err);
    return res.send({ success: 500, message: err.message });
  }
});

module.exports = router;
