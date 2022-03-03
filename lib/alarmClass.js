export class Alarm {
  constructor(createResult) {
    this.alarmId = createResult.idx;
    this.repeat_time = createResult.repeat_time;
    this.message = createResult.message;
    this.createdAt = createResult.createdAt;
    this.alarm_type = createResult.alarm_type;
    this.confirm = createResult.confirm;
  }
}
