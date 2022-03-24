const db = require("../model/db");

const { verify_data } = require("../lib/jwtfunctions");

module.exports = {
  enrollmentCard: async (req, res, next) => {
    const {
      user_idx,
      body: { token },
    } = req;

    let card_data = await verify_data(token);

    // 카드 유효성 체크
    const countCard = await db.card.count({
      where: { card_number: card_data.card_number, user_idx },
    });
    if (countCard !== 0) {
      return res.send({ success: 400, message: "이미 등록된 카드 입니다." });
    }

    card_data.user_idx = user_idx;

    // 메인으로 등록되어있는 카드가 있는지 체크
    const checkMainCard = await db.card.findOne({
      where: { user_idx, main: true },
    });
    // 카드가 메인이 있는지 없는지 체크
    if (!checkMainCard) {
      card_data.main = true;
    } else {
      card_data.main = false;
    }

    // 법인카드 유무 확인 후 체크
    card_data.birth
      ? (card_data.corporation_yn = false)
      : (card_data.corporation_yn = true);

    // 카드 정보 등록 후

    const createResult = await db.card.create(card_data);

    const cardInfo = {};
    cardInfo.cardId = createResult.idx;
    cardInfo.card_name = createResult.card_name;

    const first = createResult.card_number.substring(0, 4);
    const last = createResult.card_number.substring(12, 16);

    cardInfo.card_number = `${first} **** **** ${last}`;
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
