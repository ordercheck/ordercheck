const { checkUserCompany, errorFunction } = require('../lib/apiFunctions');
const { changeDate } = require('../lib/apiFunctions');
const db = require('../model/db');
const { Op } = require('sequelize');
// 받은 params를 sequelize or형태에 맞게 만들어주는 함수
const makeArrforFilter = (data, status) => {
  const countArr = data.map((el) => {
    el = { [status]: el };
    return el;
  });
  return countArr;
};
module.exports = {
  Filter: async (req, res, next) => {
    let {
      body: { date, active, contract_possibility, userId, confirm },
      company_idx,
    } = req;

    const { firstDate, secondDate } = changeDate(date);

    let countArr = [0, 1];
    let countPossibility = [0, 1];
    let contractPerson = null;

    const findCustomers = async (
      data,
      activeData,
      contractData,
      contractPersonData
    ) => {
      const result = await db.customer[data]({
        where: {
          company_idx,
          createdAt: { [Op.between]: [firstDate, secondDate] },
          active: {
            [Op.or]: activeData,
          },
          contract_possibility: {
            [Op.or]: contractData,
          },
          contact_person: {
            [Op.or]: contractPersonData,
          },
        },
      });

      return result;
    };

    if (active) {
      countArr = active;
    }

    if (contract_possibility) {
      countPossibility = contract_possibility;
    }

    if (userId) {
      contractPerson = userId;
    }

    const result = confirm
      ? await findCustomers(
          'findAll',
          countArr,
          countPossibility,
          contractPerson
        )
      : await findCustomers(
          'count',
          countArr,
          countPossibility,
          contractPerson
        );

    return res.send({ success: 200, findResult: result });
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
    try {
      const pureText = req.query.search.replace(
        /[ \{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\ '\"\\(\=]/gi,
        ''
      );
      console.log(pureText);
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
        attributes: [
          ['idx', 'userId'],
          'customer_name',
          'customer_phoneNumber',
          'address',
          'detail_address',
          'active',
          'contract_possibility',
          'contact_person',
          [
            db.sequelize.fn(
              'date_format',
              db.sequelize.col('createdAt'),
              '%Y.%m.%d'
            ),
            'createdAt',
          ],
        ],
      });
      return res.send({ success: 200, result });
    } catch (err) {
      next(err);
    }
  },
};
