const db = require('../model/db');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');
const { Op } = require('sequelize');
const {} = require('../lib/attributes');

module.exports = {
  getHomeBoard: async (req, res, next) => {
    const { company_idx, user_idx } = req;
    try {
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
        where: { active: 1, deleted: null, standBy: true, company_idx },
      });

      // 시간 계산
      const now = moment().add('1', 'day').format('YYYY-MM-DD');
      const daysAgo = moment().subtract(6, 'day').format('YYYY-MM-DD');

      const zeroFiftyPossibility = await db.customer.count({
        where: {
          createdAt: { [Op.between]: [daysAgo, now] },
          contract_possibility: {
            [Op.or]: [0, 1],
          },
        },
      });

      const fiftyComplete = await db.customer.count({
        where: {
          createdAt: { [Op.between]: [daysAgo, now] },
          contract_possibility: {
            [Op.or]: [2, 3],
          },
        },
      });

      const consultingCount = await db.consulting.count({
        where: {
          createdAt: { [Op.between]: [daysAgo, now] },
        },
      });

      const calculateCount = await db.calculate.count({
        where: {
          createdAt: { [Op.between]: [daysAgo, now] },
        },
      });

      const completeConsulting = await db.customer.count({
        where: {
          createdAt: { [Op.between]: [daysAgo, now] },
          contract_possibility: 3,
        },
      });

      return res.send({
        success: 200,
        customerCount,
        issueCustomerCount,
        monthCount,
        unconfirmAlarm,
        userInfo,
        standByMember,
        zeroFiftyPossibility,
        fiftyComplete,
        consultingCount,
        calculateCount,
        completeConsulting,
      });
    } catch (err) {
      next(err);
    }
  },
};
