const db = require('../model/db');
const { makeArray } = require('./functions');
const bcrypt = require('bcrypt');
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

  joinFunction: async (user_data) => {
    try {
      let phoneCheck = await db.user
        .findAll({ where: { user_phone: user_data.user_phone } })
        .then((r) => {
          return makeArray(r);
        });

      if (phoneCheck.length > 0) {
        return {
          success: false,
          message: '이미 존재하는 계정',
        };
      } else {
        user_data.personal_code = Math.random().toString(36).substr(2, 11);
        // 비밀번호 암호화
        const hashResult = await bcrypt.hash(
          user_data.user_password,
          parseInt(process.env.SALT)
        );
        user_data.user_password = hashResult;
        const createUserResult = await db.user.create(user_data);

        return {
          success: true,
          createUserResult,
        };
      }
    } catch (err) {
      console.log(err);
      const Err = err.message;
      return {
        success: false,
        message: Err,
      };
    }
  },
};
