const formSchedule = require('node-schedule');
const db = require('../model/db');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');
const { Op } = require('sequelize');
const { createAlarm } = require('../lib/apiFunctions');
// '초 분 시 일 월 요일  (0 과 7 은 일요일)'
const countReset = '0 0 1 1 * *';

// const alarmDate = '*/1 * * * * *';
const alarmDate = '0 1 * * *';

console.log('매달 form 개수 초기화 스케쥴러');
formSchedule.scheduleJob(countReset, async function () {
  await db.user.update(
    { form_link_count: 0, customer_count: 0 },
    { where: {} }
  );
});

console.log('1시 스케줄러');
formSchedule.scheduleJob(alarmDate, async function () {
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
    attributes: ['start_plan', 'company_idx'],
    raw: true,
  });

  findFreePlan.forEach(async (data) => {
    // 남은 날짜 구하기
    let now = moment().format('YYYY-MM-DD');
    now = moment(now);
    const freePlan = moment(data.start_plan.replace(/\./g, '-'));
    let diffTime = moment(freePlan.diff(now)).format('DD');
    diffTime = parseInt(diffTime) - 1;

    const findCompanyResult = await db.company.findOne({
      where: {
        idx: data.company_idx,
      },
      attributes: ['huidx'],
    });

    const message = `무료 체험 종료 ${diffTime}일 전입니다.`;

    await createAlarm({
      message,
      alarm_type: 11,
      user_idx: findCompanyResult.huidx,
      company_idx: data.company_idx,
    });

    await db.store.destroy({
      truncate: true,
    });
  });
});
