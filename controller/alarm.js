const db = require('../model/db');

const _f = require('../lib/functions');
module.exports = {
  delAlarm: async (req, res, next) => {
    const {
      params: { alarmId },
    } = req;
    await db.alarm.destroy({ where: { idx: alarmId } });
    return res.send({ success: 200, message: '삭제 완료' });
  },

  confirmAlarm: async (req, res, next) => {
    const { alarmId } = req.body;
    alarmId.forEach(async (data) => {
      await db.alarm.update({ confirm: true }, { where: { idx: data } });
    });
  },
  repeatAlarm: async (req, res, next) => {},
};
