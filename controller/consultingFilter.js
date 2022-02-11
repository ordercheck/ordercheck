const { checkUserCompany, checkPage } = require('../lib/apiFunctions');
const { changeDate } = require('../lib/apiFunctions');
const db = require('../model/db');
const { Op } = require('sequelize');
const { customerAttributes } = require('../lib/attributes');
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
      params: { limit, page },
      company_idx,
    } = req;

    const { firstDate, secondDate } = changeDate(date);

    const { start, intlimit, intPage } = await checkPage(
      limit,
      page,
      company_idx
    );

    let countArr = [0, 1];
    let countPossibility = [0, 1];
    let contractPerson = null;

    const countCustomers = async (
      activeData,
      contractData,
      contractPersonData
    ) => {
      const countCustomersResult = await db.customer.count({
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
      return { countCustomersResult };
    };
    const findCustomers = async (
      activeData,
      contractData,
      contractPersonData,
      intlimit,
      start
    ) => {
      const countCustomersResult = await countCustomers(
        activeData,
        contractData,
        contractPersonData
      );
      const findUsersData = await db.customer.findAll({
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
        attributes: customerAttributes,
        offset: start,
        limit: intlimit,
      });
      return { countCustomersResult, findUsersData };
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

    const result = !confirm
      ? await countCustomers(countArr, countPossibility, contractPerson)
      : await findCustomers(
          countArr,
          countPossibility,
          contractPerson,
          intlimit,
          start
        );

    return res.send({
      success: 200,
      findResult: result.findUsersData,
      totalUser: result.countCustomersResult,
      Page: intPage,
      totalPage: Math.ceil(result.countCustomersResult / limit),
    });
  },

  searchCustomer: async (req, res, next) => {
    let {
      query: { search },
      params: { limit, page },
      company_idx,
    } = req;
    try {
      const pureText = search.replace(
        /[ \{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\ '\"\\(\=]/gi,
        ''
      );

      const { totalData, start, intlimit, intPage } = await checkPage(
        limit,
        page,
        company_idx
      );

      const searchedUsers = await db.customer.findAll({
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
        attributes: customerAttributes,

        order: [['createdAt', 'DESC']],
        offset: start,
        limit: intlimit,
      });
      return res.send({
        success: 200,
        searchedUsers,
        page: intPage,
        totalPage: Math.ceil(totalData / limit),
      });
    } catch (err) {
      next(err);
    }
  },
};
