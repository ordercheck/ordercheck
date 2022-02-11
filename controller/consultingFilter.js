const {
  checkUserCompany,
  checkPage,
  addUserId,
} = require('../lib/apiFunctions');
const { changeDate } = require('../lib/apiFunctions');
const db = require('../model/db');
const { Op } = require('sequelize');
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
      let customerNumber = intPage * intlimit - (intlimit - 1);
      let sortField;
      let sort;
      let addminus;
      const countCustomersResultData = await countCustomers(
        activeData,
        contractData,
        contractPersonData
      );

      if (!No && !Name && !Address && !Date) {
        (sortField = 'createdAt'), (sort = 'DESC'), (addminus = 'plus');
      }
      if (No == 0) {
        (sortField = 'createdAt'),
          (sort = 'ASC'),
          (customerNumber =
            countCustomersResultData - intlimit * intPage + intlimit);
        addminus = 'minus';
      }
      if (No == 1) {
        (sortField = 'createdAt'), (sort = 'DESC'), (addminus = 'plus');
      }

      if (Name == 0) {
        (sortField = 'customer_name'),
          (sort = 'ASC'),
          (customerNumber =
            countCustomersResultData - intlimit * intPage + intlimit);
        addminus = 'minus';
      }

      if (Name == 1) {
        (sortField = 'customer_name'), (sort = 'DESC'), (addminus = 'plus');
      }

      if (Address == 0) {
        (sortField = 'searchingAddress'),
          (sort = 'ASC'),
          (customerNumber =
            countCustomersResultData - intlimit * intPage + intlimit);
        addminus = 'minus';
      }
      if (Address == 1) {
        (sortField = 'searchingAddress'), (sort = 'DESC'), (addminus = 'plus');
      }
      if (Date == 0) {
        (sortField = 'createdAt'),
          (sort = 'ASC'),
          (customerNumber =
            countCustomersResultData - intlimit * intPage + intlimit);
        addminus = 'minus';
      }

      if (Date == 1) {
        (sortField = 'createdAt'), (sort = 'DESC'), (addminus = 'plus');
      }

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
        order: [[sortField, sort]],
        raw: true,
      });

      findUsersData = addUserId(findUsersData, addminus, customerNumber);

      return { countCustomersResultData, findUsersData };
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
      findResult: logicResult.findUsersData,
      totalUser: logicResult.countCustomersResultData,
      Page: intPage,
      totalPage: Math.ceil(logicResult.countCustomersResultData / intlimit),
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

      let countCustomersResultData = await db.customer.count({
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
      });

      let customerNumber = intPage * intlimit - (intlimit - 1);
      let sortField;
      let sort;
      let addminus;

      if (!No && !Name && !Address && !Date) {
        (sortField = 'createdAt'), (sort = 'DESC'), (addminus = 'plus');
      }
      if (No == 0) {
        (sortField = 'createdAt'),
          (sort = 'ASC'),
          (customerNumber =
            countCustomersResultData - intlimit * intPage + intlimit);
        addminus = 'minus';
      }
      if (No == 1) {
        (sortField = 'createdAt'), (sort = 'DESC'), (addminus = 'plus');
      }

      if (Name == 0) {
        (sortField = 'customer_name'),
          (sort = 'ASC'),
          (customerNumber =
            countCustomersResultData - intlimit * intPage + intlimit);
        addminus = 'minus';
      }

      if (Name == 1) {
        (sortField = 'customer_name'), (sort = 'DESC'), (addminus = 'plus');
      }

      if (Address == 0) {
        (sortField = 'searchingAddress'),
          (sort = 'ASC'),
          (customerNumber =
            countCustomersResultData - intlimit * intPage + intlimit);
        addminus = 'minus';
      }
      if (Address == 1) {
        (sortField = 'searchingAddress'), (sort = 'DESC'), (addminus = 'plus');
      }
      if (Date == 0) {
        (sortField = 'createdAt'),
          (sort = 'ASC'),
          (customerNumber =
            countCustomersResultData - intlimit * intPage + intlimit);
        addminus = 'minus';
      }

      if (Date == 1) {
        (sortField = 'createdAt'), (sort = 'DESC'), (addminus = 'plus');
      }

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
        order: [[sortField, sort]],
        offset: start,
        limit: intlimit,
        raw: true,
      });

      searchedUsers = addUserId(searchedUsers, addminus, customerNumber);
      return res.send({
        success: 200,
        searchedUsers,
        page: intPage,
        totalPage: Math.ceil(countCustomersResultData / limit),
      });
    } catch (err) {
      next(err);
    }
  },
};
