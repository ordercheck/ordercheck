const express = require('express');
const { generateRandomCode } = require('../../lib/functions');
const router = express.Router();
const { schedulePay, getPayment } = require('../../lib/payFunction');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');
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
        let payDay = moment().daysInMonth();

        const last = moment().add('1', 'M').daysInMonth();

        if (payDay > last) {
          payDay = last;
        }

        const setLastDate = moment().add('1', 'M').format(`YYYY-MM-${payDay}`);

        payDate = moment(setLastDate).unix();
      } else {
        const nextYear = moment().add('1', 'Y');
        payDate = moment(nextYear).unix();
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

      // 결제 예정 plan을 active 1
      const findActivePlanResult = await db.plan.findOne({
        where: { merchant_uid, active: 1 },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        raw: true,
      });
      // 무료체험 끝나고 결제 한 경우
      if (findActivePlanResult) {
        // 영수증 발행

        const findCompanyName = await db.company.findByPk(
          findActivePlanResult.idx,
          {
            attributes: ['company_name'],
          }
        );
        const findCardNumber = await db.card.findOne({
          where: { customer_uid: getResult.customer_uid },
          attributes: ['card_number'],
        });
        const receiptId = generateRandomCode(6);
        delete findActivePlanResult.idx;
        await db.receipt.create({
          ...findActivePlanResult,
          card_name: getResult.card_name,
          receiptId,
          card_number: findCardNumber.card_number,
          company_name: findCompanyName.company_name,
          receipt_kind: '구독',
        });

        // 새로운 결제 예약
        await db.plan.create({
          ...findActivePlanResult,
          merchant_uid: newMerchant_uid,
          active: 3,
        });

        // 이전 결제 예약은 제거
        await db.plan.destroy({ where: { merchant_uid, active: 3 } });
      } else {
        const findPlanCompany = await db.plan.findOne(
          { where: { merchant_uid } },
          { attributes: ['company_idx'] }
        );

        const beforePlanIdx = await db.plan.findOne(
          {
            where: { active: 1, company_idx: findPlanCompany.company_idx },
          },
          { attributes: ['idx'] }
        );

        // 이전 플랜 비활성화
        await db.plan.update(
          { active: 0 },
          {
            where: { idx: beforePlanIdx },
          }
        );
        // 결제 예약 활성화
        await db.plan.update(
          {
            active: 1,
          },
          { where: { merchant_uid, active: 3 } }
        );
      }

      // 새로운 결제 예약 등록
      const findPlanResult = await db.plan.findOne({
        where: { merchant_uid, active: 1 },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        raw: true,
      });

      // 영수증 발행

      const findCompanyName = await db.company.findByPk(findPlanResult.idx, {
        attributes: ['company_name'],
      });
      const findCardNumber = await db.card.findOne({
        where: { customer_uid: getResult.customer_uid },
        attributes: ['card_number'],
      });
      const receiptId = generateRandomCode(6);
      delete findPlanResult.idx;
      await db.receipt.create({
        ...findPlanResult,
        card_name: getResult.card_name,
        receiptId,
        card_number: findCardNumber.card_number,
        company_name: findCompanyName.company_name,
        receipt_kind: '구독',
      });

      // 플랜 다음 결제 예약
      await db.plan.create({
        ...findPlanResult,
        merchant_uid: newMerchant_uid,
        active: 3,
      });
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
