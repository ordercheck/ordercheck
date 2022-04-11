const db = require("../model/db");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
const { Op } = require("sequelize");
module.exports = {
  getInfo: async (req, res, next) => {
    const now = moment();
    const startDate = moment("2022-04-11");

    const registUser = await db.user.count({
      where: {
        createdAt: { [Op.between]: [startDate, now] },
      },
    });

    const registCompany = await db.company.count({
      where: {
        createdAt: { [Op.between]: [startDate, now] },
      },
    });

    const registRegion = await db.user.count({
      where: {
        createdAt: { [Op.between]: [startDate, now] },
      },
      attributes: ["regist_region"],
      group: ["regist_region"],
    });

    return res.send({ success: 200, registUser, registCompany, registRegion });
  },
};
