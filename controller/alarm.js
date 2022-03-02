const db = require('../model/db');
const { alarmAttributes } = require('../lib/attributes');
const _f = require('../lib/functions');
module.exports = {
  delAlarm: async (req, res, next) => {
    const {
      params: { alarmId },
      user_idx,
    } = req;

    await db.alarm.destroy({ where: { idx: alarmId } });

    const io = req.app.get('io');

    const findResult = await db.alarm.findAll({
      where: { user_idx, repeat_time: null },
      raw: true,
    });
    io.to(user_idx).emit('sendAlarm', findResult);
    return;
  },

  confirmAlarm: async (req, res, next) => {
    const { alarmId } = req.body;
    alarmId.forEach(async (data) => {
      await db.alarm.update({ confirm: true }, { where: { idx: data } });
    });

    const findResult = await db.alarm.findAll({
      where: { user_idx, repeat_time: null },
      raw: true,
    });
    io.to(user_idx).emit('sendAlarm', findResult);
  },
  repeatAlarm: async (req, res, next) => {
    const {
      body: { alarmId, time },
      user_idx,
      company_idx,
    } = req;

    const findAlarmResult = await db.alarm.findByPk(alarmId, {
      attributes: alarmAttributes,
      raw: true,
    });

    await db.alarm.create({
      ...findAlarmResult,
      repeat_time: time,
      user_idx,
      company_idx,
    });
  },
};
