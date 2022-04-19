const db = require("../model/db");
module.exports = {
  storeBread: async (req, res, next) => {
    const { body, user_idx } = req;
    // 제일 최근 데이터가 같은 데이터인지 체크

    body.user_idx = user_idx;

    const checkDuplicate = await db.store.findOne({
      where: { user_idx },
      order: [["createdAt", "ASC"]],
    });
    console.log(checkDuplicate);
    if (!checkDuplicate || checkDuplicate.bread !== body.bread) {
      console.log("만들어져라");
      await db.store.create(body);
      return res.send({ success: 200 });
    }
    return res.send({ success: 400 });
  },

  delBread: async (req, res, next) => {
    const { breadId } = req.params;
    await db.store.destroy({ where: { idx: breadId } });
    return res.send({ success: 200 });
  },
};
