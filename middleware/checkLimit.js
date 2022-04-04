const db = require("../model/db");
const { limitPlan } = require("../lib/standardTemplate");
const { delFile } = require("../lib/aws/fileupload").ufile;
// 고객 체크
const checkCustomerCount = async (company_idx, data) => {
  const findCompanyData = await db.company.findByPk(company_idx, {
    attributes: [data],
  });
  const findPlanResult = await db.plan.findOne({
    where: { company_idx, active: 1 },
    attributes: ["plan"],
  });

  return {
    findCompanyData,
    findPlanResult,
  };
};

const check = async (reqData, data) => {
  try {
    const findCompanyByLink = await db.formLink.findOne({
      where: { form_link: reqData },
      attributes: ["company_idx"],
    });
    if (!findCompanyByLink) {
      return {
        success: false,
        message: "존재하지 않는 링크 입니다",
      };
    }

    const { findCompanyData, findPlanResult } = await checkCustomerCount(
      findCompanyByLink.company_idx,
      data
    );
    return {
      success: true,
      findCompanyData,
      findPlanResult,
    };
  } catch (err) {
    return {
      success: false,
      message: err,
    };
  }
};

module.exports = {
  checkFormLimit: async (req, res, next) => {
    const {
      params: { form_link },
    } = req;

    const { success, findCompanyData, findPlanResult, message } = await check(
      form_link,
      "form_link_count"
    );

    if (!success) {
      return res.send({ success: 400, message });
    }

    if (
      findCompanyData.form_link_count ==
      limitPlan[findPlanResult.plan].form_link_count
    ) {
      req.formClose = true;
      return next();
    }
    req.formClose = false;
    return next();
  },
  checkCustomerLimit: async (req, res, next) => {
    const { findCompanyData, findPlanResult } = await checkCustomerCount(
      req.company_idx,
      "customer_count"
    );

    if (
      findCompanyData.customer_count ==
      limitPlan[findPlanResult.plan].customer_count
    ) {
      return res.send({
        success: 400,
        message: "이달 고객 등록 가능 횟수가 초과하였습니다.",
      });
    }
    return next();
  },

  checkConsultingLimit: async (req, res, next) => {
    const { success, findCompanyData, findPlanResult, message } = await check(
      form_link,
      "form_link_count"
    );

    if (!success) {
      return res.send({ success: 400, message });
    }
    console.log(findCompanyData.form_link_count);
    console.log(limitPlan[findPlanResult.plan].form_link_count);
    next();
  },
};
