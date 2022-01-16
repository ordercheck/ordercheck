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
module.exports = verify_data;
