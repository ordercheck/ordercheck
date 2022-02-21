const db = require('../model/db');
const { makeSpreadArray } = require('../lib/functions');
const { sequelize } = require('../model/db');
const { getFileName } = require('../lib/apiFunctions');
const { delFile } = require('../lib/aws/fileupload').ufile;
module.exports = {
  getUserProfile: async (req, res) => {
    try {
      let userProfile = await db.sequelize
        .query(
          `SELECT user.idx, personal_code, user_phone, user_email, user_name, plan, 
          date_format(user.createdAt, '%Y.%m.%d') as createdAt
         FROM user LEFT JOIN userCompany ON user.idx = userCompany.user_idx 
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
  changeCompanyLogo: async (req, res, next) => {
    const { company_idx, user_idx, body, file } = req;
    const updateCompanyLogo = async (logoUrlData, logoTitleData) => {
      await db.company.update(
        {
          company_logo: logoUrlData,
          company_logo_title: logoTitleData,
        },
        { where: { idx: company_idx } }
      );
    };
    try {
      const findCompanyResult = await db.company.findByPk(company_idx, {
        attributes: ['company_logo_title'],
      });
      // 로고를 새로 업로드 하는 경우
      if (!findCompanyResult.company_logo_title) {
        const file_name = getFileName(file.transforms[0].key);
        await updateCompanyLogo(file.transforms[0].location, file_name);
      }
      // 로고를 삭제하는 경우
      if (!file) {
        delFile(findCompanyResult.company_logo_title, 'ordercheck/logo');
        await updateCompanyLogo(null, null);
      }
      // 로고를 바꾸는 경우
      if (findCompanyResult.company_logo_title) {
        delFile(findCompanyResult.company_logo_title, 'ordercheck/logo');
        const file_name = getFileName(file.transforms[0].key);
        await updateCompanyLogo(file.transforms[0].location, file_name);
      }
      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },
};
