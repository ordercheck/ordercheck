const db = require("../model/db");
const { payNow, refund, addCard } = require("../lib/payFunction");
const { verify_data } = require("../lib/jwtfunctions");
const axios = require("axios");
const _f = require("../lib/functions");
module.exports = {
  enrollmentCard: async (req, res, next) => {
    const { user_idx } = req;
    let card_data = await verify_data(ct);

    card_data.user_idx = user_idx;
    // 법인카드 유무 확인 후 체크
    card_data.birth
      ? (card_data.corporation_yn = false)
      : (card_data.corporation_yn = true);

    // 카드 정보 등록 후

    await db.card.create(card_data);
  },
};
