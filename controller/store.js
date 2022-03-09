const db = require('../model/db');
module.exports = {
  storeBread: async (req, res, next) => {
    const { body, user_idx } = req;
    body.user_idx = user_idx;
    await db.store.create(body);
    return res.send({ success: 200 });
  },

  delBread: async (req, res, next) => {
    const { breadId } = req.params;
    await db.store.destroy({ where: { idx: breadId } });
    return res.send({ success: 200 });
  },
};
