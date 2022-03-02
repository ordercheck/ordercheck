'use strict';
require('dotenv').config();
const io = require('./setting');
const db = require('./model/db');
const verify_data = require('./lib/jwtfunctions');
const { joinFunction } = require('./lib/apiFunctions');
io.on('connection', (socket) => {
  console.log('연결됨');
  socket.on('alarm', async (data) => {
    // 토큰으로 user idx 찾기
    const user = verify_data(data);

    // 소속 회사 idx 찾기
    const findUserCompanyResult = await db.userCompany.findOne({
      where: { user_idx: user.user_idx, deleted: null, active: 1 },
      attributes: ['company_idx'],
    });

    // 회사 alarm 찾기
    const findResult = await db.alarm.findAll({
      where: { company_idx: findUserCompanyResult.company_idx },
      attributes: ['idx', 'message'],
    });

    socket.emit('sendAlarm', findResult);

    console.log(user);
    socket.join(`${data}`);
  });
});
