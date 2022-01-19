const db = require('../model/db');

module.exports = {
  getUserProfile: async (req, res) => {
    const result = await db.user.findByPk(req.loginUser);
    return res.send({ success: 200, result });
  },
};
