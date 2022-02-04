const db = require('../model/db');
const { makeSpreadArray } = require('../lib/functions');
const { sequelize } = require('../model/db');
module.exports = {
  getUserProfile: async (req, res) => {
    try {
      let result = await db.sequelize
        .query(
          `SELECT user.idx, personal_code, user_phone, user_email, user_name, planIdx FROM user LEFT JOIN userCompany ON user.idx = userCompany.user_idx 
          LEFT JOIN plan ON userCompany.company_idx = plan.company_idx
          WHERE user.idx = ${req.user_idx}`
        )
        .spread((r) => {
          return makeSpreadArray(r);
        });
      return res.send({ success: 200, result });
    } catch (err) {
      const Err = err.message;
      await db.err.create({ err: Err });
      return res.send({ success: 500, Err });
    }
  },
  getCompanyProfile: async (req, res) => {
    let result = await db.sequelize
      .query(
        `SELECT company_name, company_subdomain, address, detail_address, business_number, business_enrollment, user_name FROM userCompany 
        LEFT JOIN company ON userCompany.company_idx = company.idx 
        LEFT JOIN user ON company.huidx = user.idx
        WHERE userCompany.user_idx = ${req.user_idx}
     `
      )
      .spread((r) => {
        return makeSpreadArray(r);
      });

    return res.send({ success: 200, result });
  },
};
