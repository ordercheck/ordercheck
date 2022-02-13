const {
  checkUserCompany,
  checkPage,
  addUserId,
} = require('../lib/apiFunctions');
const { changeDate } = require('../lib/apiFunctions');
const db = require('../model/db');
const { Op } = require('sequelize');
const { sortElements, giveNumbering } = require('../lib/sort');
const { customerAttributes } = require('../lib/attributes');
// 0이 오름차순,1이 내림차순 (ASC는 오름차순)
module.exports = {
  Filter: async (req, res, next) => {
    let {
      body: { date, active, contract_possibility, userId, confirm },
      query: { No, Name, Address, Date },
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

      return countCustomersResult;
    };
    const findCustomers = async (
      activeData,
      contractData,
      contractPersonData,
      intlimit,
      start
    ) => {
      const { sortField, sort, addminus } = sortElements(
        No,
        Name,
        Address,
        Date
      );

      const findAndCountAllFilterdCustomers = await db.customer.findAndCountAll(
        {
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
          order: [[sortField, sort]],
          raw: true,
        }
      );
      const { customerNumber } = giveNumbering(
        findAndCountAllFilterdCustomers.count,
        intPage,
        intlimit,
        No,
        Name,
        Address,
        Date
      );
      const findFilteredUsersData = addUserId(
        findAndCountAllFilterdCustomers.rows,
        addminus,
        customerNumber
      );

      return { findAndCountAllFilterdCustomers, findFilteredUsersData };
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

    const logicResult = !confirm
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
      findResult: logicResult.findFilteredUsersData,

      Page: intPage,
      totalPage: Math.ceil(
        logicResult.findAndCountAllFilterdCustomers.count / intlimit
      ),
    });
  },

  searchCustomer: async (req, res, next) => {
    let {
      query: { search, No, Name, Address, Date },
      params: { limit, page },
      company_idx,
    } = req;
    try {
      const pureText = search.replace(
        /[ \{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\ '\"\\(\=]/gi,
        ''
      );

      const { start, intlimit, intPage } = await checkPage(
        limit,
        page,
        company_idx
      );

      const { sortField, sort, addminus } = sortElements(
        No,
        Name,
        Address,
        Date
      );

      const searchedCountAndFindAll = await db.customer.findAndCountAll({
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
        order: [[sortField, sort]],
        offset: start,
        limit: intlimit,
        raw: true,
      });
      const { customerNumber } = giveNumbering(
        searchedCountAndFindAll.count,
        intPage,
        intlimit,
        No,
        Name,
        Address,
        Date
      );

      const searchedUsers = addUserId(
        searchedCountAndFindAll.rows,
        addminus,
        customerNumber
      );
      return res.send({
        success: 200,
        searchedUsers,
        page: intPage,
        totalPage: Math.ceil(searchedCountAndFindAll.count / intlimit),
      });
    } catch (err) {
      next(err);
    }
  },
};
