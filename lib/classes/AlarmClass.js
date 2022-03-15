const db = require('../../model/db');
const { alarmAttributes } = require('../attributes');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');

class Alarm {
  constructor(data) {
    this.alarmId = data.idx;
    this.repeat_time = data.repeat_time;
    this.message = data.message;
    this.createdAt = data.createdAt;
    this.alarm_type = data.alarm_type;
    this.confirm = data.confirm;
    this.customer_idx = data.customer_idx;
    this.form_idx = data.form_idx;
  }

  createAlarm = async (createData) => {
    const expiry_date = moment().add('14', 'day').format('YYYY.MM.DD HH:mm');
    createData.expiry_date = expiry_date;

    const createResult = await db.alarm.create(createData);
    return createResult;
  };

  delAlarms = (alarms) => {
    alarms.forEach(async (idx) => {
      await db.alarm.destroy({ where: { idx } });
    });
  };

  confirmAlarms = async (alarm) => {
    for (let i = 0; i < alarm.length; i++) {
      await this.updateAlarms({ confirm: true }, { idx: alarm[i] });
    }
  };

  findAllAlarms = async (whereData, sortData) => {
    await db.alarm.findAll({
      where: whereData,
      attributes: alarmAttributes,
      order: sortData,
      raw: true,
    });
  };

  findAlarmsByPk = async (alarm) => {
    const findAlarmResult = await db.alarm.findByPk(alarm, {
      attributes: alarmAttributes,
      raw: true,
    });
    return findAlarmResult;
  };
  updateAlarms = async (updateData, whereData) => {
    await db.alarm.update(updateData, {
      where: whereData,
    });
  };
}

module.exports = { Alarm };
