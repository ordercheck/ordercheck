const { checkPage, addUserId } = require("../lib/apiFunctions");
const { changeDate, makePureText, isEmptyObj } = require("../lib/apiFunctions");
const db = require("../model/db");
const { Op } = require("sequelize");
const { sortElements, giveNumbering } = require("../lib/checkData");
const { customerAttributes } = require("../lib/attributes");
// 0이 오름차순,1이 내림차순 (ASC는 오름차순)
module.exports = {
  Filter: async (req, res, next) => {
    let {
      body: { date, status, contract_possibility, userId, confirm },
      query: { No, Name, Address, Date, PhoneNumber },
      params: { limit, page },
      company_idx,
    } = req;

    const checkAllCustomers = await db.customer.count({
      where: { company_idx, deleted: null },
    });
    let existCustomers;
    if (checkAllCustomers == 0) {
      existCustomers = false;
    } else {
      existCustomers = true;
    }
    if (
      (userId && userId.length == 0) ||
      date == "" ||
      status.length == 0 ||
      contract_possibility.length == 0
    ) {
      // userId가 빈 배열일 때
      return res.send({
        success: 200,
        totalUser: 0,
        existCustomers,
        findResult: confirm ? [] : 0,
        totalPage: 1,
      });
    }
    const { firstDate, secondDate } = changeDate(date);
    const { start, intlimit, intPage } = await checkPage(
      limit,
      page,
      company_idx
    );

    let countArr;
    let countPossibility;
    let contractPerson;
    const countCustomers = async (
      statusData,
      contractData,
      contractPersonData
    ) => {
      if (!contractPersonData) {
        const countCustomersResult = await db.customer.count({
          where: {
            deleted: null,
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
            deleted: null,
            company_idx,
            createdAt: { [Op.between]: [firstDate, secondDate] },
            status: {
              [Op.or]: statusData,
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
        Date,
        PhoneNumber
      );

      if (!contractPersonData) {
        let findAndCountAllFilterdCustomers = await db.customer.findAndCountAll(
          {
            where: {
              deleted: null,
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
                model: db.userCompany,
                where: { active: true, standBy: false },
                required: false,
                as: "user",
                attributes: [
                  ["user_idx", "idx"],
                  ["searchingName", "user_name"],
                ],
              },
            ],
            attributes: customerAttributes,
            offset: start,
            limit: intlimit,
            order: [[sortField, sort]],
            raw: true,
            nest: true,
          }
        );

        const { customerNumber } = giveNumbering(
          findAndCountAllFilterdCustomers.count,
          intPage,
          intlimit,
          No,
          Name,
          Address,
          Date,
          PhoneNumber
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
              deleted: null,
              company_idx,
              createdAt: { [Op.between]: [firstDate, secondDate] },
              status: {
                [Op.or]: statusData,
              },
              contract_possibility: {
                [Op.or]: contractData,
              },
              contact_person: {
                [Op.or]: contractPersonData,
              },
            },
            include: [
              {
                model: db.userCompany,
                where: { active: true, standBy: false },
                as: "user",
                attributes: ["idx", ["searchingName", "user_name"]],
              },
            ],
            attributes: customerAttributes,
            offset: start,
            limit: intlimit,
            order: [[sortField, sort]],
            raw: true,
            nest: true,
          }
        );

        const { customerNumber } = giveNumbering(
          findAndCountAllFilterdCustomers.count,
          intPage,
          intlimit,
          No,
          Name,
          Address,
          Date,
          PhoneNumber
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
      console.log(userId);
      userId[userId.indexOf(0)] = null;
      contractPerson = userId;
      console.log(userId);
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
      totalUser: confirm
        ? logicResult.findAndCountAllFilterdCustomers.count
        : logicResult,
      Page: intPage,
      existCustomers,
      totalPage: Math.ceil(
        confirm
          ? logicResult.findAndCountAllFilterdCustomers.count / intlimit
          : logicResult / intlimit
      ),
    });
  },

  searchCustomer: async (req, res, next) => {
    let {
      query: { search, No, Name, Address, Date, PhoneNumber },
      params: { limit, page },
      company_idx,
    } = req;
    try {
      const pureText = search
        .replace(/[. ]/g, "")
        .replace(/[\{\}\[\]\/?,;:|\*~`!^\-_+┼<>@\#$%&\'\"\\\=]/gi, "disjcn");

      if (pureText == "") {
        return res.send({
          success: 200,
          customerData: [],
          page: 1,
          totalUser: 0,
          totalPage: 0,
        });
      }
      const { start, intlimit, intPage } = await checkPage(
        limit,
        page,
        company_idx
      );

      const { sortField, sort, addminus } = sortElements(
        No,
        Name,
        Address,
        Date,
        PhoneNumber
      );

      let searchedCountAndFindAll = await db.customer.findAndCountAll({
        where: {
          deleted: null,
          company_idx,
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
            model: db.userCompany,
            where: { active: true, standBy: false },
            required: false,
            as: "user",
            attributes: ["idx", ["searchingName", "user_name"]],
          },
        ],
        attributes: customerAttributes,
        order: [[sortField, sort]],
        offset: start,
        limit: intlimit,
        raw: true,
        nest: true,
      });

      const { customerNumber } = giveNumbering(
        searchedCountAndFindAll.count,
        intPage,
        intlimit,
        No,
        Name,
        Address,
        Date,
        PhoneNumber
      );

      const customerData = addUserId(
        searchedCountAndFindAll.rows,
        addminus,
        customerNumber
      );
      return res.send({
        success: 200,
        customerData,
        page: intPage,
        totalUser: searchedCountAndFindAll.count,
        totalPage: Math.ceil(searchedCountAndFindAll.count / intlimit),
      });
    } catch (err) {
      next(err);
    }
  },
};
