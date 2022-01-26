const { checkUserCompany } = require('../lib/apiFunctions');
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
  dateFilter: async (req, res) => {
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
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },
  statusFilter: async (req, res) => {
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
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },
  contractPossibilityFilter: async (req, res) => {
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
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },
};
