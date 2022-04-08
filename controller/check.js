const db = require("../model/db");

module.exports = {
  checkMember: async (req, res, next) => {
    const {
      user_idx,
      params: { company_subdomain },
    } = req;

    // 멤버로 들어가있는지,
    const checkCompany = await db.company.findOne({
      where: { company_subdomain },
      attributes: ["idx"],
    });

    const checkCompanyMember = await db.userCompany.count({
      where: { company_idx: checkCompany.idx, user_idx },
    });

    // 서브도메인 회사에 가입 안되어 있음
    if (checkCompanyMember == 0) {
      const checkAnotherCompany = await db.userCompany.count({
        where: { user_idx },
      });
      if (checkAnotherCompany == 0) {
        return res.send({ success: 200, message: "다른 회사 가입 안되있음" });
      }
      return res.send({ success: 200, message: "다른 회사 가입" });
    }

    return res.send({ success: 200, message: "해당 회사에 가입" });
  },
};
