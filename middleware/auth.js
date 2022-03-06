const verify_data = require('../lib/jwtfunctions');
const db = require('../model/db');
const loginCheck = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.send({ success: 400, msg: 'not login' });
  }

  const [, token] = authorization.split(' ');
  try {
    console.log(token);
    const data = await verify_data(token);
    console.log(data);
    const findUserCompanyResult = await db.userCompany.findOne({
      where: { user_idx: data.user_idx, deleted: null, active: true },
      attributes: ['company_idx'],
    });
    console.log(findUserCompanyResult);
    req.user_idx = data.user_idx;
    req.company_idx = findUserCompanyResult.company_idx;
    req.token = token;
    next();
  } catch (err) {
    console.log(err);
    return res.send({ success: 400, msg: 'token err' });
  }
};

module.exports = loginCheck;
