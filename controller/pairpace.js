const db = require("../model/db");
const { generateRandomCode } = require("../lib/functions");
const { verify_data } = require("../lib/jwtfunctions");
const { schedulePay } = require("../lib/payFunction");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
module.exports = {
  storePairpaceInfo: async (req, res, next) => {
    console.log(req.body);
    console.log(typeof req.body);
  },
};
