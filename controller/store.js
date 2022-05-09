const db = require("../model/db");
const redis = require("redis");

module.exports = {
  storeBread: async (req, res, next) => {
    try {
      const client = redis.createClient({
        url: process.env.REDIS_URL,
      });
      const { body, user_idx } = req;
      // io 인지 체크
      // if (process.env.NODE_MODE == "IO") {
      // 제일 최근 데이터가 같은 데이터인지 체크
      await client.connect();

      const storedBread = await client.get(`bread${user_idx}`);

      if (storedBread !== body.bread) {
        body.user_idx = user_idx;
        console.log(body);
        await db.store.create(body);
        client.del(`bread${user_idx}`);
        client.set(`bread${user_idx}`, `${body.bread}`);
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
