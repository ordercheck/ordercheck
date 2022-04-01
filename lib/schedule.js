const formSchedule = require("node-schedule");
const db = require("../model/db");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
const { Op } = require("sequelize");
const { Alarm } = require("./classes/AlarmClass");
// '초 분 시 일 월 요일  (0 과 7 은 일요일)'
const countReset = "0 0 10 1 * *";

// const alarmDate = "*/1 * * * * *";
const alarmDate = "0 0 16 * * *";

console.log("매달 form 개수 초기화 스케쥴러");
formSchedule.scheduleJob(countReset, async function () {
  console.log("업데이트가 되야하는데?");
  await db.user.update(
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

  // 무료 플랜 알람 저장
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

    const findCompanyResult = await db.company.findOne({
      where: {
        idx: data.company_idx,
      },
      attributes: ["huidx"],
    });

    const message = `무료 체험 종료 ${diffTime}일 전입니다.`;

    await alarm.createAlarm({
      message,
      alarm_type: 11,
      user_idx: findCompanyResult.huidx,
      company_idx: data.company_idx,
    });
  });
});
