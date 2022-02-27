'use strict';
require('dotenv').config();

const io = require('./setting');

io.on('connection', (socket) => {
  socket.on('join', async (data) => {
    const findResult = await db.user.findByPk(data);
  });
});
