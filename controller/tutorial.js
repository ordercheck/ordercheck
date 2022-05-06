const db = require("../model/db");
const { generateRandomCode } = require("../lib/functions");
const { verify_data } = require("../lib/jwtfunctions");
const { schedulePay } = require("../lib/payFunction");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
module.exports = {
  changeReload: async (req, res, next) => {
    const { user_idx } = req;

    await db.user.update(
      { tutorialReload: true },
      { where: { idx: user_idx } }
    );

    return res.send({ success: 200 });
  },
};
