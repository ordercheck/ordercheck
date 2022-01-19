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

  changeDate: (date) => {
    date = date.replace(/ /gi, '').split('-');
    const firstDate = new Date(date[0].replace(/\./gi, '-'));
    const secondDate = new Date(date[1].replace(/\./gi, '-'));
    firstDate.setDate(firstDate.getDate());
    secondDate.setDate(secondDate.getDate() + 1);
    return { firstDate, secondDate };
  },
};
