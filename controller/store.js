const db = require("../model/db");
const redis = require("redis");
const client = redis.createClient();
module.exports = {
  storeBread: async (req, res, next) => {
    const { body, user_idx } = req;
    // 제일 최근 데이터가 같은 데이터인지 체크

    client.get(`${user_idx}`, async (err, data) => {
      if (err) {
        next(err);
      }
      if (data == body.bread) {
        return res.send({ success: 200 });
      } else {
        body.user_idx = user_idx;
        await db.store.create(body);
        res.send({ success: 200 });
        client.del(`${user_idx}`);
        client.set(`${user_idx}`, `${body.body}`);
      }
    });
  },

  delBread: async (req, res, next) => {
    const { breadId } = req.params;
    await db.store.destroy({ where: { idx: breadId } });
    return res.send({ success: 200 });
  },
};
