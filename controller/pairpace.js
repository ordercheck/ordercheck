const db = require("../model/db");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
module.exports = {
  storePairpaceInfo: async (req, res, next) => {
    const {
      strUserIdx: customer_idx,
      strPpAppliIdx,
      zipCode: post_address,
      firstAddr: address,
      secondAddr: jibun_address,
      extraAddr: detail_address,
      company: company_name,
      orderCheckClient: customer_name,
      orderCheckClientContact: customer_phone,
      formType,
      applyDate: submission_date,
    } = req.body;
    console.log(req.body);
    await db.pairPace.create({
      customer_idx,
      strPpAppliIdx,
      post_address,
      address,
      jibun_address,
      detail_address,
      company_name,
      customer_name,
      customer_phone,
      formType,
      submission_date,
    });
  },
};
