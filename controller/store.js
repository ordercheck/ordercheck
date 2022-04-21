const db = require("../model/db");
const redis = require("redis");

const redisInfo = {
  host: "ordercheckcache-ro.xnuldq.ng.0001.apn2.cache.amazonaws.com",
  port: 6379,
};

const client = redis.createClient(redisInfo);
module.exports = {
  storeBread: async (req, res, next) => {
    try {
      const { body, user_idx } = req;

      // io 인지 체크
      // if (process.env.NODE_MODE == "IO") {
      // 제일 최근 데이터가 같은 데이터인지 체크

      // await client.connect();
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
      // await client.quit();
      return res.send({ success: 200 });
      // } else {
      //   return res.send({ success: 200 });
      // }
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
