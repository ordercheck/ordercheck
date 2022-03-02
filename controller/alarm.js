const db = require('../model/db');
const { alarmAttributes } = require('../lib/attributes');
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
