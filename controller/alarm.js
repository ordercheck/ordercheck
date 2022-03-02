const db = require('../model/db');
const { alarmAttributes } = require('../lib/attributes');
const _f = require('../lib/functions');
module.exports = {
  delAlarm: async (req, res, next) => {
    const {
      body: { alarmId },
      user_idx,
    } = req;

    alarmId.forEach(async (idx) => {
      await db.alarm.destroy({ where: { idx } });
    });

    const findResult = await db.alarm.findAll({
      where: { user_idx, repeat_time: null },
      raw: true,
    });
    const io = req.app.get('io');
    io.to(user_idx).emit('sendAlarm', findResult);
    return res.send({ success: 200 });
  },

  confirmAlarm: async (req, res, next) => {
    const {
      body: { alarmId },
      user_idx,
    } = req;
    alarmId.forEach(async (data) => {
      await db.alarm.update({ confirm: true }, { where: { idx: data } });
    });

    const findResult = await db.alarm.findAll({
      where: { user_idx, repeat_time: null },
      raw: true,
    });
    const io = req.app.get('io');
    io.to(user_idx).emit('sendAlarm', findResult);
    return res.send({ success: 200 });
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
    return res.send({ success: 200 });
  },
};
