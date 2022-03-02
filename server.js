'use strict';
require('dotenv').config();
const io = require('./setting');
const db = require('./model/db');
const verify_data = require('./lib/jwtfunctions');
const { joinFunction } = require('./lib/apiFunctions');
io.on('connection', (socket) => {
  // 회사 알람 시스템에 Join
  socket.on('alarmJoin', async (data) => {
    // 토큰으로 user idx 찾기
    const user = await verify_data(data);
    // 소속 회사 idx 찾기
    const findUserCompanyResult = await db.userCompany.findOne({
      where: { user_idx: user.user_idx, deleted: null, active: 1 },
      attributes: ['company_idx'],
    });

    // 회사 room 참가
    socket.join(findUserCompanyResult.company_idx);
  });
  // 회사 알람 보여주기
  socket.on('alarm', async (data) => {
    console.log(socket);
    // 토큰으로 user idx 찾기
    const user = await verify_data(data);
    // 소속 회사 idx 찾기
    const findUserCompanyResult = await db.userCompany.findOne({
      where: { user_idx: user.user_idx, deleted: null, active: 1 },
      attributes: ['company_idx'],
    });
    // 회사 alarm 찾기
    const findResult = await db.alarm.findAll({
      where: { company_idx: findUserCompanyResult.company_idx },
      attributes: [
        ['idx', 'alarmId'],
        'message',
        'createdAt',
        'alarm_type',
        'confirm',
      ],
    });

    io.to(findUserCompanyResult.company_idx).emit('sendAlarm', findResult);
  });
});
