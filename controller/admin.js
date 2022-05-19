const db = require("../model/db");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
const { Op } = require("sequelize");
const { generateRandomCode } = require("../lib/functions");
const { payNow, cancelSchedule, schedulePay } = require("../lib/payFunction");
const { createPlanData, setPlanDate } = require("../lib/apiFunctions");
module.exports = {
  getInfo: async (req, res, next) => {
    const now = moment();
    const startDate = moment("2022-04-11");

    const registUser = await db.user.count({
      where: {
        createdAt: { [Op.between]: [startDate, now] },
      },
    });

    const registCompany = await db.company.count({
      where: {
        createdAt: { [Op.between]: [startDate, now] },
      },
    });

    const registRegion = await db.user.count({
      where: {
        createdAt: { [Op.between]: [startDate, now] },
      },
      attributes: ["regist_region"],
      group: ["regist_region"],
    });

    return res.send({ success: 200, registUser, registCompany, registRegion });
  },
  changePlan: async (req, res, next) => {
    const { planIdx, plan, whiteLabelChecked, chatChecked, analysticChecked } =
      req.body;
    const [nextPlan, payType] = plan.split(":");

    const toChangePlan = await db.planInfo.findOne({
      where: { plan: nextPlan },
    });

    const totalInfo = await db.plan.findByPk(planIdx, {
      include: [
        {
          model: db.company,
        },
      ],
    });
    const company_idx = totalInfo.company_idx;
    const user_idx = totalInfo.company.huidx;
    const plan_data = await createPlanData(
      toChangePlan,
      payType,
      whiteLabelChecked,
      chatChecked,
      analysticChecked
    );
    plan_data.company_idx = company_idx;
    // 트랜잭션 시작
    const t = await db.sequelize.transaction();

    // 무료체험 사용여부 체크
    const findCompany = await db.company.findByPk(company_idx);
    const usedFreePlan = !findCompany.used_free_period ? false : true;
    // 무조건 가입하는 거니까 무료체험 사용여부 변경
    db.company.update(
      { used_free_period: true },
      { where: { idx: company_idx }, transaction: t }
    );
    try {
      // 유저정보 찾기
      const user_data = await db.user.findByPk(user_idx);

      // 카드 등록되어 있는지 체크
      const card_data = await db.card.findOne({
        where: { user_idx, main: true, active: true },
      });

      if (!card_data) {
        await t.rollback();
        return res.send({
          success: 400,
          message: "카드 등록이 되어있지 않습니다.",
        });
      }

      // 현재 플랜 체크
      const nowPlan = await db.plan.findOne({
        where: { company_idx, active: 1 },
      });
      // 결제 예약 플랜 찾기
      const scheduledPlan = await db.plan.findOne({
        where: { company_idx, active: 3 },
      });
      // 현재 무료체험중인지 체크
      const usingFree = !nowPlan.free_plan ? false : true;
      let nextExpireDate;
      if (payType == "month") {
        if (scheduledPlan) {
          const startPlan = scheduledPlan.start_plan.replace(/\./gi, "-");
          nextExpireDate = moment(startPlan)
            .add("1", "M")
            .subtract("1", "days")
            .format("YYYY.MM.DD");
        }
      } else {
        if (scheduledPlan) {
          const startPlan = scheduledPlan.start_plan.replace(/\./gi, "-");
          nextExpireDate = moment(startPlan)
            .add("1", "Y")
            .subtract("1", "days")
            .format("YYYY.MM.DD");
        }
      }

      const nextMerchant_uid = generateRandomCode();
      // 프리플랜에서 요금제 가입 할 때
      if (nowPlan.plan == "프리") {
        console.log("프리 플랜에서 요금제 가입 할 때");
        // 무료체험 기간일 때
        if (usingFree) {
          await db.plan.destroy({
            where: { idx: scheduledPlan.idx },
            transaction: t,
          });
          plan_data.start_plan = scheduledPlan.start_plan;
          plan_data.expire_plan = nextExpireDate;
          plan_data.pay_hour = scheduledPlan.pay_hour;
          plan_data.free_plan = scheduledPlan.free_plan;

          plan_data.merchant_uid = nextMerchant_uid;
          plan_data.plan = toChangePlan.plan;

          await db.plan.create(
            {
              ...plan_data,
              active: 3,
            },
            {
              transaction: t,
            }
          );

          const startFreeDate = moment().format("YYYY.MM.DD");

          await db.plan.update(
            {
              active: 0,
              free_period_expire: startFreeDate,
            },
            { where: { idx: nowPlan.idx }, transaction: t }
          );
          plan_data.free_period_start = startFreeDate;
          plan_data.free_period_expire = nextExpireDate;
          await db.plan.create(plan_data, {
            transaction: t,
          });

          // 시간을 unix형태로 변경(실제)

          const startDate = plan_data.start_plan.replace(/\./g, "-");

          const changeToUnix = moment(
            `${startDate} ${scheduledPlan.pay_hour}:00`
          ).unix();

          // 다음 카드 결제 신청
          await schedulePay(
            changeToUnix,
            card_data.customer_uid,
            plan_data.result_price_levy,
            user_data.user_name,
            user_data.user_phone,
            user_data.user_email,
            nextMerchant_uid
          );
        } else {
          await db.plan.destroy({
            where: { idx: nowPlan.idx },
            transaction: t,
          });
          // 무료체험으로 가입할 때
          if (!usedFreePlan) {
            console.log("가입하는데 무료체험으로 가입할 때");
            const { nowStartPlan, nowExpirePlan } = await setPlanDate(payType);
            const Hour = moment().format("HH");
            plan_data.pay_hour = Hour;
            plan_data.free_plan = moment().format("YYYY.MM.DD");
            plan_data.start_plan = nowStartPlan;
            plan_data.expire_plan = nowExpirePlan;
            plan_data.result_price_levy =
              plan_data.result_price * 0.1 + plan_data.result_price;
            plan_data.merchant_uid = nextMerchant_uid;
            plan_data.free_period_start = plan_data.free_plan;
            plan_data.free_period_expire = plan_data.expire_plan;
            await db.plan.create(plan_data, {
              transaction: t,
            });
            await db.plan.create(
              {
                ...plan_data,
                active: 3,
              },
              {
                transaction: t,
              }
            );

            const scheduleUnixTime = moment(
              `${nowStartPlan.replace(/\./g, "-")} ${Hour}:00`
            ).unix();

            // 다음 카드 결제 신청
            await schedulePay(
              scheduleUnixTime,
              card_data.customer_uid,
              plan_data.result_price_levy,
              user_data.user_name,
              user_data.user_phone,
              user_data.user_email,
              nextMerchant_uid
            );
          } else {
            let nowStartPlan;
            let nowExpirePlan;
            const nowMerchentUid = nextMerchant_uid;
            const nextMerchentUid = generateRandomCode();
            if (payType == "month") {
              nowStartPlan = moment().format("YYYY.MM.DD");
              nowExpirePlan = moment()
                .add("1", "M")
                .subtract("1", "days")
                .format("YYYY.MM.DD");
            } else {
              nowStartPlan = moment().format("YYYY.MM.DD");
              nowExpirePlan = moment()
                .add("1", "Y")
                .subtract("1", "days")
                .format("YYYY.MM.DD");
            }
            const Hour = moment().format("HH");

            plan_data.start_plan = nowStartPlan;
            plan_data.expire_plan = nowExpirePlan;

            plan_data.merchant_uid = nowMerchentUid;
            plan_data.pay_hour = Hour;

            await db.plan.create(plan_data, {
              transaction: t,
            });

            if (payType == "month") {
              nowStartPlan = moment(nowExpirePlan.replace(/\./gi, "-"))
                .add("1", "days")
                .format("YYYY.MM.DD");
              nowExpirePlan = moment(nowStartPlan.replace(/\./gi, "-"))
                .add("1", "M")
                .subtract("1", "days")
                .format("YYYY.MM.DD");
            } else {
              nowStartPlan = moment(nowExpirePlan.replace(/\./gi, "-"))
                .add("1", "days")
                .format("YYYY.MM.DD");
              nowExpirePlan = moment(nowStartPlan.replace(/\./gi, "-"))
                .add("1", "Y")
                .subtract("1", "days")
                .format("YYYY.MM.DD");
            }
            plan_data.start_plan = nowStartPlan;
            plan_data.expire_plan = nowExpirePlan;
            plan_data.merchant_uid = nextMerchentUid;
            if (scheduledPlan) {
              await db.plan.destroy({
                where: { idx: scheduledPlan.idx },
                transaction: t,
              });
            }

            await db.plan.create(
              {
                ...plan_data,
                active: 3,
              },
              {
                transaction: t,
              }
            );

            const { success } = await payNow(
              card_data.customer_uid,
              plan_data.result_price_levy,
              nowMerchentUid,
              "플랜 즉시 결제"
            );
            if (!success) {
              await t.rollback();
              return res.send({ success: 400, message: "잔액 부족." });
            }

            const scheduleUnixTime = moment(
              `${nowStartPlan.replace(/\./g, "-")} ${Hour}:00`
            ).unix();

            await schedulePay(
              scheduleUnixTime,
              card_data.customer_uid,
              plan_data.result_price_levy,
              user_data.user_name,
              user_data.user_phone,
              user_data.user_email,
              nextMerchentUid
            );
          }
        }
      } else {
        // 프리로 다운그레이드 할 때
        if (plan_data.plan == "프리") {
          // 현재 플랜이 무료체험 기간일 때
          if (usingFree) {
            console.log("유료에서 프리로 다운그레이드인데 무료체험기간");
            plan_data.company_idx = company_idx;
            plan_data.free_plan = nowPlan.free_plan;
            plan_data.start_plan = nowPlan.start_plan;
            plan_data.expire_plan = nextExpireDate;
            plan_data.enrollment = null;
            plan_data.merchant_uid = nextMerchant_uid;
            plan_data.pay_hour = scheduledPlan.pay_hour;
            const startFreeDate = moment().format("YYYY.MM.DD");
            plan_data.free_period_start = startFreeDate;
            plan_data.free_period_expire = nextExpireDate;
            await db.plan.update(
              {
                active: 0,
                free_period_expire: startFreeDate,
              },
              {
                where: { idx: nowPlan.idx },
                transaction: t,
              }
            );
            // 결제 예약 플랜 삭제
            await db.plan.destroy({
              where: { idx: scheduledPlan.idx },
              transaction: t,
            });
            await db.plan.create(plan_data, {
              transaction: t,
            });

            plan_data.will_free = nowPlan.start_plan;
            await db.plan.create(
              { ...plan_data, active: 3 },
              {
                transaction: t,
              }
            );
            console.log("기본 플랜 만들기 active 3");
          } else {
            console.log(
              "유료에서 프리로 다운그레이드인데 무료체험기간 끝났을 때"
            );
            // 무료플랜 전환 예정 업데이트

            await db.plan.update(
              {
                will_free: scheduledPlan.start_plan,
                plan: "프리",
                whiteLabel_price: 0,
                chat_price: 0,
                analystic_price: 0,
                pay_type: null,
                plan_price: 0,
              },
              { where: { idx: scheduledPlan.idx }, transaction: t }
            );
          }
          console.log("기존 결제 예정 취소");
          console.log(card_data.customer_uid);

          // 기존의 결제 예정 취소
          await cancelSchedule(
            card_data.customer_uid,
            scheduledPlan.merchant_uid
          );
        } else {
          console.log("유료에서 유료로 업그레이드 다운그레이드 할 때");
          // 결제 예약 플랜 삭제
          await db.plan.destroy({
            where: { idx: scheduledPlan.idx },
            transaction: t,
          });

          // 시간을 unix형태로 변경(실제)

          const startDate = scheduledPlan.start_plan.replace(/\./g, "-");

          const changeToUnix = moment(
            `${startDate} ${scheduledPlan.pay_hour}:00`
          ).unix();

          // 새로 변경될 플랜 생성
          plan_data.merchant_uid = nextMerchant_uid;
          plan_data.company_idx = company_idx;
          plan_data.pay_hour = scheduledPlan.pay_hour;
          plan_data.start_plan = scheduledPlan.start_plan;
          plan_data.expire_plan = nextExpireDate;
          const newPlan = await db.plan.create(
            { ...plan_data, active: 3 },
            {
              transaction: t,
            }
          );

          // 현재 플랜이 무료체험 기간일 때
          if (usingFree) {
            console.log("유료에서 유료로 바꾸는데 무료체험 기간일 때");

            const startFreeDate = moment().format("YYYY.MM.DD");
            plan_data.free_period_start = startFreeDate;
            plan_data.free_period_expire = nextExpireDate;

            plan_data.free_plan = nowPlan.free_plan;
            await db.plan.update(
              {
                active: 0,
                free_period_expire: startFreeDate,
              },
              {
                where: { idx: nowPlan.idx },
                transaction: t,
              }
            );
            await db.plan.create(
              { ...plan_data, active: 1 },
              {
                transaction: t,
              }
            );

            await db.plan.update(
              { free_plan: nowPlan.free_plan },
              { where: { idx: newPlan.idx }, transaction: t }
            );
          }

          // 스케쥴 취소
          await cancelSchedule(
            card_data.customer_uid,
            scheduledPlan.merchant_uid
          );

          // 다음 카드 결제 신청
          await schedulePay(
            changeToUnix,
            card_data.customer_uid,
            newPlan.result_price_levy,
            user_data.user_name,
            user_data.user_phone,
            user_data.user_email,
            nextMerchant_uid
          );
        }
      }
      await t.commit();
      return res.send({ success: 200 });
    } catch (err) {
      await t.rollback();
      next(err);
    }

    return res.send({ success: 200 });
  },
  chargeFreeSms: async (req, res, next) => {
    const { company_idx, price } = req.body;

    const findCompany = await db.sms.findOne({
      where: { company_idx },
      include: [
        {
          model: db.company,
        },
      ],
    });
    const beforePrice = findCompany.text_cost;
    const addCost = price + beforePrice;
    const receiptId = generateRandomCode();
    const t = await db.sequelize.transaction();
    try {
      await db.sms.update(
        { text_cost: addCost },
        { where: { company_idx }, transaction: t }
      );

      await db.receipt.create(
        {
          company_name: findCompany.company.company_name,
          company_idx,
          message_price: price,
          result_price: 0,
          result_price_levy: 0,
          receipt_category: 3,
          receiptId,
          receipt_kind: "이벤트 문자 충전",
          before_text_price: beforePrice,
          after_text_price: addCost,
        },
        { transaction: t }
      );
      await t.commit();
      res.send({ success: 200 });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  changePlanInfo: async (req, res, next) => {
    try {
      const { body } = req;
      await db.planInfo.update(body, { where: { idx: body.planIdx } });
      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },
};
