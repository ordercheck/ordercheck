const db = require('../model/db');
const { alarmAttributes } = require('../lib/attributes');
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

  async createAlarm(createData) {
    const expiry_date = moment().add('14', 'day').format('YYYY.MM.DD HH:mm');
    createData.expiry_date = expiry_date;

    const createResult = await db.alarm.create(createData);
    return createResult;
  }

  delAlarms(alarms) {
    alarms.forEach(async (idx) => {
      await db.alarm.destroy({ where: { idx } });
    });
  }

  async confirmAlarms(alarm) {
    for (let i = 0; i < alarm.length; i++) {
      await this.updateAlarms({ confirm: true }, { idx: alarm[i] });
    }
  }

  async findAllAlarms(whereData, sortData) {
    await db.alarm.findAll({
      where: whereData,
      attributes: alarmAttributes,
      order: sortData,
      raw: true,
    });
  }

  async findAlarmsByPk(alarm) {
    const findAlarmResult = await db.alarm.findByPk(alarm, {
      attributes: alarmAttributes,
      raw: true,
    });
    return findAlarmResult;
  }
  async updateAlarms(updateData, whereData) {
    await db.alarm.update(updateData, {
      where: whereData,
    });
  }
}

class ETC {
  createCustomerData(address, phoneNumeber) {
    this.bodyData.searchingAddress = address;
    this.bodyData.searchingPhoneNumber = phoneNumeber;
    return this.bodyData;
  }
  fileStoreData(
    customer_phoneNumber,
    customer_name,
    idx,
    searchingPhoneNumber
  ) {
    this.bodyData.customer_phoneNumber = customer_phoneNumber;
    this.bodyData.customer_name = customer_name;
    this.bodyData.customer_idx = idx;
    this.bodyData.searchingPhoneNumber = searchingPhoneNumber;
    return this.bodyData;
  }
}

class Form extends ETC {
  constructor(body) {
    super();
    this.bodyData = body;
  }

  createNewUrl(imgUrl, conceptUrl) {
    this.bodyData.floor_plan = JSON.stringify(imgUrl);
    this.bodyData.hope_concept = JSON.stringify(conceptUrl);
    this.bodyData.expand = this.bodyData.expand.replace(/,/g, ', ');
    this.bodyData.carpentry = this.bodyData.carpentry.replace(/,/g, ', ');
    this.bodyData.paint = this.bodyData.paint.replace(/,/g, ', ');
    this.bodyData.bathroom_option = this.bodyData.bathroom_option.replace(
      /,/g,
      ', '
    );
    this.bodyData.floor = this.bodyData.floor.replace(/,/g, ', ');
    this.bodyData.tile = this.bodyData.tile.replace(/,/g, ', ');
    this.bodyData.electricity_lighting =
      this.bodyData.electricity_lighting.replace(/,/g, ', ');
    this.bodyData.kitchen_option = this.bodyData.kitchen_option.replace(
      /,/g,
      ', '
    );
    this.bodyData.furniture = this.bodyData.furniture.replace(/,/g, ', ');
    this.bodyData.facility = this.bodyData.facility.replace(/,/g, ', ');
    this.bodyData.film = this.bodyData.film.replace(/,/g, ', ');
    this.bodyData.etc = this.bodyData.etc.replace(/,/g, ', ');
    return this.bodyData;
  }
}

class Customer extends ETC {
  constructor(body) {
    super();
    this.bodyData = body;
  }
}

module.exports = { Alarm, Form, Customer };
