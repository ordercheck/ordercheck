const db = require("../model/db");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
const { createToken } = require("../lib/jwtfunctions");
const { showMyPageDetailConsultingAttributes } = require("../lib/attributes");
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
    const {
      customer_phoneNumber,
      query: { sort },
    } = req;

    let sortList;

    const sortOB = {
      0: "consulting.createdAt DESC",
      1: "consulting.createdAt ASC",
      2: "company.company_name DESC",
    };

    sortList = sortOB[+sort];

    let findResult = await db.sequelize
      .query(
        `
    SELECT consulting.idx as consulting_idx, company_logo, 
     CASE
     WHEN 
     ABS(TIMESTAMPDIFF(second, '${moment().format(
       "YYYY-MM-DD HH:mm:ss"
     )}', date_format(consulting.createdAt, '%Y-%m-%d %H:%i:%s'))) < 60
	   THEN CONCAT(
      ABS(TIMESTAMPDIFF(second, '${moment().format(
        "YYYY-MM-DD HH:mm"
      )}', date_format(consulting.createdAt, '%Y-%m-%d %H:%i:%s')))
 , '초 전')

	   WHEN 
     ABS(TIMESTAMPDIFF(minute, '${moment().format(
       "YYYY-MM-DD HH:mm"
     )}', date_format(consulting.createdAt, '%Y-%m-%d %H:%i'))) < 24
	   THEN CONCAT(
      ABS(TIMESTAMPDIFF(minute, '${moment().format(
        "YYYY-MM-DD HH:mm"
      )}', date_format(consulting.createdAt, '%Y-%m-%d %H:%i')))
 , '분 전')

	   WHEN ABS(TIMESTAMPDIFF(year, '${moment().format(
       "YYYY-MM-DD"
     )}', date_format(consulting.createdAt, '%Y-%m-%d'))) > 0
	   THEN date_format(consulting.createdAt, '%Y.%m.%d')
     ELSE date_format(consulting.createdAt, '%c월 %e일')
     END AS createdAt,

      company_name, formTitle, customerConfirm, company.deleted
      FROM customer 
      LEFT JOIN company ON customer.company_idx = company.idx
      INNER JOIN consulting ON consulting.customer_idx = customer.idx
      WHERE searchingPhoneNumber = "${customer_phoneNumber}"
      ORDER BY ${sortList}
      `
      )
      .spread((r) => {
        return makeSpreadArray(r);
      });

    res.send({ success: 200, findResult });
    //  보여주고 나서 나머지 상담 신청폼 모두 확인 처리

    const updateArr = [];
    findResult.forEach((data) => {
      console.log(data);
      if (data.customerConfirm == 0) {
        updateArr.push(data.consulting_idx);
      }
    });

    db.consulting.update(
      { customerConfirm: true },
      {
        where: {
          idx: updateArr,
        },
      }
    );
  },

  checkCustomer: async (req, res, next) => {
    const { customer_phoneNumber } = req.body;
    const checkCustomer = await db.customerAccount.findOne({
      where: { customer_phoneNumber, deleted: null },
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
    const findResult = await db.consulting.findByPk(consulting_idx, {
      attributes: showMyPageDetailConsultingAttributes,
    });
    findResult.floor_plan = JSON.parse(findResult.floor_plan);
    findResult.hope_concept = JSON.parse(findResult.hope_concept);
    return res.send({ success: 200, findResult });
  },
  getCalculateList: async (req, res, next) => {
    const {
      customer_phoneNumber,
      query: { sort },
    } = req;

    const sortOB = {
      0: "calculate.createdAt DESC",
      1: "calculate.createdAt ASC",
      2: "REPLACE(calculate.predicted_price, ',', '') DESC",
      3: "REPLACE(calculate.predicted_price, ',', '') ASC",
    };

    sortList = sortOB[+sort];

    let findResult = await db.sequelize
      .query(
        `
    SELECT company_name, calNumber, predicted_price, customerConfirm, calculate.idx as calculate_idx, 
    favorites_customer_account_idx,
    company.idx as company_idx, 
    
    CASE
    WHEN 
    ABS(TIMESTAMPDIFF(second, '${moment().format(
      "YYYY-MM-DD HH:mm:ss"
    )}', date_format(calculate.createdAt, '%Y-%m-%d %H:%i:%s'))) < 60
    THEN CONCAT(
     ABS(TIMESTAMPDIFF(second, '${moment().format(
       "YYYY-MM-DD HH:mm"
     )}', date_format(calculate.createdAt, '%Y-%m-%d %H:%i:%s')))
, '초 전')


    WHEN 
    ABS(TIMESTAMPDIFF(minute, '${moment().format(
      "YYYY-MM-DD HH:mm"
    )}', date_format(calculate.createdAt, '%Y-%m-%d %H:%i'))) < 24
    THEN CONCAT(
      ABS(TIMESTAMPDIFF(minute, '${moment().format(
        "YYYY-MM-DD HH:mm"
      )}', date_format(calculate.createdAt, '%Y-%m-%d %H:%i')))
 , '분 전')

    WHEN  ABS(TIMESTAMPDIFF(year, '${moment().format(
      "YYYY-MM-DD"
    )}', date_format(calculate.createdAt, '%Y-%m-%d'))) > 0
    THEN date_format(calculate.createdAt, '%Y.%m.%d')
  
    ELSE date_format(calculate.createdAt, '%c월 %e일')
    END AS createdAt,
  
    company.deleted
    FROM customer 
    INNER JOIN calculate ON customer.idx = calculate.customer_idx
    LEFT JOIN company ON calculate.company_idx = company.idx
    WHERE searchingPhoneNumber = "${customer_phoneNumber}"
    ORDER BY ${sortList}
    `
      )
      .spread((r) => {
        return makeSpreadArray(r);
      });

    res.send({ success: 200, findResult });

    const updateArr = [];
    findResult.forEach((data) => {
      if (data.customerConfirm == 0) {
        updateArr.push(data.consulting_idx);
      }
    });

    db.calculate.update(
      { customerConfirm: true },
      { where: { idx: updateArr } }
    );
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
    const {
      customer_account_idx,
      query: { sort },
    } = req;
    const sortOB = {
      0: "calculate.createdAt DESC",
      1: "calculate.createdAt ASC",
      2: "REPLACE(calculate.predicted_price, ',', '') DESC",
      3: "REPLACE(calculate.predicted_price, ',', '') ASC",
    };

    sortList = sortOB[+sort];
    let findResult = await db.sequelize
      .query(
        `
  SELECT company_logo, company_name, calNumber, predicted_price, customerConfirm, 
  calculate.idx as calculate_idx, company.idx as company_idx,

  CASE
  WHEN 
  ABS(TIMESTAMPDIFF(second, '${moment().format(
    "YYYY-MM-DD HH:mm:ss"
  )}', date_format(calculate.createdAt, '%Y-%m-%d %H:%i:%s'))) < 60
  THEN CONCAT(
   ABS(TIMESTAMPDIFF(second, '${moment().format(
     "YYYY-MM-DD HH:mm"
   )}', date_format(calculate.createdAt, '%Y-%m-%d %H:%i:%s')))
, '초 전')

  WHEN 
  ABS(TIMESTAMPDIFF(minute, '${moment().format(
    "YYYY-MM-DD HH:mm"
  )}', date_format(calculate.createdAt, '%Y-%m-%d %H:%i'))) < 24
  THEN CONCAT(
    ABS(TIMESTAMPDIFF(minute, '${moment().format(
      "YYYY-MM-DD HH:mm"
    )}', date_format(calculate.createdAt, '%Y-%m-%d %H:%i')))
, '분 전')

  WHEN  ABS(TIMESTAMPDIFF(year, '${moment().format(
    "YYYY-MM-DD"
  )}', date_format(calculate.createdAt, '%Y-%m-%d'))) > 0
  THEN date_format(calculate.createdAt, '%Y.%m.%d')

  ELSE date_format(calculate.createdAt, '%c월 %e일')
  END AS createdAt,
  company.deleted
  FROM calculate 
  LEFT JOIN company ON calculate.company_idx = company.idx
  WHERE favorites_customer_account_idx = ${customer_account_idx}
  ORDER BY ${sortList}
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

    try {
      const findResult = await db.calculate.findByPk(calculate_idx, {
        include: [
          {
            model: db.company,
          },
        ],
      });
      if (!findResult) {
        return res.send({ success: 400, message: "해당 견적서가 없습니다." });
      }
      let calculateList = await db.sequelize
        .query(
          `
          SELECT calculateNumber, calculate.idx as calculate_idx, 

          CASE
          WHEN 
          ABS(TIMESTAMPDIFF(second, '${moment().format(
            "YYYY-MM-DD HH:mm:ss"
          )}', date_format(calculate.createdAt, '%Y-%m-%d %H:%i:%s'))) < 60
          THEN CONCAT(
           ABS(TIMESTAMPDIFF(second, '${moment().format(
             "YYYY-MM-DD HH:mm"
           )}', date_format(calculate.createdAt, '%Y-%m-%d %H:%i:%s')))
      , '초 전')
  
          WHEN 
          ABS(TIMESTAMPDIFF(minute, '${moment().format(
            "YYYY-MM-DD HH:mm"
          )}', date_format(calculate.createdAt, '%Y-%m-%d %H:%i'))) < 24
          THEN CONCAT(
            ABS(TIMESTAMPDIFF(minute, '${moment().format(
              "YYYY-MM-DD HH:mm"
            )}', date_format(calculate.createdAt, '%Y-%m-%d %H:%i')))
       , '분 전')
      
          WHEN  ABS(TIMESTAMPDIFF(year, '${moment().format(
            "YYYY-MM-DD"
          )}', date_format(calculate.createdAt, '%Y-%m-%d'))) > 0
          THEN date_format(calculate.createdAt, '%Y.%m.%d')

          ELSE date_format(calculate.createdAt, '%c월 %e일')
          END AS createdAt
          FROM customer 
          INNER JOIN calculate ON customer.idx = calculate.customer_idx  AND calculate.company_idx = ${
            findResult.company_idx
          } 
          WHERE searchingPhoneNumber = "${customer_phoneNumber}"
          ORDER BY calculate.createdAt DESC
  `
        )
        .spread((r) => {
          return makeSpreadArray(r);
        });

      return res.send({ success: 200, findResult, calculateList });
    } catch (err) {
      next(err);
    }
  },
  getCustomerProfile: async (req, res, next) => {
    const { customer_account_idx, customer_phoneNumber } = req;
    try {
      const userProfile = await db.customerAccount.findByPk(
        customer_account_idx
      );

      let consultingConfirm = await db.sequelize
        .query(
          `
      SELECT customerConfirm
      FROM customer 
      INNER JOIN consulting ON consulting.customer_idx = customer.idx AND customerConfirm = false
      WHERE searchingPhoneNumber = "${customer_phoneNumber}"
      `
        )
        .spread((r) => {
          return makeSpreadArray(r);
        });

      let calculateConfirm = await db.sequelize
        .query(
          `
      SELECT customerConfirm
      FROM customer 
      INNER JOIN calculate ON customer.idx = calculate.customer_idx AND customerConfirm = false
      WHERE searchingPhoneNumber = "${customer_phoneNumber}"
      `
        )
        .spread((r) => {
          return makeSpreadArray(r);
        });

      let newConsulting;
      let newCalculate;
      if (consultingConfirm.length == 0) {
        newConsulting = false;
      } else {
        newConsulting = true;
      }

      if (calculateConfirm.length == 0) {
        newCalculate = false;
      } else {
        newCalculate = true;
      }
      userProfile.dataValues.newConsulting = newConsulting;
      userProfile.dataValues.newCalculate = newCalculate;

      return res.send({
        success: 200,
        userProfile,
      });
    } catch (err) {
      next(err);
    }
  },
  changeCustomerName: async (req, res, next) => {
    const {
      customer_account_idx,
      body: { customer_name },
    } = req;
    try {
      await db.customerAccount.update(
        { customer_name },
        {
          where: {
            idx: customer_account_idx,
          },
        }
      );
      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },
  delCustomer: async (req, res, next) => {
    const { customer_account_idx } = req;
    await db.customerAccount.update(
      { deleted: moment() },
      {
        where: {
          idx: customer_account_idx,
        },
      }
    );
    return res.send({ success: 200 });
  },
};
