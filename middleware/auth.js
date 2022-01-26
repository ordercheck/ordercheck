const verify_data = require('../lib/jwtfunctions');
const loginCheck = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.send({ success: 400, msg: 'not login' });
  }

  const [, token] = authorization.split(' ');
  try {
    const data = await verify_data(token);
    req.user_idx = data.user_idx;
    req.company_idx = data.company_idx;
    next();
  } catch (err) {
    return res.send({ success: 400, msg: 'token err' });
  }
};

module.exports = loginCheck;
