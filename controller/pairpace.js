const db = require("../model/db");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
module.exports = {
  storePairpaceInfo: async (req, res, next) => {
    const {
      strUserIdx: customer_idx,
      zipCode: post_address,
      firstAddr: address,
      secondAddr: jibun_address,
      extraAddr: detail_address,
      company: company_name,
      orderCheckClient: customer_name,
      orderCheckClientContact: customer_phone,
      applyDate: submission_date,
      formType: form_type,
      strPpAppliIdx,
    } = req.body;
    try {
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
        form_type,
        submission_date,
      });

      const io = req.app.get("io");
      io.to(+customer_idx).emit("closePairpace", "리다이렉트 시켜줘어어");
    } catch (err) {
      next(err);
    }
  },
};
