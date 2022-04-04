const formSchedule = require("node-schedule");
const db = require("../model/db");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
const { Op } = require("sequelize");
const { Alarm } = require("./classes/AlarmClass");
// '초 분 시 일 월 요일  (0 과 7 은 일요일)'
const countReset = "0 0 17 1 * *";

// const alarmDate = "*/1 * * * * *";
const alarmDate = "0 0 16 * * *";

console.log("매달 form 개수 초기화 스케쥴러");
formSchedule.scheduleJob(countReset, async function () {
  await db.company.update(
    { form_link_count: 0, customer_count: 0 },
    { where: {} }
  );
});

console.log("1시 스케줄러");
formSchedule.scheduleJob(alarmDate, async function () {
  // bread 삭제
  await db.store.destroy({
    truncate: true,
  });

  // 만료된 알람 삭제
  const nowDate = moment().toISOString();
  await db.alarm.destroy({
    where: {
      expiry_date: { [Op.lte]: nowDate },
    },
  });

  // 무료 플랜 30일 찾기
  const findFreePlan = await db.plan.findAll({
    where: { free_plan: { [Op.ne]: null }, active: 1 },
    attributes: ["start_plan", "company_idx"],
    raw: true,
  });

  // 프리플랜 여부 체크
  const alarm = new Alarm({});
  let now = moment();

  findFreePlan.forEach(async (data) => {
    // 남은 날짜 구하기
    const freePlan = moment(data.start_plan.replace(/\./g, "-"));
    let diffTime = moment.duration(freePlan.diff(now)).asDays();
    diffTime = Math.ceil(diffTime);
    diffTime = 30;
    const findCompanyResult = await db.company.findByPk(data.company_idx, {
      attributes: ["huidx"],
    });
    // 30일
    if (diffTime == 30 || diffTime == 7 || diffTime == 1) {
      const message = alarm.restFreeAlarm(diffTime);

      await alarm.createAlarm({
        message,
        alarm_type: 38,
        user_idx: findCompanyResult.huidx,
        company_idx: data.company_idx,
      });
    }
  });
});
