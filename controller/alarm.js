const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
const { Alarm } = require("../lib/classes/AlarmClass");
const { findAlarmAttributes } = require("../lib/attributes");
module.exports = {
  delAlarm: async (req, res, next) => {
    const {
      body: { alarmId },
    } = req;
    try {
      const alarm = new Alarm({});
      alarm.delAlarms(alarmId);
      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },

  confirmAlarm: async (req, res, next) => {
    const {
      body: { alarmId },
    } = req;
    try {
      const alarm = new Alarm({});
      alarm.confirmAlarms(alarmId);
      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },
  repeatAlarm: async (req, res, next) => {
    const {
      body: { alarmId, time, afterTime },
      user_idx,
      company_idx,
    } = req;

    try {
      const alarm = new Alarm({});
      const findAlarmResult = await alarm.findAlarmsByPk(
        alarmId,
        findAlarmAttributes
      );

      await alarm.updateAlarms({ confirm: true }, { idx: alarmId });

      findAlarmResult.confirm = false;
      findAlarmResult.repeat_time = time;
      findAlarmResult.user_idx = user_idx;
      findAlarmResult.company_idx = company_idx;
      findAlarmResult.createdAt = moment(time);
      const createResult = await alarm.createAlarm(findAlarmResult);

      res.send({ success: 200 });

      const reAlertMs = afterTime * 60000;

      setTimeout(async () => {
        const io = req.app.get("io");
        const sendAlarm = new Alarm(createResult);
        io.to(parseInt(user_idx)).emit(
          "addAlarm",
          sendAlarm.alarmData.dataValues
        );
        await alarm.updateAlarms(
          { repeat_time: null },
          { idx: createResult.idx }
        );
      }, reAlertMs);
    } catch (err) {
      next(err);
    }
  },
};
