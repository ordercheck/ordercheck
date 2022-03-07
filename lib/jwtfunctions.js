const jwt = require('jsonwebtoken');

const verify_data = async (token) => {
  return await jwt.verify(
    token,
    process.env.tokenSecret,
    function (err, decoded) {
      if (err) {
        return false;
      } else {
        return decoded;
      }
    }
  );
};

const createToken = async (data) => {
  // const expiresIn = 60 * 60 * 60;
  const token = await jwt.sign(data, process.env.tokenSecret);
  return token;
};
module.exports = { verify_data, createToken };
