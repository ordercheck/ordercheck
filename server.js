'use strict';
require('dotenv').config();

const io = require('./setting');
const db = require('./model/db');
const { joinFunction } = require('./lib/apiFunctions');
io.on('connection', (socket) => {
  socket.on('alarm', async (data) => {
    socket.join(`${data}`);
  });
});
