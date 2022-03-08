const formSchedule = require('node-schedule');
const db = require('../model/db');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');
const { Op } = require('sequelize');
// '초 분 시 일 월 요일  (0 과 7 은 일요일)'
const countReset = '0 0 1 1 * *';

// const alarmDate = '*/1 * * * * *';
const alarmDate = '0 0 * * * *';

console.log('매달 form 개수 초기화 스케쥴러');
formSchedule.scheduleJob(countReset, function () {
  db.user.update({ form_link_count: 0, customer_count: 0 }, { where: {} });
});

console.log('알람 기간 체크 후 삭제');
formSchedule.scheduleJob(alarmDate, async function () {
  console.log('알람 지우장');
  const nowDate = moment().toISOString();
  await db.alarm.destroy({
    where: {
      expiry_date: { [Op.lte]: nowDate },
    },
  });
});
