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

    const now = moment();
    const scheduleAlarm = [];
    for (let i = 0; i < findAllAlarms.length; i++) {
      const targetDate = moment(findAllAlarms[i].repeat_time);
      if (moment.duration(now.diff(targetDate)).asMinutes() < 0) {
        continue;
      } else {
        scheduleAlarm.push(findAllAlarms[i]);
      }
    }

    console.log('알람', scheduleAlarm);

    io.to(user.user_idx).emit('sendAlarm', scheduleAlarm);
  });
});
