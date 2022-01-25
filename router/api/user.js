const express = require('express');
const router = express.Router();
const {
  addCard,
  payNow,
  refund,
  schedulePay,
} = require('../../lib/payFunction');
const db = require('../../model/db');
const _f = require('../../lib/functions');
const verify_data = require('../../lib/jwtfunctions');
let masterConfig = require('../../lib/masterConfig');
const user_session_check = (req, res, next) => {
  next();
};
const jwt = require('jsonwebtoken');
const fileUpload = require('../../lib/aws/fileupload.js');
const multiparty = require('multiparty');
const axios = require('axios');
const aws = require('../../lib/aws/aws');
const request = require('request');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');
const jusoKey = 'devU01TX0FVVEgyMDIxMDUwNjE1Mjg1MzExMTEzNDQ=';

const db_config = require('../../lib/config/db_config');

const { Expo } = require('expo-server-sdk');
const {
  makeArray,
  makeSpreadArray,
  randomString9,
} = require('../../lib/functions');
const functions = require('../../lib/functions');
const { checkCard } = require('../../model/db');

let global_uidx = 0;

const check_data = (req, res, next) => {
  jwt.verify(req.query.token, process.env.tokenSecret, function (err, decoded) {
    console.log(err);
    console.log(decoded);
    if (err) {
      res.redirect('/admin');
    } else {
      next();
    }
  });
};

const createToken = async (data) => {
  // const expiresIn = 60 * 60 * 60;
  const last_login = _f.getNowTime();
  const token = await jwt.sign(data, process.env.tokenSecret);
  return token;
};
// 로그인 라우터
router.post('/login', async (req, res, next) => {
  const { user_phone, user_password } = req.body;
  // let user_password_crypt = functions.cryptFunction(0,user_password,'')
  // let user_password_decode = functions.cryptFunction(1,'',user_password_crypt)
  // console.log(user_password_decode)
  let check = await db.user
    .findAll({ where: { user_phone, user_password } })
    .then((r) => {
      return makeArray(r);
    });

  if (check.length > 0) {
    const userIdx = {};
    userIdx.idx = check[0].idx;
    token = await createToken(userIdx);
    res.send({ success: 200, token });
  } else {
    res.send({ success: 400 });
  }
});
// 회원가입 체크 라우터
router.post('/join/check', async (req, res) => {
  const { user_email, user_phone } = req.body;
  const randInt = Math.random() * 1000;
  const message = `[인증번호:${parseInt(
    randInt
  )}] 오더체크에서 보내는 인증번호입니다.\n오더체크와 편리한 고객응대를 시작해보세요.`;
  let phoneCheck = await db.user
    .findAll({ where: { user_phone } })
    .then((r) => {
      return makeArray(r);
    });

  if (phoneCheck.length > 0) {
    return res.send({ success: 400, type: 'phone' });
  }
  let emailCheck = await db.user
    .findAll({ where: { user_email } })
    .then((r) => {
      return makeArray(r);
    });
  if (emailCheck.length > 0) {
    return res.send({ success: 400, type: 'email' });
  }
  let result = await axios({
    url: '/api/send/sms',
    method: 'post', // POST method
    headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
    data: { user_phone, message },
  });

  if (result.data.success == 200) {
    res.send({ success: 200, number: parseInt(randInt) });
  } else {
    res.send({ success: 400, type: 'code' });
  }
});
// 비밀번호 찾기 인증번호
router.post('/check/pw', async (req, res) => {
  const { user_phone } = req.body;
  const randInt = Math.random() * 1000;
  const message = `[인증번호: ${parseInt(
    randInt
  )}] \n 오더체크에서 보내는 인증번호입니다.`;
  try {
    let result = await axios({
      url: '/api/send/sms',
      method: 'post', // POST method
      headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
      data: { user_phone, message },
    });
    return res.send({ success: 200, number: parseInt(randInt) });
  } catch (err) {
    return res.send({ success: 500, msg: err.message });
  }
});

// 회원가입 라우터
router.post('/join/do', async (req, res) => {
  let { token } = req.body;
  let user_data = await verify_data(token);
  let last_login = _f.getNowTimeFormatNow();
  user_data.last_login = last_login;
  if (user_data) {
    let phoneCheck = await db.user
      .findAll({ where: { user_phone: user_data.user_phone } })
      .then((r) => {
        return makeArray(r);
      });

    if (phoneCheck.length > 0) {
      res.send({ success: 400, msg: '이미 존재하는 계정' });
    } else {
      user_data.personal_code = Math.random().toString(36).substr(2, 11);

      const result = await db.user.create(user_data);
      const loginToken = await createToken({ idx: result.idx });
      return res.send({ success: 200, loginToken });
    }
  } else {
    res.send({ success: 400 });
  }
});

//회사 등록 라우터
router.post('/company/check', async (req, res) => {
  const { ut, ct, pt, company_name, company_subdomain } = req.body;
  let user_data = await verify_data(ut);
  let plan_data = await verify_data(pt);
  let card_data = await verify_data(ct);
  const companyCheck = async (user_phone, user_idx) => {
    let check_name = await db.company
      .findAll({ where: { company_name } })
      .then((r) => {
        return makeArray(r);
      });
    if (check_name.length > 0) {
      return res.send({ success: 400, type: 'name' });
    }

    let check_domain = await db.company
      .findAll({ where: { company_subdomain } })
      .then((r) => {
        return makeArray(r);
      });
    if (check_domain.length > 0) {
      return res.send({ success: 400, type: 'domain' });
    }

    let user = await db.user.findAll({ where: { user_phone } }).then((r) => {
      return makeArray(r);
    });

    if (user.length > 0) {
      let huidx = user[0].idx;
      let doubleCheck = await db.company
        .findAll({ where: { huidx } })
        .then((r) => {
          return makeArray(r);
        });
      if (doubleCheck.length > 0) {
        res.send({ success: 400, type: 'double' });
      } else {
        const t = await db.sequelize.transaction();
        try {
          // 트랜젝션 시작

          const { idx } = await db.company.create(
            {
              huidx,
              company_name,
              company_subdomain,
            },
            { transaction: t }
          );

          await db.userCompany.create(
            {
              user_idx,
              company_idx: idx,
              authority: 1,
            },
            { transaction: t }
          );
          // 각 데이터에 필요한 key, value
          plan_data.company_idx = idx;
          plan_data.user_idx = huidx;

          card_data.company_idx = idx;
          card_data.user_idx = user[0].idx;

          // 법인카드 유무 확인 후 체크
          card_data.birth
            ? (card_data.credit_yn = 'false')
            : (card_data.credit_yn = 'true');

          // 카드 정보 등록 후
          await db.card.create(card_data, { transaction: t });

          const nowMerchant_uid = _f.random5();
          // 카드 결제
          const { success, imp_uid, message } = await payNow(
            card_data.customer_uid,
            plan_data.result_price.replace(/,/g, ''),
            nowMerchant_uid
          );

          // 잔고가 없을때
          if (!success) {
            await t.rollback();
            return res.send({ sucecss: 400, message });
          }
          // 결제 후 plan data에 주문 번호 넣고 plan db에 저장
          plan_data.imp_uid = imp_uid;
          const createPlanResult = await db.plan.create(plan_data, {
            transaction: t,
          });
          // 시간을 unix형태로 변경
          const changeToTime = new Date();
          let changeToUnix = new Date(
            changeToTime.setSeconds(changeToTime.getSeconds() + 30)
          );
          // const changeToTime = new Date(plan_data.start_plan);
          changeToUnix = changeToTime.getTime() / 1000;

          await db.pay.create(
            {
              imp_uid,
              user_name: user_data.user_name,
              user_phone: user_data.user_phone,
              user_email: user_data.user_email,
              customer_uid: card_data.customer_uid,
            },
            { transaction: t }
          );
          const nextMerchant_uid = _f.random5();
          // 다음 카드 결제 신청
          await schedulePay(
            changeToUnix,
            card_data.customer_uid,
            plan_data.result_price.replace(/,/g, ''),
            user_data.user_name,
            user_data.user_phone,
            user_data.user_email,
            nextMerchant_uid
          );
          await db.planExpect.create(
            {
              merchant_uid: nextMerchant_uid,
              plan_idx: createPlanResult.idx,
            },
            { transaction: t }
          );
          masterConfig.user_idx = user[0].idx;
          await db.config.create(masterConfig, { transaction: t });
          //  트랜젝션 종료
          await t.commit();

          return res.send({ success: 200 });
        } catch (err) {
          // create과정에서 오류가 뜨면 롤백

          await t.rollback();
          const Err = err.message;
          return res.send({ success: 500, Err });
        }
      }
    } else {
      return res.send({ success: 400, type: 'auth' });
    }
  };
  if (user_data.user_phone) {
    let user_phone = user_data.user_phone;
    const user = await db.user.findOne({ where: { user_phone } });
    const user_idx = user.idx;
    await companyCheck(user_phone, user_idx);
  } else {
    let { user_phone } = await db.user.findByPk(user_data.idx);

    const user_idx = user_data.idx;
    await companyCheck(user_phone, user_idx);
  }
});
// 핸드폰 등록 여부 확인 라우터
router.post('/phone/check', async (req, res) => {
  const { user_phone } = req.body;
  let check = await db.user.findAll({ where: { user_phone } }).then((r) => {
    return makeArray(r);
  });
  if (check.length > 0) {
    return res.send({ success: 200 });
  } else {
    return res.send({ success: 400 });
  }
});
// 패스워드 수정 라우터
router.post('/password/reset', async (req, res) => {
  const { user_phone, user_password } = req.body;
  let check = await db.user.findAll({ where: { user_phone } }).then((r) => {
    return makeArray(r);
  });
  if (check.length > 0) {
    await db.user.update({ user_password }, { where: { user_phone } });
    return res.send({ success: 200 });
  } else {
    return res.send({
      success: 400,
      message:
        '사용자 정보가 잘못되었습니다.\n비밀번호 재설정 초기화면으로 돌아가 다시 시작해주시기 바랍니다.',
    });
  }
});
// 회원 정보로 token 만들기
router.post('/create/token', async (req, res) => {
  const { user_phone, user_email, user_password, user_name } = req.body;
  try {
    let token = await createToken({
      user_phone,
      user_email,
      user_password,
      user_name,
    });
    console.log(token);
    return res.send({ success: 200, token });
  } catch (err) {
    const Err = err.message;
    return res.send({ success: 500, Err });
  }
});
// body 데이터를 토큰으로 만들기
router.post('/create/token/data', async (req, res) => {
  const { card_number, expiry, pwd_2digit, birth, business_number } = req.body;
  const customer_uid = _f.random5();
  req.body.customer_uid = customer_uid;
  // 카드를 등록하는 경우
  if (req.body.card_number) {
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
    const merchant_uid = _f.random5();
    const imp_uid = await payNow(customer_uid, 1000, merchant_uid);
    console.log(imp_uid);
    await refund(imp_uid, 1000);
    let token = await createToken(req.body);
    return res.send({ success: 200, token });
  }

  let token = await createToken(req.body);
  return res.send({ success: 200, token });
});
router.post('/decode/token/data', async (req, res) => {
  const { token } = req.body;
  let data = await verify_data(token);
  return res.send({ success: 200, data });
});
// sms 보내기
router.post('/send/sms', async (req, res) => {
  const { user_phone, message } = req.body;
  let result = await _f.smsPush(user_phone, message);
  return res.send(result);
});
// 중복된 핸드폰 번호 여부 확인
router.post('/duplicate/phoneNumber', async (req, res) => {
  const { user_phone } = req.body;
  try {
    const result = await db.user.findOne({ where: { user_phone } });
    if (!result) {
      return res.send({ success: 200 });
    } else res.send({ success: 400, msg: '이미 존재하는 핸드폰 번호입니다' });
  } catch (err) {
    const Err = err.message;
    return res.send({ success: 500, Err });
  }
});
// 중복된 이메일 여부 확인
router.post('/duplicate/email', async (req, res) => {
  const { user_email } = req.body;
  try {
    const result = await db.user.findOne({ where: { user_email } });
    if (!result) {
      return res.send({ success: 200 });
    } else res.send({ success: 400, msg: '이미 존재하는 이메일입니다' });
  } catch (err) {
    const Err = err.message;
    return res.send({ success: 500, Err });
  }
});

module.exports = router;
