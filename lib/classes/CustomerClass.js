const { ETC } = require('../classes/ETC');

class Customer extends ETC {
  constructor(body) {
    super();
    this.bodyData = body;
  }
}

module.exports = { Customer };
