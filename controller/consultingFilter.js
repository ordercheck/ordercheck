const { checkUserCompany, errorFunction } = require('../lib/apiFunctions');
const { changeDate } = require('../lib/apiFunctions');
const db = require('../model/db');
const { Op } = require('sequelize');
// 받은 params를 sequelize or형태에 맞게 만들어주는 함수
const makeArrforFilter = (data, status) => {
  let countArr = data.split(',');
  countArr = countArr.map((el) => {
    el = { [status]: el };
    return el;
  });
  return countArr;
};
module.exports = {
  Filter: async (req, res, next) => {
    let {
      query: { date, active, contract_possibility },
      company_idx,
    } = req;
    let firstDate;
    let secondDate;
    let countArr = [{ active: '0' }, { active: '1' }];
    let countPossibility = [
      { contract_possibility: '0' },
      { contract_possibility: '1' },
    ];
    if (date) {
      const changeDateResult = changeDate(date);
      firstDate = changeDateResult.firstDate;
      secondDate = changeDateResult.secondDate;
    }
    if (active) {
      countArr = makeArrforFilter(active, (status = 'active'));
    }

    if (contract_possibility) {
      countPossibility = makeArrforFilter(
        contract_possibility,
        (status = 'contract_possibility')
      );
    }

    const result = await db.customer.findAll({
      where: {
        company_idx,
        createdAt: { [Op.between]: [firstDate, secondDate] },
        [Op.or]: countArr,
        [Op.or]: countPossibility,
      },
    });
    return res.send({ result });
  },
  dateFilter: async (req, res, next) => {
    let {
      params: { date },
      company_idx,
    } = req;
    try {
      // const checkResult = await checkUserCompany(company_idx, user_idx);
      // if (checkResult == false) {
      //   return res.send({ success: 400 });
      // }
      const { firstDate, secondDate } = changeDate(date);

      const result = await db.customer.count({
        where: {
          company_idx,
          createdAt: { [Op.between]: [firstDate, secondDate] },
        },
      });
      return res.send({ success: 200, result });
    } catch (err) {
      next(err);
    }
  },
  statusFilter: async (req, res, next) => {
    let {
      params: { active },
      company_idx,
    } = req;
    try {
      // const checkResult = await checkUserCompany(company_idx, user_idx);
      // if (checkResult == false) {
      //   return res.send({ success: 400 });
      // }
      const countArr = makeArrforFilter(active, (status = 'active'));

      const result = await db.customer.count({
        where: {
          company_idx,
          [Op.or]: countArr,
        },
      });
      return res.send({ success: 200, result });
    } catch (err) {
      next(err);
    }
  },
  contractPossibilityFilter: async (req, res, next) => {
    let {
      params: { contract_possibility },
      company_idx,
    } = req;
    try {
      // const checkResult = await checkUserCompany(company_idx, user_idx);
      // if (checkResult == false) {
      //   return res.send({ success: 400 });
      // }
      const countArr = makeArrforFilter(
        contract_possibility,
        (status = 'contract_possibility')
      );
      const result = await db.customer.count({
        where: {
          company_idx,
          [Op.or]: countArr,
        },
      });
      return res.send({ success: 200, result });
    } catch (err) {
      next(err);
    }
  },
  searchCustomer: async (req, res, next) => {
    // 인덱싱 필요
    try {
      const pureText = req.query.search.replace(/\W|\s/g, '');
      const result = await db.customer.findAll({
        where: {
          [Op.or]: {
            customer_name: {
              [Op.like]: `%${pureText}%`,
            },
            searchingPhoneNumber: {
              [Op.like]: `%${pureText}%`,
            },
            searchingAddress: {
              [Op.like]: `%${pureText}%`,
            },
          },
        },
        limit: 10,
      });
      return res.send(result);
    } catch (err) {
      next(err);
    }
  },
};
