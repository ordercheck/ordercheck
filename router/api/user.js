const express = require('express');
const uuid = require('uuid').v1;
const router = express.Router();
const bcrypt = require('bcrypt');
const {
  addCard,
  payNow,
  refund,
  schedulePay,
} = require('../../lib/payFunction');
const db = require('../../model/db');
const _f = require('../../lib/functions');
const verify_data = require('../../lib/jwtfunctions');

const user_session_check = (req, res, next) => {
  next();
};
const {
  joinFunction,
  createRandomCompany,
  includeUserToCompany,
  giveMasterAuth,
  createFreePlan,
} = require('../../lib/apiFunctions');
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

  generateRandomCode,
} = require('../../lib/functions');
const functions = require('../../lib/functions');
const { checkCard } = require('../../model/db');
const attributes = require('../../lib/attributes');

let global_uidx = 0;

const check_data = (req, res, next) => {
  jwt.verify(req.query.token, process.env.tokenSecret, function (err, decoded) {
    if (err) {
      res.redirect('/admin');
    } else {
      next();
    }
  });
};

const createToken = async (data) => {
  // const expiresIn = 60 * 60 * 60;
  const token = await jwt.sign(data, process.env.tokenSecret);
  return token;
};
// 로그인 라우터
router.post('/login', async (req, res, next) => {
  const { user_phone, user_password } = req.body;

  let check = await db.user.findOne({ where: { user_phone } });
  if (!check) {
    return res.send({ success: 400, message: '비밀번호 혹은 전화번호 오류' });
  }

  if (check) {
    //  userCompany를 찾아 없으면 무료 플랜으로 전환
    let findUserCompany = await db.userCompany.findOne({
      where: { user_idx: check.idx, deleted: null },
    });
    if (!findUserCompany) {
      const findCompany = await db.company.findOne(
        { huidx: check.idx },
        { attributes: ['idx'] }
      );

      findUserCompany = await db.userCompany.create({
        where: {
          user_idx: check.idx,
          company_idx: findCompany.idx,
          searchingName: check.user_name,
        },
      });
    }

    const compareResult = await bcrypt.compare(
      user_password,
      check.user_password
    );
    if (!compareResult) {
      return res.send({ success: 400, message: '비밀번호 혹은 전화번호 오류' });
    }
    const tokenData = {};
    tokenData.user_idx = check.idx;

    token = await createToken(tokenData);
    res.send({ success: 200, token });
  } else {
    res.send({ success: 400, message: '비밀번호 혹은 전화번호 오류' });
  }
});
// 회원가입 체크 라우터
router.post('/join/check', async (req, res) => {
  const { user_email, user_phone } = req.body;
  const randomNumber = generateRandomCode(6);
  const message = `[인증번호:${randomNumber}] 오더체크 인증번호입니다.\n오더체크와 편리한 고객응대를 시작해보세요.`;
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
    data: { user_phone, message, type: 'SMS' },
  });

  if (result.data.success == 200) {
    res.send({ success: 200, number: randomNumber });
  } else {
    res.send({ success: 400, type: 'code' });
  }
});
// 비밀번호 찾기 인증번호
router.post('/check/pw', async (req, res) => {
  const { user_phone } = req.body;

  const randomNumber = generateRandomCode(6);
  const message = `[인증번호: ${randomNumber}] \n 오더체크 인증번호입니다.`;
  try {
    await axios({
      url: '/api/send/sms',
      method: 'post', // POST method
      headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
      data: { user_phone, message, type: 'SMS' },
    });
    return res.send({ success: 200, number: randomNumber });
  } catch (err) {
    return res.send({ success: 500, msg: err.message });
  }
});

// 회원가입 라우터
router.post('/join/do', async (req, res) => {
  let { token } = req.body;
  let user_data = await verify_data(token);

  if (user_data) {
    const { createUserResult, success, message } = await joinFunction(
      user_data
    );
    if (!success) {
      return res.send({ success: 400, message: message });
    }

    // 랜덤 회사 만들기
    const randomCompany = await createRandomCompany(createUserResult.idx);
    // 유저 회사에 소속시키기
    await includeUserToCompany({
      user_idx: createUserResult.idx,
      company_idx: randomCompany.idx,
    });
    // master 권한 주기
    await giveMasterAuth(createUserResult.idx, randomCompany.idx);
    // 무료 플랜 만들기
    await createFreePlan(randomCompany.idx);

    const loginToken = await createToken({
      user_idx: createUserResult.idx,
      company_idx: randomCompany.idx,
    });

    return res.send({ success: 200, loginToken });
  } else {
    res.send({ success: 400 });
  }
});

//회사 등록 라우터
router.post('/company/check', async (req, res) => {
  const { lt, ut, ct, pt, company_name, company_subdomain } = req.body;
  let user_data = await verify_data(ut);
  let plan_data = await verify_data(pt);
  let card_data = await verify_data(ct);
  let login_data = await verify_data(lt);

  const companyCheck = async (user_phone, user_idx) => {
    let check_domain = await db.company
      .findAll({ where: { company_subdomain } })
      .then((r) => {
        return makeArray(r);
      });
    if (check_domain.length > 0) {
      return res.send({ success: 400, type: 'domain' });
    }

    const t = await db.sequelize.transaction();
    try {
      // 트랜젝션 시작

      await db.company.update(
        {
          company_name,
          company_subdomain,
        },
        { where: { huidx: login_data.user_idx }, transaction: t }
      );

      // 각 데이터에 필요한 key, value
      await db.company;
      card_data.company_idx = login_data.company_idx;
      card_data.user_idx = login_data.user_idx;

      // 법인카드 유무 확인 후 체크
      card_data.birth
        ? (card_data.credit_yn = 'false')
        : (card_data.credit_yn = 'true');

      // 카드 정보 등록 후
      await db.card.create(card_data, { transaction: t });

      // 시간을 unix형태로 변경
      const changeToTime = new Date(plan_data.start_plan);
      changeToUnix = changeToTime.getTime() / 1000;
      const nextMerchant_uid = uuid();

      // 다음 카드 결제 신청
      await schedulePay(
        changeToUnix,
        card_data.customer_uid,
        plan_data.result_price.replace(/,/g, ''),
        user_data.user_name,
        user_data.user_phone,
        user_data.user_email,
        nextMerchant_uid,
        plan_data.pay_type
      );
      plan_data.merchant_uid = nextMerchant_uid;
      await db.plan.update(plan_data, {
        where: { company_idx: login_data.company_idx },
        transaction: t,
      });

      //  트랜젝션 종료
      await t.commit();
      return res.send({ success: 200, message: '회사 등록 완료' });
    } catch (err) {
      console.log(err);
      // create과정에서 오류가 뜨면 롤백
      await t.rollback();
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  };
  if (user_data.user_phone) {
    let user_phone = user_data.user_phone;
    const user = await db.user.findOne({ where: { user_phone } });
    const user_idx = user.idx;
    await companyCheck(user_phone, user_idx);
    return;
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
  let check = await db.user.findOne({ where: { user_phone } });
  if (check) {
    const newHashPassword = await bcrypt.hash(
      user_password,
      parseInt(process.env.SALT)
    );
    await db.user.update(
      { user_password: newHashPassword },
      { where: { user_phone } }
    );
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

    return res.send({ success: 200, token });
  } catch (err) {
    const Err = err.message;
    return res.send({ success: 500, Err });
  }
});
// body 데이터를 토큰으로 만들기
router.post('/create/token/data', async (req, res) => {
  const { card_number, expiry, pwd_2digit, birth, business_number } = req.body;

  try {
    // 카드를 등록하는 경우
    if (req.body.card_number) {
      // 랜덤 string + 카드 뒤에 4자리
      const customer_uid = `${_f.random5()}${card_number.slice(-4)}`;
      req.body.customer_uid = customer_uid;
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
      const { success, imp_uid, card_name, message } = await payNow(
        customer_uid,
        1000,
        merchant_uid
      );
      if (!success) {
        return res.send({ success: 400, message });
      }

      req.body.card_name = card_name;

      const refundResult = await refund(imp_uid, 1000);

      if (!refundResult.success) {
        return res.send({ success: 400, message: refundResult.message });
      }
      let token = await createToken(req.body);
      return res.send({ success: 200, token });
    }

    let token = await createToken(req.body);
    return res.send({ success: 200, token });
  } catch (err) {
    console.log(err);
    const Err = err.message;
    return res.send({ success: 500, Err });
  }
});
router.post('/decode/token/data', async (req, res) => {
  const { token } = req.body;
  let data = await verify_data(token);
  return res.send({ success: 200, data });
});
// sms 보내기
router.post('/send/sms', async (req, res) => {
  const { user_phone, message, type } = req.body;
  let result = await _f.smsPush(user_phone, message, type);
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

// 중복된 회사 서브도메인 확인
router.post('/check/subdomain', async (req, res) => {
  const { company_subdomain } = req.body;
  try {
    const result = await db.company.findOne({ where: { company_subdomain } });
    if (!result) {
      return res.send({ success: 400, msg: '존재하지 않는 도메인입니다.' });
    } else
      res.send({
        success: 200,
        company_name: result.company_name,
        msg: '존재하는 도메인입니다.',
      });
  } catch (err) {
    const Err = err.message;
    return res.send({ success: 500, Err });
  }
});
// 중복된 회사 이름 확인
router.post('/check/company-name', async (req, res) => {
  const { company_name } = req.body;
  try {
    const result = await db.company.findOne({ where: { company_name } });
    if (!result) {
      return res.send({ success: 200 });
    } else res.send({ success: 400, msg: '이미 존재하는 회사 이름입니다.' });
  } catch (err) {
    const Err = err.message;
    return res.send({ success: 500, Err });
  }
});

// 중복된 비밀번호 확인
router.post('/check/password', async (req, res) => {
  const { user_password, user_phone } = req.body;
  try {
    const findUserResult = await db.user.findOne({ where: { user_phone } });

    const comparePasswordResult = await bcrypt.compare(
      user_password,
      findUserResult.user_password
    );

    if (comparePasswordResult) {
      return res.send({ success: 200, message: '이전 비밀번호와 같습니다.' });
    }
    return res.send({ success: 400, message: '이전 비밀번호와 다릅니다.' });
  } catch (err) {
    const Err = err.message;
    return res.send({ success: 500, Err });
  }
});

module.exports = router;
