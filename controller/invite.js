const {
  checkUserCompany,
  joinFunction,
  includeUserToCompany,
  createRandomCompany,
  giveMasterAuth,
  createFreePlan,
} = require('../lib/apiFunctions');
const sendMail = require('../mail/sendInvite');

const db = require('../model/db');
module.exports = {
  sendEmail: async (req, res, next) => {
    const {
      body: { company_url, target_email },
      user_idx,
      company_idx,
    } = req;
    try {
      // 관리자가 회사소속인지 체크
      // const checkResult = await checkUserCompany(body.company_idx, user_idx);
      // if (checkResult == false) {
      //   return res.send({ success: 400 });
      // }
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
      // userCompany 만들기 active 0
      await includeUserToCompany({
        user_idx: createUserResult.idx,
        company_idx: findCompany.idx,
        active: 0,
        searchingName: createUserResult.user_name,
      });
      // 랜덤 회사 만들기
      const randomCompany = await createRandomCompany(createUserResult.idx);
      // master 권한 주기
      await giveMasterAuth(createUserResult.idx, randomCompany.idx);

      // 무료 플랜 만들기
      await createFreePlan(randomCompany.idx);

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
    await includeUserToCompany({
      user_idx: check.idx,
      company_idx: findCompany.company_idx,
      active: 0,
      searchingName: check.user_name,
    });

    res.send({ success: 200 });
  },
  showStandbyUser: async (req, res, next) => {
    const standbyUser = await db.userCompany.findAll({
      where: { company_idx: req.company_idx, active: 0 },
    });

    return res.send({ success: 200, standbyUser });
  },
  joinStandbyUser: async (req, res, next) => {
    await db.userCompany.update(
      { active: 1 },
      { where: { user_idx: req.body.user_idx, company_idx: req.company_idx } }
    );
    await db.create.create({
      user_idx: req.body.user_idx,
      company_idx: req.company_idx,
    });
    return res.send({ success: 200 });
  },
};
