const { checkUserCompany } = require('../lib/apiFunctions');
const sendMail = require('../mail/sendInvite');
const db = require('../model/db');
module.exports = {
  updateCompany: async (req, res) => {
    const {
      body: { company_idx, company_url, target_email },
      loginUser: user_idx,
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
        const result = await sendMail(
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
  },
};
