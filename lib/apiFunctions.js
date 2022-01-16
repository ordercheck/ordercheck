const db = require('../model/db');
module.exports = {
  // 필터링 유저 체크
  checkUserCompany: async (company_idx, user_idx) => {
    const checkResult = await db.userCompany.findOne({
      where: { company_idx, user_idx },
      attributes: ['authority'],
    });

    if (!checkResult) {
      return false;
    }
    return checkResult;
  },
};
