const db = require("../model/db");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
const { createToken } = require("../lib/jwtfunctions");
const { Op } = require("sequelize");

const { makeSpreadArray } = require("../lib/functions");
module.exports = {
  joinDoCustomer: async (req, res, next) => {
    const { body } = req;
    const createCustomerAccountResult = await db.customerAccount.create(body);
    const loginToken = await createToken({
      user_idx: createCustomerAccountResult.idx,
    });
    return res.send({ success: 200, loginToken });
  },
  getHomeData: async (req, res, next) => {
    const { customer_phoneNumber, customer_account_idx } = req;

    let companyProfile = await db.sequelize
      .query(
        `
      SELECT  company_logo, consulting.createdAt, company_name, 
      FROM consulting 
      LEFT JOIN company ON consulting.company_idx = company.idx
      WHERE customer_phoneNumber = "${customer_phoneNumber}"`
      )

      .spread((r) => {
        return makeSpreadArray(r);
      });

    return res.send({ success: 200, totalConsulting: companyProfile });
  },

  loginMyPage: async (req, res, next) => {
    const { customer_phoneNumber } = req.body;
    const checkCustomer = await db.customerAccount.findOne({
      where: { customer_phoneNumber },
    });

    if (!checkCustomer) {
      return res.send({ success: 400, message: "없는 전화번호 입니다." });
    }
    const loginToken = await createToken({
      user_idx: checkCustomer.idx,
    });

    return res.send({ success: 200, loginToken });
  },
};
