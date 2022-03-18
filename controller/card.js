const db = require("../model/db");
const { payNow, refund, addCard } = require("../lib/payFunction");
const { verify_data } = require("../lib/jwtfunctions");
const axios = require("axios");
const _f = require("../lib/functions");
module.exports = {
  enrollmentCard: async (req, res, next) => {
    const {
      user_idx,
      body: { token },
    } = req;

    let card_data = await verify_data(token);

    // 카드 유효성 체크
    await db.card.count({ where: { card_number: card_data.card_number } });

    // console.log(card_data);
    card_data.user_idx = user_idx;
    card_data.main = false;
    // 법인카드 유무 확인 후 체크
    card_data.birth
      ? (card_data.corporation_yn = false)
      : (card_data.corporation_yn = true);

    // 카드 정보 등록 후

    const createResult = await db.card.create(card_data);

    const cardInfo = {};
    cardInfo.cardId = createResult.idx;
    cardInfo.card_name = createResult.card_name;

    const second = createResult.card_number.substring(4, 8);
    const third = createResult.card_number.substring(8, 12);

    cardInfo.card_number = `**** ${second} ${third} ****`;
    const [year, month] = createResult.expiry.split("-");

    cardInfo.expiry = `${month}/${year.slice(-2)}`;
    cardInfo.cardId = createResult.idx;
    cardInfo.active = createResult.active;
    cardInfo.card_email = createResult.card_email;
    cardInfo.card_code = createResult.card_code;
    cardInfo.main = createResult.main;

    return res.send({ success: 200, cardInfo });
  },
};
