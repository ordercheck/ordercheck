const db = require("../model/db");
const moment = require("moment");
const jwt = require("jsonwebtoken");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
module.exports = {
  storePairpaceInfo: async (req, res, next) => {
    const {
      sender_idx,
      user_idx: customer_idx,
      post_number: post_address,
      first_address: address,
      second_address: jibun_address,
      detail_address,
      company_name,
      orderCheckClient: customer_name,
      phone_number: customer_phone,
      applied_date: submission_date,
      apply_type: form_type,
      jwtToken,
      pp_appli_idx: strPpAppliIdx,
    } = req.body;
    console.log(req.body);
    const io = req.app.get("io");

    try {
      jwt.verify(jwtToken, process.env.PAIRPACE_JWT_SECRET);

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

      io.to(+sender_idx).emit("closePairpace", {
        isclosed: true,
        sender_idx,
      });
      return res.send({ success: 200 });
    } catch (err) {
      io.to(+sender_idx).emit("closePairpace", {
        isclosed: true,
        sender_idx,
      });
      return res.send({ success: 500 });
    }
  },
};
