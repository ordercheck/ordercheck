const {
  checkUserCompany,
  joinFunction,
  includeUserToCompany,
  createRandomCompany,
  giveMasterAuth,
  createFreePlan,
  findMembers,
} = require('../lib/apiFunctions');
const sendMail = require('../mail/sendInvite');
const axios = require('axios');
const db = require('../model/db');
module.exports = {
  sendEmail: async (req, res, next) => {
    const {
      body: { company_url, target_email },
      user_idx,
      company_idx,
    } = req;
    try {
      const company_result = await db.company.findByPk(company_idx, {
        attributes: ['company_name'],
      });
      const user_result = await db.user.findByPk(user_idx, {
        attributes: ['user_name'],
      });
      target_email.forEach(async (target) => {
        await sendMail(
          company_url,
          company_result.company_name,
          user_result.user_name,
          target
        );
      });
      return res.send({ success: 200, msg: '이메일 보내기 성공' });
    } catch (err) {
      next(err);
    }
  },
  sendSMS: async (req, res, next) => {
    const {
      body: { company_url, target_phoneNumber },
      user_idx,
      company_idx,
    } = req;
    // 문자 비용 계산(없으면 오류)

    // 회사 정보 찾기
    const findCompany = await db.company.findByPk(company_idx, {
      attributes: ['company_name'],
    });
    // 초대한 유저 찾기
    const findInviter = await db.user.findByPk(user_idx, {
      attributes: ['user_name'],
    });

    const message = `
[${findCompany.company_name}]
안녕하세요, ${findInviter.user_name}님이 ${findCompany.company_name} 회사에 초대합니다:)

참여하기:
${company_url}
 `;
    target_phoneNumber.forEach(async (data) => {
      user_phone = data.replace(/\./g, '-');

      await axios({
        url: '/api/send/sms',
        method: 'post', // POST method
        headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
        data: { user_phone, message, type: 'LMS' },
      });
    });

    res.send({ success: 200 });

    // 비용에서 차감

    // 문자 내역 기록
  },

  joinToCompanyByRegist: async (req, res, next) => {
    try {
      const { company_subdomain } = req.body;
      const { createUserResult, success, message } = await joinFunction(
        req.body
      );
      if (!success) {
        return res.send({ success: 400, message: message });
      }
      // subdomain
      const findCompany = await db.company.findOne({
        where: { company_subdomain },
      });
      const findConfigResult = await db.config.findOne({
        where: { template_name: '팀원', company_idx: findCompany.idx },
      });
      // userCompany 만들기 active 0
      await includeUserToCompany({
        user_idx: createUserResult.idx,
        company_idx: findCompany.idx,
        active: false,
        searchingName: createUserResult.user_name,
        config_idx: findConfigResult.idx,
      });
      await db.sms.create({ user_idx: createUserResult.idx });
      return res.send({ success: 200, message: '가입 신청 완료' });
    } catch (err) {
      next(err);
    }
  },
  joinToCompanyByLogin: async () => {
    const { user_phone, user_password, company_subdomain } = req.body;

    let check = await db.user.findOne({ where: { user_phone } });
    if (!check) {
      return res.send({ success: 400, message: '비밀번호 혹은 전화번호 오류' });
    }

    const compareResult = await bcrypt.compare(
      user_password,
      check.user_password
    );
    if (!compareResult) {
      return res.send({
        success: 400,
        message: '비밀번호 혹은 전화번호 오류',
      });
    }
    const findCompany = await db.company.findOne({
      where: { company_subdomain },
    });
    const findConfigResult = await db.config.findOne({
      where: { template_name: '팀원', company_idx: findCompany.idx },
    });
    await includeUserToCompany({
      user_idx: check.idx,
      company_idx: findCompany.company_idx,
      active: false,
      searchingName: check.user_name,
      config_idx: findConfigResult.idx,
    });
    res.send({ success: 200 });
  },
  showStandbyUser: async (req, res, next) => {
    const { company_idx } = req;
    const standbyUser = await findMembers(
      {
        company_idx,
        active: false,
        deleted: null,
      },
      company_idx
    );

    return res.send({ success: 200, standbyUser });
  },
  joinStandbyUser: async (req, res, next) => {
    const { memberId } = req.params;
    const findUserCompanyResult = await db.userCompany.findByPk(memberId, {
      attributes: ['user_idx', 'company_idx'],
    });

    await db.userCompany.update({ active: true }, { where: { idx: memberId } });

    await db.config.create({
      user_idx: findUserCompanyResult.user_idx,
      company_idx: findUserCompanyResult.company_idx,
    });

    return res.send({ success: 200 });
  },
  refuseUser: async (req, res, next) => {
    const { memberId } = req.params;
    await db.userCompany.destroy({ where: { idx: memberId } });
    return res.send({ success: 200 });
  },
};
