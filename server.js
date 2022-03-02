'use strict';
require('dotenv').config();
const io = require('./setting');
const db = require('./model/db');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');
const { alarmAttributes } = require('./lib/attributes');
const verify_data = require('./lib/jwtfunctions');
const { joinFunction } = require('./lib/apiFunctions');
io.on('connection', (socket) => {
  // 회사 알람 시스템에 Join
  socket.on('alarmJoin', async (data) => {
    // 토큰으로 user idx 찾기
    const user = await verify_data(data);

    // 개인 room 참가
    socket.join(user.user_idx);
  });
  // 회사 알람 보여주기
  socket.on('alarm', async (data) => {
    // 토큰으로 user idx 찾기
    const user = await verify_data(data);
    // 소속 회사 idx 찾기
    const findUserCompanyResult = await db.userCompany.findOne({
      where: { user_idx: user.user_idx, deleted: null, active: true },
      attributes: ['company_idx'],
    });

    // 개인 repeat alarm 찾기

    const findAllAlarms = await db.alarm.findAll({
      where: { user_idx: user.user_idx },
      attributes: alarmAttributes,
      raw: true,
    });
    // 시간차 구하기

    const scheduleAlarm = findAllAlarms.map((data) => {
      const targetDate = moment(data.repeat_time);
      const now = moment();
      if (moment.duration(now.diff(targetDate)).asMinutes() > 0) {
        await db.alarm.destroy({ where: { idx: data.alarmId } });
        return data;
      }

      if (data.repeat_time == null) {
        return data;
      }
    });
    console.log(scheduleAlarm);
    io.to(user.user_idx).emit('sendScheduleAlarm', scheduleAlarm);
  });
});
