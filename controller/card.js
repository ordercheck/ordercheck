const db = require('../model/db');
const { payNow, refund } = require('../lib/payFunction');
const _f = require('../lib/functions');
module.exports = {
  enrollmentCard: async () => {
    const {
      card_number,
      expiry,
      birth,
      pwd_2digit,
      customer_uid,
      business_number,
    } = req.body;
    // 동일한 카드가 있는지 체크
    const checkCardResult = await db.card.findOne({
      where: { card_number, user_idx: req.user_idx },
    });

    if (checkCardResult) {
      return res.send({ success: 400, messsage: '이미 등록된 카드입니다' });
    }

    const cardAddResult = await addCard(
      card_number,
      expiry,
      birth,
      pwd_2digit,
      customer_uid,
      business_number
    );

    // 카드 등록 실패
    if (!cardAddResult.success) {
      return res.send({ success: 400, message: cardAddResult.message });
    }
    const merchant_uid = _f.randomString9;
    const { success, imp_uid, card_name, message } = await payNow(
      customer_uid,
      1000,
      merchant_uid
    );
    if (!success) {
      return res.send({ success: 400, message });
    }
    rea.body.card_name = card_name;
    const refundResult = await refund(imp_uid, 1000);

    if (!refundResult.success) {
      return res.send({ success: 400, message: refundResult.message });
    }
    await db.card.create(req.body);
    return res.send({ success: 200, message: '카드 등록 완료' });
  },
};
