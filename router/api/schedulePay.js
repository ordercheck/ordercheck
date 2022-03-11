const express = require('express');
const { generateRandomCode } = require('../../lib/functions');
const router = express.Router();
const schedule = require('node-schedule');
const { schedulePay, getPayment } = require('../../lib/payFunction');
const { Alarm } = require('../../lib/class');
const { createAlarm } = require('../../lib/apiFunctions');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');

const db = require('../../model/db');

// 정기 결제 완료 후 다음달 결제 예약
router.post('/', async (req, res, next) => {
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

    // 다음 결제 예약
    if (status == 'paid') {
      const checkPlan = await db.plan.findOne({
        where: { merchant_uid, active: 3 },
        attributes: ['pay_type', 'expire_plan'],
        raw: true,
      });

      const expireDate = checkPlan.expire_plan.replace(/\./gi, '-');
      const hour = moment().format('HH');

      const startDate = moment(expireDate)
        .add('1', 'day')
        .format(`YYYY-MM-DD ${hour}:00`);

      const startDateUnix = moment(startDate).unix();

      const newMerchant_uid = generateRandomCode(6);
      // 기존의 expireDate를 이용하여 다음 스케쥴 등록
      await schedulePay(
        startDateUnix,
        getResult.customer_uid,
        getResult.amount,
        getResult.buyer_name,
        getResult.buyer_tel,
        getResult.buyer_email,
        newMerchant_uid
      );

      // free_plan 이용중인지 체크
      const findActivePlanResult = await db.plan.findOne({
        where: { merchant_uid, active: 1 },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        raw: true,
      });

      // 무료체험 끝나고 결제 한 경우
      if (findActivePlanResult) {
        // 영수증 발행
        const findCompanyName = await db.plan.findOne({
          where: { merchant_uid },
          include: [
            {
              model: db.company,
              attributes: ['company_name', 'huidx'],
            },
          ],
        });

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
          company_name: findCompanyName.company.company_name,
          receipt_kind: '구독',
        });

        // 새로운 expireDate 설정 (연결제 or 달결제)
        let nextExpireDate;
        if (checkPlan.pay_type == 'month') {
          // 다음달 마지막 날
          let nextMonthLast = moment(startDate).add('1', 'M').daysInMonth();
          // 결제 당일 마지막 날
          let nowDate = moment(startDate).format('DD');

          if (parseInt(nowDate) > nextMonthLast) {
            nextMonthLast -= 1;
            nextExpireDate = moment(startDate)
              .add('1', 'M')
              .format(`YYYY.MM.${nextMonthLast}`);
          } else {
            nowDate -= 1;
            nextExpireDate = moment(startDate)
              .add('1', 'M')
              .format(`YYYY.MM.${nowDate}`);
          }
        } else {
          nextExpireDate = moment(startDate).add('1', 'Y').format('YYYY.MM.DD');
        }

        findActivePlanResult.start_plan =
          moment(startDate).format('YYYY.MM.DD');

        findActivePlanResult.expire_plan = nextExpireDate;

        // 새로운 결제 예약
        await db.plan.create({
          ...findActivePlanResult,
          merchant_uid: newMerchant_uid,
          active: 3,
        });

        // 이전 결제 예약은 제거
        await db.plan.destroy({ where: { merchant_uid, active: 3 } });
        res.send({ success: 200 });

        //알람 생성
        const month = moment().format('DD');
        const money = getResult.amount.toLocaleString();
        const message = `${month}월 구독료 ${money}원이 결제되었습니다. 오더체크를 이용해주셔서 감사합니다.`;

        const createResult = await createAlarm({
          message,
          user_idx: findCompanyName.company.huidx,
          alarm_type: 15,
        });

        // 알람 보내기
        const io = req.app.get('io');
        const alarm = new Alarm(createResult);
        io.to(findCompanyName.company.huidx).emit('addAlarm', alarm);
        return;
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
      const findCompanyName = await db.company.findByPk(
        findPlanResult.company_idx,
        {
          attributes: ['company_name', 'huidx'],
        }
      );

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

      // 새로운 expireDate 설정 (연결제 or 달결제)
      let nextExpireDate;
      if (checkPlan.pay_type == 'month') {
        // 다음달 마지막 날
        let nextMonthLast = moment(startDate).add('1', 'M').daysInMonth();
        // 결제 당일 마지막 날

        let nowDate = moment(startDate).format('DD');

        if (parseInt(nowDate) > nextMonthLast) {
          nextMonthLast -= 1;
          nextExpireDate = moment(startDate)
            .add('1', 'M')
            .format(`YYYY.MM.${nextMonthLast}`);
        } else {
          monthLast -= 1;
          nextExpireDate = moment(startDate)
            .add('1', 'M')
            .format(`YYYY.MM.${monthLast}`);
        }
      } else {
        nextExpireDate = moment(startDate).add('1', 'Y').format('YYYY.MM.DD');
      }

      findActivePlanResult.start_plan = moment(startDate).format('YYYY.MM.DD');

      findActivePlanResult.expire_plan = nextExpireDate;

      // 플랜 다음 결제 예약
      await db.plan.create({
        ...findPlanResult,
        merchant_uid: newMerchant_uid,
        active: 3,
      });
      res.send({ success: 200 });

      //알람 생성
      const month = moment().format('MM');
      const money = getResult.amount.toLocaleString();
      const message = `${month}월 구독료 ${money}원이 결제되었습니다. 오더체크를 이용해주셔서 감사합니다.`;

      const createResult = await createAlarm({
        message,
        user_idx: findCompanyName.huidx,
        alarm_type: 15,
      });

      // 알람 보내기
      const io = req.app.get('io');
      const alarm = new Alarm(createResult);
      io.to(findCompanyName.huidx).emit('addAlarm', alarm);
      return;
    }
    // 정기결제 실패했을 때
    if (status == 'failed') {
      const findPlanCompany = await db.plan.findOne(
        { where: { merchant_uid } },
        { attributes: ['company_idx'] }
      );

      const findCompany = await db.company.findByPk(
        findPlanCompany.company_idx,
        { attributes: ['huidx'] }
      );

      //알람 생성
      const day = moment().add('1', 'day').format(' YY/MM/DD');

      const message = `결제 실패로 ${day} 부터 이용이 제한됩니다. `;

      const createResult = await createAlarm({
        message,
        user_idx: findCompany.huidx,
        alarm_type: 9,
      });

      // 알람 보내기
      const io = req.app.get('io');
      const alarm = new Alarm(createResult);
      io.to(findCompany.huidx).emit('addAlarm', alarm);
      const cancelldDate = '0 0 1 * * *';
      const cancelPay = schedule.scheduleJob(cancelldDate, async function () {
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

          await db.userCompany.update(
            {
              active: false,
            },
            {
              where: {
                company_idx: findPlanResult.company_idx,
                standBy: false,
              },
            }
          );
          cancelPay.cancel();
          return;
        } catch (err) {
          return res.send({ success: 400, message: err.message });
        }
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
