'use strict';
require('dotenv').config();
const io = require('./setting');
const db = require('./model/db');
const verify_data = require('./lib/jwtfunctions');
const { joinFunction } = require('./lib/apiFunctions');
io.on('connection', (socket) => {
  console.log('연결됨');
  socket.on('alarm', async (data) => {
    const user = verify_data(data);
    console.log(user);
    socket.join(`${data}`);
  });
});
