const db = require('../model/db');
const { makeArray } = require('./functions');
const _f = require('./functions');
let { masterConfig } = require('../lib/standardTemplate');

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
  errorFunction: async (err) => {
    console.log(err);

    const Err = err.message;
    await db.err.create({ err: Err });
  },
  findWhiteFormDetail: async (company_idx, formId) => {
    const whiteCheck = await db.plan.findOne({
      where: { company_idx: company_idx },
      attributes: ['whiteLabelChecked'],
    });

    const formDetail = await db.formLink.findOne({
      where: { idx: formId },
      attributes: [
        ['idx', 'formId'],
        'title',
        'thumbNail',
        'form_link',
        'tempType',
        'expression',
      ],
    });

    formDetail.dataValues.urlPath = `${formDetail.form_link}/${formDetail.expression}`;
    formDetail.dataValues.whiteLabelChecked = whiteCheck.whiteLabelChecked;
    // 임의의 값
    formDetail.dataValues.member = ['김기태', 'aaa', 'bbb'];
    return { formDetail };
  },
  createRandomCompany: async (huidx) => {
    const randomCompany = await db.company.create({
      company_name: Math.random().toString(36).substr(2, 11),
      company_subdomain: _f.randomNumber4(),
      huidx,
    });
    return randomCompany;
  },
  includeUserToCompany: async (data) => {
    await db.userCompany.create(data);
  },
  giveMasterAuth: async (user_idx, company_idx) => {
    masterConfig.user_idx = user_idx;
    masterConfig.company_idx = company_idx;
    await db.config.create(masterConfig);
  },
  createFreePlan: async (company_idx) => {
    await db.plan.create({
      company_idx,
    });
  },

  getFileName: (data) => {
    const [, file_name] = data.split('/');
    return file_name;
  },

  createFileStore: async (data, t) => {
    try {
      // 전화번호로 조회 후 없으면 생성
      const findCustomerFileResult = await db.customerFile.findOne({
        where: { customer_phoneNumber: data.customer_phoneNumber },
      });

      if (!findCustomerFileResult) {
        await db.customerFile.create(data, {
          transaction: t,
        });
      }
      return { success: true };
    } catch (err) {
      console.log(err);
      await t.rollback();
      return {
        success: false,
        err,
      };
    }
  },
  checkPage: async (limit, page, company_idx) => {
    const intlimit = parseInt(limit);
    const intPage = parseInt(page);

    const totalData = await db.customer.count({ where: { company_idx } });
    const start = (intPage - 1) * intlimit;
    return { totalData, start, intlimit, intPage };
  },

  addUserId: (customerData, addminus, No) => {
    // userId, fullAddress 추가
    customerData = customerData.map((data) => {
      data.No = No;
      addminus == 'plus' ? No++ : No--;
      data.customer_phoneNumber = data.customer_phoneNumber.replace(/-/g, '.');
      data.fullAddress = `${data.address} ${data.detail_address}`;
      return data;
    });

    return customerData;
  },
};
