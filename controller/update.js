const { checkUserCompany } = require('../lib/apiFunctions');
module.exports = {
  updateCompany: async (req, res) => {
    const { body, loginUser: user_idx } = req;
    try {
      // 관리자가 회사소속인지 체크
      const checkResult = await checkUserCompany(body.company_idx, user_idx);
      if (checkResult == false) {
        return res.send({ success: 400 });
      }
    } catch (err) {
      const Err = err.message;
      return res.send({ success: 500, Err });
    }

    return res.send({ success: 200 });
  },
};
