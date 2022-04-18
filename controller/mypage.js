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
  getConsultList: async (req, res, next) => {
    const { customer_phoneNumber } = req;

    let companyProfile = await db.sequelize
      .query(
        `
      SELECT consulting.idx, company_logo, consulting.createdAt, company_name, formTitle, customerConfirm
      FROM consulting 
      LEFT JOIN company ON consulting.company_idx = company.idx
      WHERE customer_phoneNumber = "${customer_phoneNumber}"
      ORDER BY consulting.createdAt DESC;
      `
      )
      .spread((r) => {
        return makeSpreadArray(r);
      });

    res.send({ success: 200, totalConsulting: companyProfile });
    //  보여주고 나서 나머지 상담 신청폼 모두 확인 처리
    db.consulting.update(
      { customerConfirm: true },
      {
        where: {
          customer_phoneNumber,
          customerConfirm: false,
        },
      }
    );
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
  getDetailConsulting: async (req, res, next) => {
    const { consulting_idx } = req.params;
    const findResult = await db.consulting.findByPk(consulting_idx);
    return res.send({ success: 200, findResult });
  },
  getCalculateList: async (req, res, next) => {
    const { customer_phoneNumber } = req;

    let companyProfile = await db.sequelize
      .query(
        `
    SELECT company_name, 
    FROM customer 
    LEFT JOIN calculate ON customer.idx = calculate.customer_idx
    LEFT JOIN company ON calculate.company_idx = company.idx
    WHERE customer_phoneNumber = "${customer_phoneNumber}"
    `
      )
      .spread((r) => {
        return makeSpreadArray(r);
      });

    return res.send({ success: 200, companyProfile });
  },
};
