const express = require("express");
const uuid = require("uuid").v1;
const router = express.Router();
const bcrypt = require("bcrypt");
const { lookup } = require("geoip-lite");
const {
  addCard,
  payNow,
  refund,
  schedulePay,
} = require("../../lib/payFunction");
const { masterConfig } = require("../../lib/standardTemplate");
const db = require("../../model/db");
const { Template } = require("../../lib/classes/TemplateClass");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
const _f = require("../../lib/functions");
const { verify_data, createToken } = require("../../lib/jwtfunctions");

const user_session_check = (req, res, next) => {
  next();
};
const {
  joinFunction,
  createRandomCompany,
  includeUserToCompany,
  createFreePlan,
} = require("../../lib/apiFunctions");
const jwt = require("jsonwebtoken");
const fileUpload = require("../../lib/aws/fileupload.js");

const axios = require("axios");
const aws = require("../../lib/aws/aws");
const request = require("request");
// const Cryptr = require("cryptr");
// const cryptr = new Cryptr("myTotalySecretKey");
const jusoKey = "devU01TX0FVVEgyMDIxMDUwNjE1Mjg1MzExMTEzNDQ=";

const db_config = require("../../lib/config/db_config");

const { Expo } = require("expo-server-sdk");
const {
  makeArray,

  generateRandomCode,
} = require("../../lib/functions");
const functions = require("../../lib/functions");
const { checkCard } = require("../../model/db");
const attributes = require("../../lib/attributes");
// const { next } = require("cheerio/lib/api/traversing");
const { Alarm } = require("../../lib/classes/AlarmClass");

const addPlanAndSchedule = async (
  user_data,
  plan_data,
  card_data,
  findUser,
  company_data
) => {
  try {
    card_data.user_idx = findUser.idx;

    // 법인카드 유무 확인 후 체크
    card_data.birth
      ? (card_data.corporation_yn = false)
      : (card_data.corporation_yn = true);

    // 카드 정보 등록 후

    await db.card.create(card_data);

    // 시간을 unix형태로 변경(실제)
    const Hour = moment().format("HH");

    const startDate = plan_data.start_plan.replace(/\./g, "-");

    const changeToUnix = moment(`${startDate} ${Hour}:00`).unix();

    const nextMerchant_uid = generateRandomCode();

    //  테스트
    // const now = new Date();
    // let changeToTime = new Date(now.setSeconds(now.getSeconds() + 30));
    // changeToUnix = changeToTime.getTime() / 1000;

    // 다음 카드 결제 신청
    await schedulePay(
      changeToUnix,
      card_data.customer_uid,
      plan_data.result_price_levy,
      user_data.user_name,
      user_data.user_phone,
      user_data.user_email,
      nextMerchant_uid
    );
    plan_data.merchant_uid = nextMerchant_uid;
    plan_data.company_idx = company_data.idx;
    await db.plan.create({
      ...plan_data,
      active: 3,
    });
    plan_data.free_period_start = moment().format("YYYY.MM.DD");
    plan_data.free_period_expire = plan_data.expire_plan;
    await db.plan.create(plan_data);
    return { success: true };
  } catch (err) {
    return { success: false, err };
  }
};
// 플랜 수동으로 넣기
router.post("/selfPlan", async (req, res) => {
  const {
    start_plan,
    customer_uid,
    result_price_levy,
    user_name,
    user_phone,
    user_email,
    nextMerchant_uid,
  } = req.body;

  // 시간을 unix형태로 변경(실제)
  const Hour = moment().format("HH");

  const startDate = start_plan.replace(/\./g, "-");

  const changeToUnix = moment(`${startDate} ${Hour}:00`).unix();

  await schedulePay(
    changeToUnix,
    customer_uid,
    result_price_levy,
    user_name,
    user_phone,
    user_email,
    nextMerchant_uid
  );
  return res.send({ success: 200 });
});

// 로그인 라우터
router.post("/login", async (req, res, next) => {
  const { user_phone, user_password, company_subdomain } = req.body;

  const template = new Template({});
  const last_login = moment();
  let check = await db.user.findOne({ where: { user_phone, deleted: null } });

  if (!check) {
    return res.send({ success: 400, message: "비밀번호 혹은 전화번호 오류" });
  }

  const compareResult = await bcrypt.compare(
    user_password,
    check.user_password
  );
  if (!compareResult) {
    return res.send({ success: 400, message: "비밀번호 혹은 전화번호 오류" });
  }

  // 로그인 제한 걸렸을 때
  if (!check.login_access) {
    return res.send({ success: 400, message: "로그인 제한" });
  }

  const companyInfo = await db.userCompany.findOne({
    where: {
      user_idx: check.idx,
      active: true,
      standBy: false,
    },
    include: [
      {
        model: db.company,
        attributes: ["company_subdomain"],
      },
    ],
    attributes: ["company_idx"],
  });
  const loginToken = await createToken({ user_idx: check.idx });
  if (!company_subdomain) {
    res.send({
      success: 200,
      loginToken,
      company_subdomain: companyInfo.company.company_subdomain,
    });
  } else {
    // 이미 가입한 회사가 있을 때
    const checkAlready = await db.userCompany.findOne({
      where: { active: true, standBy: false, user_idx: check.idx },
      include: [
        {
          model: db.company,
          where: { companyexist: true },
        },
      ],
    });

    if (checkAlready) {
      // 가입 되어 있는 회사가 해당 회사일 때
      const findIncludeCompany = await db.userCompany.findOne({
        where: { user_idx: check.idx, active: true, standBy: false },
        attributes: ["company_idx"],
      });
      const findCompanySubdomain = await db.company.findByPk(
        findIncludeCompany.company_idx,
        {
          attributes: ["company_subdomain"],
        }
      );

      if (findCompanySubdomain.company_subdomain == company_subdomain) {
        res.send({
          success: 200,
          loginToken,
          status: "access",
          company_subdomain: companyInfo.company.company_subdomain,
        });
      } else {
        res.send({
          success: 200,
          loginToken,
          status: "already",
          company_subdomain: companyInfo.company.company_subdomain,
        });
      }
    } else {
      // 링크로 로그인 할 때
      const findCompany = await db.company.findOne({
        where: { company_subdomain, deleted: null },
      });
      let checkCompanyStandBy = await db.userCompany.findOne({
        where: {
          user_idx: check.idx,
          company_idx: findCompany.idx,
        },
        attributes: ["active", "standBy"],
      });

      if (!checkCompanyStandBy) {
        const findConfigResult = await template.findConfig(
          {
            template_name: "팀원",
            company_idx: findCompany.idx,
          },
          ["idx"]
        );

        checkCompanyStandBy = await includeUserToCompany({
          user_idx: check.idx,
          company_idx: findCompany.idx,
          standBy: true,
          active: true,
          searchingName: check.user_name,
          config_idx: findConfigResult.idx,
        });
      }
      let status;
      if (checkCompanyStandBy.active && checkCompanyStandBy.standBy) {
        status = "standBy";
      }
      if (!checkCompanyStandBy.active && checkCompanyStandBy.standBy) {
        status = "refused";
      }
      if (checkCompanyStandBy.active && !checkCompanyStandBy.standBy) {
        status = "access";
      }

      res.send({
        success: 200,
        loginToken,
        status,
        company_subdomain: companyInfo.company.company_subdomain,
      });
    }
  }
  await db.user.update(
    { last_login },
    {
      where: {
        idx: check.idx,
      },
    }
  );
  return;
});
// 회원가입 체크 라우터
router.post("/join/check", async (req, res) => {
  let { user_email, user_phone } = req.body;
  const randomNumber = generateRandomCode();
  const message = `[인증번호:${randomNumber}] 오더체크 인증번호입니다.\n오더체크와 편리한 고객응대를 시작해보세요.`;
  let phoneCheck = await db.user
    .findAll({ where: { user_phone } })
    .then((r) => {
      return makeArray(r);
    });

  if (phoneCheck.length > 0) {
    return res.send({ success: 400, type: "phone" });
  }
  let emailCheck = await db.user
    .findAll({ where: { user_email } })
    .then((r) => {
      return makeArray(r);
    });
  if (emailCheck.length > 0) {
    return res.send({ success: 400, type: "email" });
  }

  user_phone = user_phone.replace(
    /[ \{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\ '\"\\(\=]/gi,
    ""
  );

  let result = await axios({
    url: "/api/send/sms",
    method: "post", // POST method
    headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
    data: { user_phone, message, type: "SMS" },
  });

  if (result.data.success == 200) {
    res.send({ success: 200, number: randomNumber });
  } else {
    res.send({ success: 400, type: "code" });
  }
});
// 비밀번호 찾기 인증번호
router.post("/check/pw", async (req, res) => {
  let { user_phone } = req.body;

  const randomNumber = generateRandomCode();
  const message = `[인증번호: ${randomNumber}] \n 오더체크에서 보내는 인증번호입니다.`;
  user_phone = user_phone.replace(
    /[ \{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\ '\"\\(\=]/gi,
    ""
  );

  try {
    await axios({
      url: "/api/send/sms",
      method: "post", // POST method
      headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
      data: { user_phone, message, type: "SMS" },
    });
    return res.send({ success: 200, number: randomNumber });
  } catch (err) {
    return res.send({ success: 500, msg: err.message });
  }
});

// 회원가입 라우터
router.post("/join/do", async (req, res, next) => {
  let { token, use_agree, private_agree, marketing_agree, company_subdomain } =
    req.body;
  const template = new Template({});
  try {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    let user_data = await verify_data(token);
    // 동의 여부 체크
    user_data.use_agree = use_agree;
    user_data.private_agree = private_agree;
    user_data.marketing_agree = marketing_agree;
    user_data.regist_region = lookup(ip).city;

    if (user_data) {
      const { createUserResult, success, message } = await joinFunction(
        user_data
      );

      if (!success) {
        return res.send({ success: 400, message: message });
      }

      const loginToken = await createToken({
        user_idx: createUserResult.idx,
      });

      // 랜덤 회사 만들기
      const randomCompany = await createRandomCompany(createUserResult.idx);

      // master template 만들기
      masterConfig.company_idx = randomCompany.idx;
      const createTempalteResult = await template.createConfig(masterConfig);

      // 팀원 template  만들기
      await template.createConfig({
        company_idx: randomCompany.idx,
      });

      // 유저 회사에 소속시키기
      await includeUserToCompany({
        user_idx: createUserResult.idx,
        company_idx: randomCompany.idx,
        searchingName: user_data.user_name,
        config_idx: createTempalteResult.idx,
      });

      // 무료 플랜 만들기
      await createFreePlan(randomCompany.idx);

      if (!company_subdomain) {
        return res.send({ success: 200 });
      }

      // subdomain
      const findCompany = await db.company.findOne({
        where: { company_subdomain, deleted: null },
      });

      const findConfigResult = await template.findConfig(
        { template_name: "팀원", company_idx: findCompany.idx },
        ["idx"]
      );

      // userCompany 만들기 standBy true, active 0
      await includeUserToCompany({
        user_idx: createUserResult.idx,
        company_idx: findCompany.idx,
        standBy: true,
        active: true,
        searchingName: createUserResult.user_name,
        config_idx: findConfigResult.idx,
      });

      return res.send({
        success: 200,
        loginToken,
        company_subdomain: randomCompany.company_subdomain,
        status: "standBy",
      });
    }
  } catch (err) {
    next(err);
  }
});

//회사 등록 라우터
router.post("/company/check", async (req, res, next) => {
  const { ut, ct, pt, company_name, company_subdomain } = req.body;
  let user_data = await verify_data(ut);
  let plan_data = await verify_data(pt);
  let card_data = await verify_data(ct);
  try {
    // 도메인 체크
    let check_domain = await db.company
      .findAll({ where: { company_subdomain } })
      .then((r) => {
        return makeArray(r);
      });
    if (check_domain.length > 0) {
      return res.send({ success: 400, type: "domain" });
    }
    // user idx 찾기
    const findUser = await db.user.findOne({
      where: { user_phone: user_data.user_phone, deleted: null },
      attributes: ["idx", "user_name"],
    });

    // 기존 무료 플랜 비활성
    const FreePlan = await db.userCompany.findOne({
      where: { user_idx: findUser.idx },
      attributes: ["company_idx"],
    });

    const template = new Template({});

    // 회사 생성
    const company_data = await db.company.create({
      used_free_period: true,
      company_name,
      company_subdomain,
      huidx: findUser.idx,
      resetDate: moment().add("1", "M"),
    });

    await db.sms.create({ company_idx: company_data.idx });

    // master template 만들기
    masterConfig.company_idx = company_data.idx;

    const createTempalteResult = await template.createConfig(masterConfig);

    // 팀원 template  만들기
    await template.createConfig({
      company_idx: company_data.idx,
    });

    // 유저 회사에 소속시키기
    await includeUserToCompany({
      user_idx: findUser.idx,
      company_idx: company_data.idx,
      searchingName: findUser.user_name,
      config_idx: createTempalteResult.idx,
    });

    const addPlanResult = await addPlanAndSchedule(
      user_data,
      plan_data,
      card_data,
      findUser,
      company_data
    );

    if (addPlanResult.success) {
      res.send({ success: 200, message: "회사 등록 완료" });

      await db.company.destroy({ where: { idx: FreePlan.company_idx } });

      // 플랜 알람 보내기
      const alarm = new Alarm({});
      let now = moment();
      const freePlan = moment(plan_data.start_plan.replace(/\./g, "-"));
      let diffTime = moment.duration(freePlan.diff(now)).asDays();
      diffTime = Math.ceil(diffTime);

      const message = alarm.startFreeAlarm(diffTime);
      const insertData = {
        message,
        path: `/setting/manage_subscribe`,
        alarm_type: 37,
      };
      const sendMember = [findUser.idx];
      const io = req.app.get("io");
      alarm.sendMultiAlarm(insertData, sendMember, io);
      return;
    }

    next(addPlanResult.err);
  } catch (err) {
    next(err);
  }
});
// 핸드폰 등록 여부 확인 라우터
router.post("/phone/check", async (req, res) => {
  const { user_phone } = req.body;
  let check = await db.user
    .findAll({ where: { user_phone, deleted: null } })
    .then((r) => {
      return makeArray(r);
    });
  if (check.length > 0) {
    return res.send({ success: 200 });
  } else {
    return res.send({ success: 400 });
  }
});
// 패스워드 수정 라우터
router.post("/password/reset", async (req, res) => {
  const { user_phone, user_password } = req.body;
  let check = await db.user.findOne({ where: { user_phone, deleted: null } });
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
        "사용자 정보가 잘못되었습니다.\n비밀번호 재설정 초기화면으로 돌아가 다시 시작해주시기 바랍니다.",
    });
  }
});
// 회원 정보로 token 만들기
router.post("/create/token", async (req, res) => {
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
router.post("/create/token/data", async (req, res, next) => {
  const { card_number, expiry, pwd_2digit, birth, business_number } = req.body;

  try {
    // 카드를 등록하는 경우
    if (req.body.card_number) {
      if (pwd_2digit.length !== 2) {
        return res.send({
          success: 400,
          message: "비밀번호가 2자리 이하입니다.",
        });
      }
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
      const { success, imp_uid, card_name, card_code, message } = await payNow(
        customer_uid,
        1000,
        merchant_uid,
        "카드 입출금 확인"
      );
      if (!success) {
        return res.send({ success: 400, message });
      }

      req.body.card_name = card_name;
      req.body.card_code = card_code;

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
    next(err);
  }
});
router.post("/decode/token/data", async (req, res) => {
  const { token } = req.body;
  let data = await verify_data(token);
  return res.send({ success: 200, data });
});
// sms 보내기
router.post("/send/sms", async (req, res) => {
  const { user_phone, message, type } = req.body;
  let result = await _f.smsPush(user_phone, message, type);
  return res.send(result);
});
// 중복된 핸드폰 번호 여부 확인
router.post("/duplicate/phoneNumber", async (req, res) => {
  const { user_phone } = req.body;
  try {
    const result = await db.user.findOne({
      where: { user_phone, deleted: null },
    });

    if (!result) {
      return res.send({ success: 200 });
    } else res.send({ success: 400, msg: "이미 존재하는 핸드폰 번호입니다" });
  } catch (err) {
    const Err = err.message;
    return res.send({ success: 500, Err });
  }
});
// 중복된 이메일 여부 확인
router.post("/duplicate/email", async (req, res) => {
  const { user_email } = req.body;
  try {
    const result = await db.user.findOne({
      where: { user_email, deleted: null },
    });
    if (!result) {
      return res.send({ success: 200 });
    } else res.send({ success: 400, msg: "이미 존재하는 이메일입니다" });
  } catch (err) {
    const Err = err.message;
    return res.send({ success: 500, Err });
  }
});

// 중복된 회사 서브도메인 확인
router.post("/check/subdomain", async (req, res) => {
  const { company_subdomain } = req.body;
  try {
    const result = await db.company.findOne({
      where: { company_subdomain, deleted: null },
    });
    if (!result) {
      return res.send({ success: 400, msg: "존재하지 않는 도메인입니다." });
    } else
      res.send({
        success: 200,
        company_name: result.company_name,
        msg: "존재하는 도메인입니다.",
      });
  } catch (err) {
    const Err = err.message;
    return res.send({ success: 500, Err });
  }
});
// 중복된 회사 이름 확인
router.post("/check/company-name", async (req, res) => {
  const { company_name } = req.body;
  try {
    const result = await db.company.findOne({
      where: { company_name, deleted: null },
    });
    if (!result) {
      return res.send({ success: 200 });
    } else res.send({ success: 400, msg: "이미 존재하는 회사 이름입니다." });
  } catch (err) {
    const Err = err.message;
    return res.send({ success: 500, Err });
  }
});

// 중복된 비밀번호 확인
router.post("/check/password", async (req, res) => {
  const { user_password, user_phone } = req.body;
  try {
    const findUserResult = await db.user.findOne({
      where: { user_phone, deleted: null },
    });

    const comparePasswordResult = await bcrypt.compare(
      user_password,
      findUserResult.user_password
    );

    if (comparePasswordResult) {
      return res.send({ success: 200, message: "이전 비밀번호와 같습니다." });
    }
    return res.send({ success: 400, message: "이전 비밀번호와 다릅니다." });
  } catch (err) {
    const Err = err.message;
    return res.send({ success: 500, Err });
  }
});

router.post("/company/check/later", async (req, res, next) => {
  const { ut, ct, pt } = req.body;
  let user_data = await verify_data(ut);
  let plan_data = await verify_data(pt);
  let card_data = await verify_data(ct);

  const template = new Template({});

  try {
    // user idx 찾기
    const findUser = await db.user.findOne({
      where: { user_phone: user_data.user_phone, deleted: null },
      attributes: ["idx", "user_name"],
    });

    await db.company.destroy({ where: { huidx: findUser.idx } });

    // 랜덤 회사 만들기
    const randomCompany = await createRandomCompany(findUser.idx);
    await db.company.update(
      { used_free_period: true },
      { where: { idx: randomCompany.idx } }
    );
    // master template 만들기
    masterConfig.company_idx = randomCompany.idx;
    const createTempalteResult = await template.createConfig(masterConfig);

    // 팀원 template  만들기

    await template.createConfig({
      company_idx: randomCompany.idx,
    });

    // 유저 회사에 소속시키기
    await includeUserToCompany({
      user_idx: findUser.idx,
      company_idx: randomCompany.idx,
      searchingName: findUser.user_name,
      config_idx: createTempalteResult.idx,
    });

    const addPlanResult = await addPlanAndSchedule(
      user_data,
      plan_data,
      card_data,
      findUser,
      randomCompany
    );

    if (addPlanResult.success) {
      const loginToken = await createToken({
        user_idx: findUser.idx,
      });
      return res.send({
        success: 200,
        loginToken,
        company_subdomain: randomCompany.company_subdomain,
      });
    }

    next(addPlanResult.err);
  } catch (err) {
    next(err);
  }
});
router.post("/token/login", async (req, res, next) => {
  const { ut } = req.body;
  try {
    const user_data = await verify_data(ut);

    const findUser = await db.user.findOne({
      where: { user_phone: user_data.user_phone, deleted: null },
      include: [
        {
          model: db.userCompany,
          attributes: ["company_idx"],
          where: { active: true, standBy: false },
          include: {
            model: db.company,
            attributes: ["company_subdomain"],
          },
        },
      ],

      attributes: ["idx"],
    });

    const loginToken = await createToken({ user_idx: findUser.idx });

    res.send({
      success: 200,
      loginToken,
      company_subdomain: findUser.userCompanies[0].company.company_subdomain,
    });

    return;
  } catch (err) {
    next(err);
  }
});

module.exports = router;
