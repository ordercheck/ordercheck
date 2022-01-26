const formSchedule = require('node-schedule');
const db = require('../model/db');
// '초 분 시 일 월 요일  (0 과 7 은 일요일)'
const rule = '0 0 1 1 * *';

console.log('매달 form 개수 초기화 스케쥴러');
formSchedule.scheduleJob(rule, function () {
  db.user.update({ form_link_count: 0, form_self_count: 0 }, { where: {} });
});
