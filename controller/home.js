const db = require('../model/db');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');
const { Op } = require('sequelize');
const {} = require('../lib/attributes');
const { consulting } = require('../model/db');

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
        where: { user_idx, confirm: false },
      });

      const userInfo = await db.user.findByPk(user_idx, {
        attributes: ['user_name'],
      });
      const companyInfo = await db.company.findByPk(company_idx, {
        attributes: ['company_logo', 'company_name'],
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

      const consultingCountArr = await db.consulting.findAll({
        where: {
          createdAt: { [Op.between]: [daysAgo, now] },
        },
        attributes: [
          [
            db.sequelize.fn(
              'date_format',
              db.sequelize.col('createdAt'),
              '%Y.%m.%d'
            ),
            'createdAt',
          ],
        ],
        order: [['createdAt', 'DESC']],
        raw: true,
      });

      const calculateCountArr = await db.calculate.findAll({
        where: {
          createdAt: { [Op.between]: [daysAgo, now] },
        },
        attributes: [
          [
            db.sequelize.fn(
              'date_format',
              db.sequelize.col('createdAt'),
              '%Y.%m.%d'
            ),
            'createdAt',
          ],
        ],
        order: [['createdAt', 'DESC']],
        raw: true,
      });

      const completeConsultingArr = await db.customer.findAll({
        where: {
          createdAt: { [Op.between]: [daysAgo, now] },
          contract_possibility: 3,
        },
        attributes: [
          [
            db.sequelize.fn(
              'date_format',
              db.sequelize.col('createdAt'),
              '%Y.%m.%d'
            ),
            'createdAt',
          ],
        ],
        order: [['createdAt', 'DESC']],
        raw: true,
      });

      // 날짜 구하기

      let consultingCountObject = {};
      let calculateCountObject = {};
      let completeConsultingObject = {};

      let consultingCount = [];
      let calculateCount = [];
      let completeConsulting = [];
      let index = 6;
      for (let i = 0; i < 7; i++) {
        const date = moment().subtract(i, 'days').format('YYYY.MM.DD');
        consultingCountObject[date] = { count: 0, index };
        calculateCountObject[date] = { count: 0, index };
        completeConsultingObject[date] = { count: 0, index };
        consultingCount[index] = date;
        calculateCount[index] = date;
        completeConsulting[index] = date;
        index -= 1;
      }

      for (let i = 0; i < consultingCountArr.length; i++) {
        const data = consultingCountArr[i].createdAt;
        consultingCountObject[data].count += 1;
      }
      for (let i = 0; i < calculateCountArr.length; i++) {
        const data = calculateCountArr[i].createdAt;
        calculateCountObject[data].count += 1;
      }
      for (let i = 0; i < completeConsultingArr.length; i++) {
        const data = completeConsultingArr[i].createdAt;
        completeConsultingObject[data].count += 1;
      }

      consultingCount = consultingCount.map((data) => {
        data = consultingCountObject[data].count;
        return data;
      });
      calculateCount = calculateCount.map((data) => {
        data = calculateCountObject[data].count;
        return data;
      });
      completeConsulting = completeConsulting.map((data) => {
        data = completeConsultingObject[data].count;
        return data;
      });

      return res.send({
        success: 200,
        customerCount,
        issueCustomerCount,
        monthCount,
        unconfirmAlarm,
        userInfo,
        companyInfo,
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
