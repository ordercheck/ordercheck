'use strict';
const io = require('./setting');
io.on('connection', (socket) => {
  console.log('소켓 연결');
});
