const db = require("../model/db");
const moment = require("moment");
const jwt = require("jsonwebtoken");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
module.exports = {
  storePairpaceInfo: async (req, res, next) => {
    const { body } = req.body;

    const io = req.app.get("io");

    try {
      jwt.verify(jwtToken, process.env.PAIRPACE_JWT_SECRET);

      await db.pairPace.create(body);

      io.to(+body.sender_idx).emit("closePairpace", {
        isclosed: true,
        sender_idx: body.sender_idx,
      });
      return res.send({ success: 200 });
    } catch (err) {
      io.to(+body.sender_idx).emit("closePairpace", {
        isclosed: true,
        sender_idx: body.sender_idx,
      });
      return res.send({ success: 500 });
    }
  },
};
