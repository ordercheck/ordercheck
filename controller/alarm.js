const db = require('../model/db');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');
const { Alarm } = require('../lib/class');
const { createExpireDate } = require('../lib/apiFunctions');
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

    await db.alarm.findAll({
      where: { user_idx, repeat_time: null },
      attributes: alarmAttributes,
      order: [['createdAt', 'DESC']],
      raw: true,
    });

    return res.send({ success: 200 });
  },

  confirmAlarm: async (req, res, next) => {
    const {
      body: { alarmId },
      user_idx,
    } = req;

    for (let i = 0; i < alarmId.length; i++) {
      await db.alarm.update({ confirm: true }, { where: { idx: alarmId[i] } });
    }
    await db.alarm.findAll({
      where: { user_idx, repeat_time: null },
      attributes: alarmAttributes,
      order: [['createdAt', 'DESC']],
      raw: true,
    });
    res.send({ success: 200 });

    return;
  },
  repeatAlarm: async (req, res, next) => {
    const {
      body: { alarmId, time, afterTime },
      user_idx,
      company_idx,
    } = req;

    const findAlarmResult = await db.alarm.findByPk(alarmId, {
      attributes: alarmAttributes,
      raw: true,
    });

    await db.alarm.update(
      { confirm: true },
      {
        idx: alarmId,
      }
    );

    delete findAlarmResult.createdAt;
    const expiry_date = createExpireDate();
    findAlarmResult.expiry_date = expiry_date;
    const createResult = await db.alarm.create({
      ...findAlarmResult,
      repeat_time: time,
      user_idx,
      company_idx,
      resend: true,
    });
    res.send({ success: 200 });

    const reAlertMs = afterTime * 60000;

    setTimeout(() => {
      const io = req.app.get('io');
      const alarm = new Alarm(createResult);
      io.to(parseInt(user_idx)).emit('addAlarm', alarm);
      db.alarm.update({ resend: false }, { where: { idx: createResult.idx } });
    }, reAlertMs);
  },
};
