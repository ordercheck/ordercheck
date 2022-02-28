const db = require('../model/db');
module.exports = {
  socketTest: async (req, res, next) => {
    const io = req.app.get('io');

    io.to('1').emit('sendAlarm', '알람 보냅니다');
  },
};
