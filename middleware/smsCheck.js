const db = require("../model/db");
const smsCheck = async (req, res, next) => {
  //  소유주의 문자 남은 비용을 체크
  const { company_idx } = req;
  const findCompany = await db.company.findByPk(company_idx, {
    attributes: ["huidx"],
  });

  const findSms = await db.sms.findOne({
    where: { user_idx: findCompany.huidx },
    attributes: ["text_cost", "repay", "idx"],
  });

  req.text_cost = findSms.text_cost;
  req.repay = findSms.repay;
  req.sms_idx = findSms.idx;
  next();
};

module.exports = { smsCheck };
