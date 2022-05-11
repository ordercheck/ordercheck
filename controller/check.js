const db = require("../model/db");

module.exports = {
  checkMember: async (req, res, next) => {
    const {
      user_idx,
      params: { company_subdomain },
    } = req;

    // 멤버로 들어가있는지,
    const checkCompanyMember = await db.company.count({
      where: { company_subdomain },
      include: [
        {
          model: db.userCompany,
          where: {
            user_idx,
            active: true,
            standBy: false,
          },
        },
      ],
      attributes: ["idx"],
    });

    // 서브도메인 회사에 가입 안되어 있음
    if (checkCompanyMember == 0) {
      const checkCompany = await db.userCompany.findOne({
        where: { user_idx, active: true, standBy: false },
        attributes: ["company_idx"],
      });

      const checkAnotherCompany = await db.company.count({
        where: { idx: checkCompany.company_idx, companyexist: true },
      });

      if (checkAnotherCompany == 0) {
        console.log("다른회사 가입 안되 있음");
        //   다른회사 가입 안되있을 때
        return res.send({ success: 200, message: 0 });
      }
      console.log("다른회사 가입");
      //   다른회사 가입 되있을 때
      return res.send({ success: 200, message: 1 });
    }
    console.log("해당 회사에 가입");
    //   해당 회사에 가입
    return res.send({ success: 200, message: 2 });
  },
  getSubDomain: async (req, res, next) => {
    const { user_idx } = req;

    const findCompanyResult = await db.userCompany.findOne({
      where: { user_idx, active: true, standBy: false },
      include: [
        {
          model: db.company,
        },
      ],
    });
    return res.send({
      success: 200,
      subdomain: findCompanyResult.company.company_subdomain,
    });
  },
  getPlanInfo: async (req, res, next) => {
    const plans = await db.planInfo.findAll();
    return res.send({ success: 200, plans });
  },
};
