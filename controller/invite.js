const { checkUserCompany, joinFunction } = require('../lib/apiFunctions');
const sendMail = require('../mail/sendInvite');

const db = require('../model/db');
module.exports = {
  updateCompany: async (req, res) => {
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
      try {
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
        const Err = err.message;
        return res.send({ success: 500, Err });
      }
    } catch (err) {
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },
  joinToCompany: async (req, res) => {
    const { createUserResult, success, message } = await joinFunction(req.body);

    if (!success) {
      return res.send({ success: 400, message: message });
    }

    // url 해쉬해서 subdomain찾기
    db.company.findOne({});
    // userCompany 만들기 active는 0
    db.userCompany.create({});
  },

  showStandbyUser: async (req, res) => {
    const result = await db.userCompany.findAll({
      where: { company_idx: req.company_idx, active: 0 },
    });

    return res.send({ success: 200, result });
  },
  joinStandbyUser: async (req, res) => {
    await db.userCompany.update(
      { active: 1 },
      { where: { idx: req.body.customer_idx } }
    );

    return res.send({ success: 200 });
  },
};
