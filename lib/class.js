class Alarm {
  constructor(data) {
    this.alarmId = data.idx;
    this.repeat_time = data.repeat_time;
    this.message = data.message;
    this.createdAt = data.createdAt;
    this.alarm_type = data.alarm_type;
    this.confirm = data.confirm;
  }
}

class Form {
  constructor(imgUrl, conceptUrl, body) {
    this.floor_plan = JSON.stringify(imgUrl);
    this.hope_concept = JSON.stringify(conceptUrl);
    this.expand = body.expand.replace(/,/g, ', ');
    this.carpentry = body.carpentry.replace(/,/g, ', ');
    this.paint = body.paint.replace(/,/g, ', ');
    this.bathroom_option = body.bathroom_option.replace(/,/g, ', ');
    this.floor = body.floor.replace(/,/g, ', ');
    this.tile = body.tile.replace(/,/g, ', ');
    this.electricity_lighting = body.electricity_lighting.replace(/,/g, ', ');
    this.kitchen_option = body.kitchen_option.replace(/,/g, ', ');
    this.furniture = body.furniture.replace(/,/g, ', ');
    this.facility = body.facility.replace(/,/g, ', ');
    this.film = body.film.replace(/,/g, ', ');
    this.etc = body.etc.replace(/,/g, ', ');
  }
}

module.exports = { Alarm, Form };
