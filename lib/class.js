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
  constructor(body) {
    this.bodyData = body;
  }

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
    this.bodyData.kitchen_option = body.kitchen_option.replace(/,/g, ', ');
    this.bodyData.furniture = body.furniture.replace(/,/g, ', ');
    this.bodyData.facility = body.facility.replace(/,/g, ', ');
    this.bodyData.film = body.film.replace(/,/g, ', ');
    this.bodyData.etc = body.etc.replace(/,/g, ', ');
    return this.bodyData;
  }
}

module.exports = { Alarm, Form };
