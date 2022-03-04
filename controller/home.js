const db = require('../model/db');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');

const {} = require('../lib/attributes');

module.exports = {
  getHomeBoard: async (req, res, next) => {
    const { company_idx, user_idx } = req;
    const customerCount = await db.customer.count({
      where: { company_idx, deleted: null },
    });

    const issueCustomerCount = await db.customer.count({
      where: { company_idx, deleted: null, status: 4 },
    });

    const monthCount = await db.company.findByPk(company_idx, {
      attributes: ['form_link_count'],
    });

    const unconfirmAlarm = await db.alarm.count({
      where: { company_idx, confirm: false },
    });

    const userInfo = await db.user.findByPk(user_idx, {
      attributes: ['user_profile', 'user_name'],
    });

    const standByMember = await db.userCompany.count({
      where: { active: 0, deleted: null, company_idx },
    });
  },
};
