'use strict';
require('dotenv').config();

const io = require('./setting');

io.on('connection', (socket) => {
  socket.on('join', async (data) => {
    console.log('누군가 들어왔다');
  });
});
