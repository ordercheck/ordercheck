const db = require("../model/db");
const redis = require("redis");

const client = redis.createClient();
module.exports = {
  storeBread: async (req, res, next) => {
    try {
      const { body, user_idx } = req;
      // 제일 최근 데이터가 같은 데이터인지 체크
      await client.connect();

      const stroedBread = await client.get(`${user_idx}`);

      if (stroedBread == body.bread) {
        console.log(stroedBread);
      } else {
        console.log(stroedBread);
        body.user_idx = user_idx;
        await db.store.create(body);
        client.del(`${user_idx}`);
        client.set(`${user_idx}`, `${body.bread}`);
      }
      await client.quit();
      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },

  delBread: async (req, res, next) => {
    const { breadId } = req.params;
    await db.store.destroy({ where: { idx: breadId } });
    return res.send({ success: 200 });
  },
};
