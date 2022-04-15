const db = require("../model/db");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
const { createToken } = require("../lib/jwtfunctions");
const { Op } = require("sequelize");
const {} = require("../lib/attributes");

module.exports = {
  joinDoCustomer: async (req, res, next) => {
    const { body } = req;
    const createCustomerAccountResult = await db.customerAccount.create(body);
    const loginToken = await createToken({
      user_idx: createCustomerAccountResult.idx,
    });
    return res.send({ success: 200, loginToken });
  },
  getHome: async (req, res, next) => {
    return res.send({ success: 200 });
  },
};
