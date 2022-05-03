const db = require("../model/db");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
module.exports = {
  storePairpaceInfo: async (req, res, next) => {
    const {
      sender_idx: sender_idx,
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
        sender_idx,
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
      console.log(req.body);
      const io = req.app.get("io");

      io.to(+sender_idx).emit("closePairpace", {
        isclosed: true,
        sender_idx,
      });
      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },
};
