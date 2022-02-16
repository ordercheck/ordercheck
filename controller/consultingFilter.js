const {
  checkUserCompany,
  checkPage,
  addUserId,
  changeToJSON,
} = require('../lib/apiFunctions');
const { changeDate } = require('../lib/apiFunctions');
const db = require('../model/db');
const { Op } = require('sequelize');
const { sortElements, giveNumbering } = require('../lib/checkData');
const { customerAttributes } = require('../lib/attributes');
// 0이 오름차순,1이 내림차순 (ASC는 오름차순)
module.exports = {
  Filter: async (req, res, next) => {
    let {
      body: { date, status, contract_possibility, userId, confirm },
      query: { No, Name, Address, Date },
      params: { limit, page },
      company_idx,
    } = req;
    company_idx = 18;
    const { firstDate, secondDate } = changeDate(date);

    const { start, intlimit, intPage } = await checkPage(
      limit,
      page,
      company_idx
    );

    let countArr = [0, 1, 2, 3, 4];
    let countPossibility = [0, 1, 2, 3];
    let contractPerson = null;

    const countCustomers = async (
      statusData,
      contractData,
      contractPersonData
    ) => {
      if (!contractPersonData) {
        const countCustomersResult = await db.customer.count({
          where: {
            company_idx,
            createdAt: { [Op.between]: [firstDate, secondDate] },
            status: {
              [Op.or]: statusData,
            },
            contract_possibility: {
              [Op.or]: contractData,
            },
          },
        });
        return countCustomersResult;
      } else {
        const countCustomersResult = await db.customer.count({
          where: {
            company_idx,
            createdAt: { [Op.between]: [firstDate, secondDate] },
            status: {
              [Op.or]: statusData,
            },
            contract_possibility: {
              [Op.or]: contractData,
            },
            contract_person: {
              [Op.or]: contractPersonData,
            },
          },
        });
        return countCustomersResult;
      }
    };
    const findCustomers = async (
      statusData,
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
      if (!contractPersonData) {
        let findAndCountAllFilterdCustomers = await db.customer.findAndCountAll(
          {
            where: {
              company_idx,
              createdAt: { [Op.between]: [firstDate, secondDate] },
              status: {
                [Op.or]: statusData,
              },
              contract_possibility: {
                [Op.or]: contractData,
              },
            },
            include: [
              {
                model: db.user,
                attributes: ['idx', 'user_name'],
              },
            ],
            attributes: customerAttributes,
            offset: start,
            limit: intlimit,
            order: [[sortField, sort]],
          }
        );

        findAndCountAllFilterdCustomers = changeToJSON(
          findAndCountAllFilterdCustomers
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
      } else {
        let findAndCountAllFilterdCustomers = await db.customer.findAndCountAll(
          {
            where: {
              company_idx,
              createdAt: { [Op.between]: [firstDate, secondDate] },
              status: {
                [Op.or]: statusData,
              },
              contract_possibility: {
                [Op.or]: contractData,
              },
              contract_person: {
                [Op.or]: contractPersonData,
              },
            },
            include: [
              {
                model: db.user,
                attributes: ['idx', 'user_name'],
              },
            ],
            attributes: customerAttributes,
            offset: start,
            limit: intlimit,
            order: [[sortField, sort]],
          }
        );

        findAndCountAllFilterdCustomers = changeToJSON(
          findAndCountAllFilterdCustomers
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
      }
    };
    if (status) {
      countArr = status;
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
      findResult: confirm ? logicResult.findFilteredUsersData : logicResult,
      Page: intPage,
      totalPage: Math.ceil(
        confirm
          ? logicResult.findAndCountAllFilterdCustomers.count / intlimit
          : logicResult / intlimit
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

      let searchedCountAndFindAll = await db.customer.findAndCountAll({
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
        include: [
          {
            model: db.user,
            attributes: ['idx', 'user_name'],
          },
        ],
        attributes: customerAttributes,
        order: [[sortField, sort]],
        offset: start,
        limit: intlimit,
      });

      searchedCountAndFindAll = changeToJSON(searchedCountAndFindAll);

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
