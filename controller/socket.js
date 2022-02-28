const db = require('../model/db');
module.exports = {
  socketTest: async (req, res, next) => {
    const io = req.app.get('io');
    io.emit('alarm', '알람 보냅니다');
  },
};
