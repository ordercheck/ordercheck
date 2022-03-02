const db = require('../model/db');
module.exports = {
  socketTest: async (req, res, next) => {
    const io = req.app.get('io');
    console.log('알람 보내기');
    console.log(io.sockets);
    io.to('1').emit('sendAlarm', '알람 보냅니다');
  },
};
