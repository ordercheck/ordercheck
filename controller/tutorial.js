const db = require("../model/db");
const { generateRandomCode } = require("../lib/functions");
const { verify_data } = require("../lib/jwtfunctions");
const { schedulePay } = require("../lib/payFunction");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
module.exports = {
  changeReload: async (req, res, next) => {
    const {
      user_idx,
      body: { reloadType },
    } = req;

    await db.user.update({ [reloadType]: true }, { where: { idx: user_idx } });

    return res.send({ success: 200 });
  },
};
