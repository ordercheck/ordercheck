const express = require("express");
const { generateRandomCode } = require("../../lib/functions");
const router = express.Router();
const { createFreePlan } = require("../../lib/apiFunctions");
const { schedulePay, getPayment } = require("../../lib/payFunction");
const { Alarm } = require("../../lib/classes/AlarmClass");

const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");

const db = require("../../model/db");

// 정기 결제 완료 후 다음달 결제 예약
router.post("/", async (req, res, next) => {
  try {
    const { imp_uid, merchant_uid, status } = req.body;
    const getResult = await getPayment(imp_uid);

    if (
      getResult.amount == 1000 ||
      getResult.name == "플랜 즉시 결제" ||
      status == "cancelled" ||
      !getResult.buyer_email
    ) {
      return res.send({ success: 400 });
    }

    // 다음 결제 예약
    if (status == "paid") {
      const alarm = new Alarm({});

      const checkPlan = await db.plan.findOne({
        where: { merchant_uid, active: 3 },
        raw: true,
      });

      // 결제 한번 실패한 사태라면 팀원들 로그인 제한 풀어주기
      if (checkPlan.failed_count !== 0) {
        const findCompanyMembers = await db.userCompany.findAll({
          where: {
            company_idx: checkPlan.company_idx,
            active: true,
            standBy: false,
          },
          raw: true,
        });
        findCompanyMembers.forEach((data) => {
          db.user.update(
            { login_access: true },
            { where: { idx: data.user_idx } }
          );
        });
      }
      console.log("재결제 등록 시작");

      const expireDate = checkPlan.expire_plan.replace(/\./gi, "-");
      const hour = moment().format("HH");

      const startDate = moment(expireDate)
        .add("1", "day")
        .format(`YYYY-MM-DD ${hour}:00`);

      const startDateUnix = moment(startDate).unix();

      const newMerchant_uid = generateRandomCode();

      // const now = new Date();
      // let changeToTime = new Date(now.setSeconds(now.getSeconds() + 10));
      // startDateUnix = changeToTime.getTime() / 1000;

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

      // 무료체험 이용중인지 체크
      const findActivePlanResult = await db.plan.findOne({
        where: { merchant_uid, active: 1 },
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "free_period_start",
            "free_period_expire",
          ],
        },
        raw: true,
      });
      const findPlanAndCompany = await db.plan.findOne({
        where: { merchant_uid },
        include: [
          {
            model: db.company,
          },
        ],
      });
      // 무료체험 끝나고 결제 한 경우
      if (findActivePlanResult) {
        // 영수증 발행
        console.log("무료체험 끝나고 결제");
        const findCardNumber = await db.card.findOne({
          where: { customer_uid: getResult.customer_uid },
          attributes: ["card_number"],
        });

        const receiptId = generateRandomCode();
        // 사용하고 있떤 플랜 무료체험 종료
        await db.plan.update(
          {
            free_plan: null,
            free_period_start: null,
            free_period_expire: null,
          },
          { where: { idx: findActivePlanResult.idx } }
        );
        delete findActivePlanResult.idx;

        await db.receipt.create({
          ...findActivePlanResult,
          card_name: getResult.card_name,
          receiptId,
          receipt_category: 1,
          card_number: findCardNumber.card_number,
          company_name: findPlanAndCompany.company.company_name,
          receipt_kind: "구독",
        });

        // 새로운 expireDate 설정 (연결제 or 달결제)
        let nextExpireDate;
        if (checkPlan.pay_type == "month") {
          // 다음달 마지막 날
          let nextMonthLast = moment(startDate).add("1", "M").daysInMonth();

          // 결제 당일 마지막 날
          let nowDate = moment(startDate).format("DD");

          if (parseInt(nowDate) > nextMonthLast) {
            nextExpireDate = moment(startDate)
              .add("1", "M")
              .format(`YYYY.MM.${nextMonthLast}`);
          } else {
            nextExpireDate = moment(startDate)
              .add("1", "M")
              .subtract("1", "days")
              .format(`YYYY.MM.DD`);
          }
        } else {
          nextExpireDate = moment(startDate)
            .add("1", "Y")
            .subtract("1", "days")
            .format(`YYYY.MM.DD`);
        }

        findActivePlanResult.start_plan =
          moment(startDate).format("YYYY.MM.DD");

        findActivePlanResult.expire_plan = nextExpireDate;
        findActivePlanResult.free_plan = null;
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
        const month = moment().format("MM");
        const money = getResult.amount.toLocaleString();
        const message = `${month}월 구독료 ${money}원이 결제되었습니다. 오더체크를 이용해주셔서 감사합니다.`;

        const createResult = await alarm.createAlarm({
          message,
          user_idx: findPlanAndCompany.company.huidx,
          alarm_type: 15,
        });

        // 알람 보내기
        const io = req.app.get("io");
        const sendAlarm = new Alarm(createResult);
        io.to(findPlanAndCompany.company.huidx).emit(
          "addAlarm",
          sendAlarm.alarmData.dataValues
        );
        return;
      } else {
        const beforePlanIdx = await db.plan.findOne(
          {
            where: { active: 1, company_idx: findPlanAndCompany.company.idx },
          },
          { attributes: ["idx"] }
        );

        // 이전 플랜 비활성화
        await db.plan.update(
          { active: 0 },
          {
            where: { idx: beforePlanIdx.idx },
          }
        );
        // 이전 결제 예약 활성화
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
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
        raw: true,
      });

      const findCardNumber = await db.card.findOne({
        where: { customer_uid: getResult.customer_uid },
        attributes: ["card_number"],
      });
      const receiptId = generateRandomCode();
      delete findPlanResult.idx;
      await db.receipt.create({
        ...findPlanResult,
        card_name: getResult.card_name,
        receiptId,
        receipt_category: 1,
        card_number: findCardNumber.card_number,
        company_name: findPlanAndCompany.company.company_name,
        receipt_kind: "구독",
      });

      // 새로운 expireDate 설정 (연결제 or 달결제)
      let nextExpireDate;
      if (checkPlan.pay_type == "month") {
        // 다음달 마지막 날
        let nextMonthLast = moment(startDate).add("1", "M").daysInMonth();
        // 결제 당일 마지막 날

        let nowDate = moment(startDate).format("DD");

        if (parseInt(nowDate) > nextMonthLast) {
          nextExpireDate = moment(startDate)
            .add("1", "M")
            .format(`YYYY.MM.${nextMonthLast}`);
        } else {
          nextExpireDate = moment(startDate)
            .add("1", "M")
            .subtract("1", "days")
            .format(`YYYY.MM.DD`);
        }
      } else {
        nextExpireDate = moment(startDate)
          .add("1", "Y")
          .subtract("1", "days")
          .format(`YYYY.MM.DD`);
      }

      findPlanResult.start_plan = moment(startDate).format("YYYY.MM.DD");

      findPlanResult.expire_plan = nextExpireDate;

      // 플랜 다음 결제 예약
      await db.plan.create({
        ...findPlanResult,
        merchant_uid: newMerchant_uid,
        active: 3,
      });
      await db.plan.update(
        { free_plan: null },
        { where: { merchant_uid: newMerchant_uid, active: 3 } }
      );
      res.send({ success: 200 });

      //알람 생성
      const month = moment().format("MM");
      const money = getResult.amount.toLocaleString();
      const message = `${month}월 구독료 ${money}원이 결제되었습니다. 오더체크를 이용해주셔서 감사합니다.`;

      const createResult = await alarm.createAlarm({
        message,
        user_idx: findPlanAndCompany.company.huidx,
        alarm_type: 15,
      });

      // 알람 보내기
      const io = req.app.get("io");
      const sendAlarm = new Alarm(createResult);
      io.to(findPlanAndCompany.company.huidx).emit(
        "addAlarm",
        sendAlarm.alarmData.dataValues
      );
      return;
    }
    // 정기결제 실패했을 때
    if (status == "failed") {
      console.log("실패");
      const alarm = new Alarm({});
      const now = moment().format("YYYY.MM.DD");
      const findPlanCompany = await db.plan.findOne({
        where: { merchant_uid, active: 3 },
      });
      // 4번 싪패 했는지 체크
      if (findPlanCompany.failed_count == 4) {
        const nowPlan = await db.plan.findOne({
          where: { active: 1, company_idx: findPlanCompany.company_idx },
        });
        // 현재 플랜 active 0으로 변경
        await db.plan.update({ active: 0 }, { where: { idx: nowPlan.idx } });
        await createFreePlan(nowPlan.company_idx);
        return;
      }
      const findCompany = await db.company.findByPk(
        findPlanCompany.company_idx
      );

      //알람 생성
      const message = `플랜 정기 결제가 실패하였습니다. 등록된 카드를 확인해주세요.`;

      const createResult = await alarm.createAlarm({
        message,
        user_idx: findCompany.huidx,
        alarm_type: 23,
      });

      const nextRepayDate = moment().add("7", "d").unix();
      const newMerchant_uid = generateRandomCode();

      // 일주일 후 재결제 등록
      await schedulePay(
        nextRepayDate,
        getResult.customer_uid,
        getResult.amount,
        getResult.buyer_name,
        getResult.buyer_tel,
        getResult.buyer_email,
        newMerchant_uid
      );

      const startDate = moment(findPlanCompany.start_plan.replace(/\./g, "-"))
        .add("7", "d")
        .format("YYYY.MM.DD");
      const expireDate = moment(findPlanCompany.expire_plan.replace(/\./g, "-"))
        .add("7", "d")
        .format("YYYY.MM.DD");
      const repayDate = moment().add("7", "d").format("YYYY.MM.DD");

      db.plan.update(
        {
          merchant_uid: newMerchant_uid,
          failed_date: now,
          start_plan: startDate,
          expire_plan: expireDate,
          next_repay_date: repayDate,
          failed_count: findPlanCompany.failed_count + 1,
        },
        { where: { idx: findPlanCompany.idx } }
      );

      const findCompanyMembers = await db.userCompany.findAll({
        where: { company_idx: findCompany.idx, active: true, standBy: false },
        raw: true,
      });

      findCompanyMembers.forEach((data) => {
        if (data.user_idx !== findCompany.huidx) {
          db.user.update(
            { login_access: false },
            { where: { idx: data.user_idx } }
          );
        }
      });

      // 알람 보내기
      const io = req.app.get("io");
      const sendAlarm = new Alarm(createResult);
      io.to(findCompany.huidx).emit("addAlarm", sendAlarm.alarmData.dataValues);
      return;
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
