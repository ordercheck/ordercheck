const db = require("../model/db");
const { createToken } = require("../lib/jwtfunctions");
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

  const huidxToken = await createToken({ user_idx: findCompany.huidx });

  req.huidx = findCompany.huidx;
  req.text_cost = findSms.text_cost;
  req.repay = findSms.repay;
  req.huidxToken = huidxToken;
  req.sms_idx = findSms.idx;
  next();
};

const checkFormSns = async (req, res, next) => {
  const { company_idx } = req.body;
  const findCompany = await db.company.findByPk(company_idx, {
    attributes: ["huidx"],
  });
  const findSms = await db.sms.findOne({
    where: { user_idx: findCompany.huidx },
  });

  req.text_cost = findSms.text_cost;
  req.repay = findSms.repay;
  req.auto_min = findSms.auto_min;
  req.auto_price = findSms.auto_price;

  next();
};

module.exports = { smsCheck, checkFormSns };
