const db = require('../model/db');

module.exports = {
  getUserProfile: async (req, res) => {
    const result = await db.user.findByPk(req.loginUser, {
      include: [
        {
          model: db.userCompany,
          include: [
            {
              model: db.company,
              include: [{ model: db.plan, attributes: ['planIdx'] }],
            },
          ],
        },
      ],
      attributes: { exclude: ['user_password'] },
    });
    return res.send({ success: 200, result });
  },
};
