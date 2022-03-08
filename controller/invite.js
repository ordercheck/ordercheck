const {
  checkUserCompany,
  joinFunction,
  includeUserToCompany,
  createRandomCompany,
  giveMasterAuth,
  createFreePlan,
  findMembers,
  decreasePriceAndHistory,
} = require('../lib/apiFunctions');
const sendMail = require('../mail/sendInvite');
const bcrypt = require('bcrypt');
const axios = require('axios');
const db = require('../model/db');
const { createToken } = require('../lib/jwtfunctions');
const { find } = require('cheerio/lib/api/traversing');
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
      text_cost,
      repay,
      sms_idx,
      token,
    } = req;
    // 문자 비용 계산(없으면 오류)

    if (text_cost < target_phoneNumber.length * 37) {
      return res.send({ success: 400, message: 'LMS 비용이 부족합니다.' });
    }

    // 회사 정보 찾기
    const findCompany = await db.company.findByPk(company_idx, {
      attributes: ['company_name'],
    });
    // 초대한 유저 찾기
    const findInviter = await db.user.findByPk(user_idx, {
      attributes: ['user_name', 'user_phone'],
    });

    const message = `
[${findCompany.company_name}]
안녕하세요, ${findInviter.user_name}님이 ${findCompany.company_name} 회사에 초대합니다:)

참여하기:
${company_url}
 `;
    target_phoneNumber.forEach(async (phoneNumber) => {
      const user_phone = phoneNumber.replace(/\./g, '-');

      await axios({
        url: '/api/send/sms',
        method: 'post', // POST method
        headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
        data: { user_phone, message, type: 'LMS' },
      });

      // 비용에서 차감
      // 알림톡 비용 차감 후 저장
      decreasePriceAndHistory(
        { text_cost: 37 },
        sms_idx,
        'LMS',
        message,
        37,
        findInviter.user_phone,
        phoneNumber
      );
    });

    // 문자 자동 충전
    if (repay) {
      const autoSms = await db.sms.findByPk(sms_idx, {
        attributes: ['text_cost', 'auto_min', 'auto_price'],
      });

      if (autoSms.text_cost < autoSms.auto_min) {
        await axios({
          url: '/api/config/company/sms/pay',
          method: 'post', // POST method
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token} `,
          }, // "Content-Type": "application/json"
          data: { text_cost: autoSms.auto_price },
        });
      }
    }

    res.send({ success: 200 });
  },

  showStandbyUser: async (req, res, next) => {
    const { company_idx } = req;
    const standbyUser = await findMembers(
      {
        company_idx,
        active: true,
        standBy: true,
        deleted: null,
      },
      ['createdAt', 'DESC']
    );

    return res.send({ success: 200, standbyUser });
  },
  joinStandbyUser: async (req, res, next) => {
    const { memberId } = req.params;
    const findUserCompanyResult = await db.userCompany.findByPk(memberId, {
      attributes: ['user_idx', 'company_idx'],
    });

    await db.userCompany.update(
      { active: true, standBy: false },
      { where: { idx: memberId } }
    );

    await db.config.create({
      user_idx: findUserCompanyResult.user_idx,
      company_idx: findUserCompanyResult.company_idx,
    });

    return res.send({ success: 200 });
  },
  refuseUser: async (req, res, next) => {
    const { memberId } = req.params;
    await db.userCompany.update(
      { active: false, standBy: true },
      { where: { idx: memberId } }
    );
    return res.send({ success: 200 });
  },
  rejoinCompany: async (req, res, next) => {
    const {
      body: { company_subdomain },
      user_idx,
    } = req;
    const findCompany = await db.company.findOne(
      { company_subdomain },
      { attributes: ['idx'] }
    );

    await db.userCompany.update(
      {
        active: true,
      },
      {
        where: {
          company_idx: findCompany.idx,
          user_idx,
        },
      }
    );
    return res.send({ success: 200 });
  },
  cancelJoinCompany: async (req, res, next) => {
    const {
      body: { company_subdomain },
      user_idx,
    } = req;
    const loginToken = await createToken(user_idx);
    const findCompany = await db.company.findOne(
      { company_subdomain },
      { attributes: ['idx'] }
    );

    // 신청 삭제
    await db.userCompany.destroy({
      where: { company_idx: findCompany.idx, user_idx },
    });

    // 기존에 사용하던 무료플랜 있는지 체크
    const checkCompany = await db.company.findOne({
      where: {
        huidx: user_idx,
      },
    });

    // 기존의 회사가 없을 때
    if (!checkCompany) {
      // 랜덤 회사 만들기
      const randomCompany = await createRandomCompany(user_idx);

      // master template 만들기
      const createTempalteResult = await giveMasterAuth(randomCompany.idx);
      // 팀원 template  만들기
      await db.config.create({
        company_idx: randomCompany.idx,
      });

      const findUser = await db.user.findByPk(user_idx, {
        attributes: ['user_name'],
      });

      // 유저 회사에 소속시키기
      await includeUserToCompany({
        user_idx: user_idx,
        company_idx: randomCompany.idx,
        searchingName: findUser.user_name,
        config_idx: createTempalteResult.idx,
      });

      // 무료 플랜 만들기
      await createFreePlan(randomCompany.idx);
    } else {
      await db.userCompany.update(
        { active: true },
        {
          where: {
            company_idx: checkCompany.idx,
            user_idx,
          },
        }
      );
    }

    return res.send({ success: 200, loginToken });
  },
};
