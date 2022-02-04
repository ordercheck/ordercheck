const db = require('../model/db');
const { makeSpreadArray } = require('../lib/functions');
const { sequelize } = require('../model/db');
const { errorFunction } = require('../lib/apiFunctions');
module.exports = {
  getUserProfile: async (req, res) => {
    try {
      let userProfile = await db.sequelize
        .query(
          `SELECT user.idx, personal_code, user_phone, user_email, user_name, plan FROM user LEFT JOIN userCompany ON user.idx = userCompany.user_idx 
          LEFT JOIN plan ON userCompany.company_idx = plan.company_idx
          WHERE user.idx = ${req.user_idx}`
        )
        .spread((r) => {
          return makeSpreadArray(r);
        });
      return res.send({ success: 200, userProfile: userProfile[0] });
    } catch (err) {
      errorFunction(err);
      return res.send({ success: 500, message: err.message });
    }
  },
  getCompanyProfile: async (req, res, next) => {
    try {
      let companyProfile = await db.sequelize
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

      return res.send({ success: 200, companyProfile: companyProfile[0] });
    } catch (err) {
      next(err);
    }
  },
};
