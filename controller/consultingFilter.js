const { checkUserCompany } = require('../lib/apiFunctions');
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
      params: { company_idx, date },
      loginUser: user_idx,
    } = req;
    try {
      const checkResult = await checkUserCompany(company_idx, user_idx);
      if (checkResult == false) {
        return res.send({ success: 400 });
      }

      date = date.replace(/ /gi, '').split('-');

      const firstDate = new Date(date[0].replace(/\./gi, '-'));
      const secondDate = new Date(date[1].replace(/\./gi, '-'));
      firstDate.setDate(firstDate.getDate() - 1);
      secondDate.setDate(secondDate.getDate() + 1);

      const result = await db.consulting.count({
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
      params: { company_idx, active },
      loginUser: user_idx,
    } = req;
    try {
      const checkResult = await checkUserCompany(company_idx, user_idx);
      if (checkResult == false) {
        return res.send({ success: 400 });
      }
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
      params: { company_idx, contract_possibility },
      loginUser: user_idx,
    } = req;

    try {
      const checkResult = await checkUserCompany(company_idx, user_idx);
      if (checkResult == false) {
        return res.send({ success: 400 });
      }
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
