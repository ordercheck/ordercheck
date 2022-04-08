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
      where: {
        company_idx: checkCompany.idx,
        user_idx,
        active: true,
        standBy: false,
      },
    });

    // 서브도메인 회사에 가입 안되어 있음
    if (checkCompanyMember == 0) {
      const checkCompany = await db.userCompany.findOne({
        where: { user_idx },
        attributes: ["company_idx"],
      });

      const checkAnotherCompany = await db.company.findOne({
        idx: checkCompany.company_idx,
        companyexist: true,
      });

      console.log();
      if (!checkAnotherCompany) {
        //   다른회사 가입 안되있을 때
        return res.send({ success: 200, message: 0 });
      }
      //   다른회사 가입 되있을 때
      return res.send({ success: 200, message: 1 });
    }
    //   해당 회사에 가입
    return res.send({ success: 200, message: 2 });
  },
};
