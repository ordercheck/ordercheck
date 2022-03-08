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
      const date = moment().format('YYYY.MM.DD');
      const consultingCount = {};
      const calculateCount = {};
      const completeConsulting = {};

      for (let i = 1; i < 7; i++) {
        const date = moment().subtract(i, 'days').format('YYYY.MM.DD');
        consultingCount[date] = 0;
        calculateCount[date] = 0;
        completeConsulting[date] = 0;
      }

      consultingCount[date] = 0;
      calculateCount[date] = 0;
      completeConsulting[date] = 0;

      consultingCountArr.push({ createdAt: '2022.03.08' });
      for (let i = 0; i < consultingCountArr.length; i++) {
        const data = consultingCountArr[i].createdAt;
        consultingCount[data] += 1;
      }
      for (let i = 0; i < calculateCountArr.length; i++) {
        const data = calculateCountArr[i].createdAt;
        calculateCount[data] += 1;
      }
      for (let i = 0; i < completeConsultingArr.length; i++) {
        const data = completeConsultingArr[i].createdAt;
        completeConsulting[data] += 1;
      }

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
