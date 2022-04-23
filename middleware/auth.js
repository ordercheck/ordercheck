const { verify_data } = require("../lib/jwtfunctions");
const db = require("../model/db");
const loginCheck = async (req, res, next) => {
  const { authorization } = req.headers;
  console.log(authorization);
  if (!authorization) {
    return res.send({ success: 400, msg: "not login" });
  }

  const [, token] = authorization.split(" ");
  try {
    const data = await verify_data(token);

    const findUserCompanyResult = await db.userCompany.findOne({
      where: {
        user_idx: data.user_idx,
        active: true,
        standBy: false,
      },
      attributes: ["company_idx"],
    });

    if (!findUserCompanyResult) {
      req.user_idx = data.user_idx;
      req.token = token;
      next();
      return;
    }

    req.user_idx = data.user_idx;
    req.company_idx = findUserCompanyResult.company_idx;
    req.token = token;
    next();
    return;
  } catch (err) {
    console.log(err);
    return res.send({ success: 400, msg: "token err" });
  }
};
const customerLoginCheck = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.send({ success: 400, msg: "not login" });
  }

  const [, token] = authorization.split(" ");
  try {
    const data = await verify_data(token);

    const getCustomerInfo = await db.customerAccount.findByPk(data.user_idx, {
      attributes: ["customer_phoneNumber"],
    });

    req.customer_phoneNumber = getCustomerInfo.customer_phoneNumber;
    req.customer_account_idx = data.user_idx;
    next();
    return;
  } catch (err) {
    console.log(err);
    return res.send({ success: 400, msg: "token err" });
  }
};
module.exports = { loginCheck, customerLoginCheck };
