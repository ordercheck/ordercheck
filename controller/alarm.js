const db = require('../model/db');

const _f = require('../lib/functions');
module.exports = {
  delAlarm: async (req, res, next) => {
    return res.send({ success: 200 });
  },
};
