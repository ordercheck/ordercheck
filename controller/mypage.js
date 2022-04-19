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

    let findResult = await db.sequelize
      .query(
        `
      SELECT consulting.idx as consulting_idx, company_logo, consulting.createdAt, company_name, formTitle, customerConfirm
      FROM consulting 
      LEFT JOIN company ON consulting.company_idx = company.idx
      WHERE customer_phoneNumber = "${customer_phoneNumber}" AND formTitle IS NOT NULL
      ORDER BY consulting.createdAt DESC;
      `
      )
      .spread((r) => {
        return makeSpreadArray(r);
      });

    res.send({ success: 200, findResult });
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

    let findResult = await db.sequelize
      .query(
        `
    SELECT company_name, calNumber, predicted_price, customerConfirm, calculate.idx as calculate_idx, company.idx as company_idx, calculate.createdAt
    FROM customer 
    INNER JOIN calculate ON customer.idx = calculate.customer_idx
    LEFT JOIN company ON calculate.company_idx = company.idx
    WHERE customer_phoneNumber = "${customer_phoneNumber}"
    `
      )
      .spread((r) => {
        return makeSpreadArray(r);
      });

    res.send({ success: 200, findResult });

    findResult.forEach((data) => {
      db.calculate.update(
        { customerConfirm: true },
        { where: { idx: data.calculate_idx } }
      );
    });
  },
  setFavoritesCalculate: (req, res, next) => {
    const {
      body: { calculate_idx },
      customer_account_idx,
    } = req;

    db.calculate.update(
      { favorites_customer_account_idx: customer_account_idx },
      { where: { idx: calculate_idx } }
    );
    return res.send({ success: 200 });
  },
  unsetFavoritesCalculate: (req, res, next) => {
    const {
      body: { calculate_idx },
    } = req;

    db.calculate.update(
      { favorites_customer_account_idx: null },
      { where: { idx: calculate_idx } }
    );

    return res.send({ success: 200 });
  },

  getFavoritesCalculateList: async (req, res, next) => {
    const { customer_account_idx } = req;

    let findResult = await db.sequelize
      .query(
        `
  SELECT company_logo, company_name, calNumber, predicted_price, customerConfirm, calculate.idx as calculate_idx, company.idx as company_idx, calculate.createdAt
  FROM calculate 
  LEFT JOIN company ON calculate.company_idx = company.idx
  WHERE favorites_customer_account_idx = ${customer_account_idx}
  `
      )
      .spread((r) => {
        return makeSpreadArray(r);
      });

    return res.send({ success: 200, findResult });
  },

  getDetailCalculate: async (req, res, next) => {
    const {
      params: { calculate_idx },
      customer_phoneNumber,
    } = req;

    const findResult = await db.calculate.findByPk(calculate_idx);

    let calculateList = await db.sequelize
      .query(
        `
        SELECT calculateNumber, calculate.idx as calculate_idx, calculate.createdAt
        FROM customer 
        INNER JOIN calculate ON customer.idx = calculate.customer_idx  AND calculate.company_idx = ${findResult.company_idx} 
        WHERE customer_phoneNumber = "${customer_phoneNumber}"
`
      )
      .spread((r) => {
        return makeSpreadArray(r);
      });

    return res.send({ success: 200, findResult, calculateList });
  },
};
