'use strict';
require('dotenv').config();
const io = require('./setting');
const db = require('./model/db');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');
const { alarmAttributes } = require('./lib/attributes');
const verify_data = require('./lib/jwtfunctions');

io.on('connection', (socket) => {
  console.log('연결됨');

  // 회사 알람 시스템에 Join
  socket.on('alarmJoin', async (data) => {
    console.log('alarmJoin');
    // 토큰으로 user idx 찾기
    const user = await verify_data(data);

    // 개인 room 참가
    socket.join(user.user_idx);
  });
  // 회사 알람 보여주기
  socket.on('alarm', async (data) => {
    // 토큰으로 user idx 찾기
    const user = await verify_data(data);

    // 개인 repeat alarm 찾기
    const findAllAlarms = await db.alarm.findAll({
      where: { user_idx: user.user_idx },
      attributes: alarmAttributes,
      order: [['createdAt', 'DESC']],
      raw: true,
    });
    // 시간차 구하기
    const scheduleAlarm = await Promise.all(
      findAllAlarms.map(async (data) => {
        const targetDate = moment(data.repeat_time);
        const now = moment();
        if (
          moment.duration(now.diff(targetDate)).asMinutes() > 0 &&
          data.resend == true
        ) {
          return data;
        }

        if (data.resend == false) {
          return data;
        }
      })
    );

    io.to(user.user_idx).emit('sendAlarm', scheduleAlarm);
  });
});
