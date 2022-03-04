const db = require('../model/db');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');
const { Alarm } = require('../lib/class');
const {} = require('../lib/attributes');

module.exports = {
  getHomeBoard: async (req, res, next) => {
    const { company_idx } = req;
    const customerCount = await db.customer.count({
      where: { company_idx, deleted: null },
    });

    // const customerCount = await db.customer.count({
    //   where: { company_idx, deleted: null },
    // });
  },
};
