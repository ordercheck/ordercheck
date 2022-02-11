const {
  checkUserCompany,
  checkPage,
  addUserId,
} = require('../lib/apiFunctions');
const { changeDate } = require('../lib/apiFunctions');
const db = require('../model/db');
const { Op } = require('sequelize');
const { customerAttributes } = require('../lib/attributes');

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
      const { countCustomersResult } = await countCustomers(
        activeData,
        contractData,
        contractPersonData
      );
      let findUsersData = await db.customer.findAll({
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
        order: [['createdAt', 'DESC']],
        raw: true,
      });

      findUsersData = addUserId(
        findUsersData,
        'plus',
        page * limit - (limit - 1)
      );

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

    const { countCustomersResult, findUsersData } = !confirm
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
      findResult: findUsersData,
      totalUser: countCustomersResult,
      Page: intPage,
      totalPage: Math.ceil(countCustomersResult / limit),
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

      let searchedUsers = await db.customer.findAll({
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
        raw: true,
      });

      searchedUsers = addUserId(
        searchedUsers,
        'plus',
        intPage * intlimit - (intlimit - 1)
      );
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
