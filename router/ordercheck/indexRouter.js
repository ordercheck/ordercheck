const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const db = require("../../model/db");
const _f = require("../../lib/functions");
const user_session_check = (req, res, next) => {
  next();
};
const fileUpload = require("../../lib/aws/fileupload.js");

const axios = require("axios");
const aws = require("../../lib/aws/aws");
const request = require("request");
// const Cryptr = require("cryptr");
// const cryptr = new Cryptr("myTotalySecretKey");
const jusoKey = "devU01TX0FVVEgyMDIxMDUwNjE1Mjg1MzExMTEzNDQ=";
const jwt = require("jsonwebtoken");
const db_config = require("../../lib/config/db_config");

const { Expo } = require("expo-server-sdk");
const {
  makeArray,
  makeSpreadArray,
  randomString9,
} = require("../../lib/functions");

const HOST = "/";
const tokenSecret = "qkdlwldmsaksakstp!!";
let global_uidx = 0;

const plan = [
  {
    idx: 0,
    plan: "month",
    title: "Starter",
    limitCount: 40,
    price: 43000,
    whiteLabel: 0,
    analystic: 21500,
    chat: 21500,
  },
  {
    idx: 1,
    plan: "month",
    title: "Professional",
    limitCount: 100,
    price: 75800,
    whiteLabel: 0,
    analystic: 60700,
    chat: 60700,
  },
  {
    idx: 2,
    plan: "month",
    title: "Team",
    limitCount: 205,
    price: 125300,
    whiteLabel: 150400,
    analystic: 150400,
    chat: 150400,
  },
  {
    idx: 3,
    plan: "month",
    title: "Company",
    limitCount: 410,
    price: 227200,
    whiteLabel: 454300,
    analystic: 340700,
    chat: 340700,
  },

  {
    idx: 4,
    plan: "year",
    title: "Starter",
    limitCount: 40,
    price: 38000,
    whiteLabel: 0,
    analystic: 19000,
    chat: 19000,
  },
  {
    idx: 5,
    plan: "year",
    title: "Professional",
    limitCount: 100,
    price: 68000,
    whiteLabel: 0,
    analystic: 54000,
    chat: 54000,
  },
  {
    idx: 6,
    plan: "year",
    title: "Team",
    limitCount: 205,
    price: 112000,
    whiteLabel: 135000,
    analystic: 135000,
    chat: 135000,
  },
  {
    idx: 7,
    plan: "year",
    title: "Company",
    limitCount: 410,
    price: 204000,
    whiteLabel: 408000,
    analystic: 306000,
    chat: 306000,
  },
];

const check_data = (req, res, next) => {
  jwt.verify(req.query.token, tokenSecret, function (err, decoded) {
    console.log(err);
    console.log(decoded);
    if (err) {
      res.redirect("/admin");
    } else {
      next();
    }
  });
};
const verify_data = async (token) => {
  return await jwt.verify(token, tokenSecret, function (err, decoded) {
    if (err) {
      return false;
    } else {
      return decoded;
    }
  });
};

const createToken = async (data) => {
  const expiresIn = 60 * 60 * 60;
  const last_login = _f.getNowTime();
  const token = await jwt.sign(data, tokenSecret, { expiresIn });
  return token;
};

const alwaysCheck = async (req, res, next) => {
  res.locals.HOST = HOST;
  next();
};
router.get("/", alwaysCheck, async (req, res, next) => {
  res.send({ success: 200 });
});
router.get("/login", async (req, res, next) => {
  res.render("ordercheck/auth/login");
});

router.get("/join/select-account", alwaysCheck, async (req, res, next) => {
  let title = "회원가입 선택";
  res.render("ordercheck/auth/join_select_account", { title });
});
router.get("/join/create-account", alwaysCheck, async (req, res, next) => {
  let title = "회원가입(휴대폰)";
  res.render("ordercheck/auth/join_create_account", { title });
});
router.get("/join/agree", alwaysCheck, async (req, res, next) => {
  const { token } = req.query;
  let title = "약관동의";
  res.render("ordercheck/auth/join_agree", { title, token });
});
router.get("/join/complete", alwaysCheck, async (req, res, next) => {
  const { token } = req.query;
  let result = await axios({
    url: "/api/join/do",
    method: "post", // POST method
    headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
    data: { token },
  });
  console.log(result.data);
  if (result.data.success == 200) {
    let title = "회원가입 완료";
    res.render("ordercheck/auth/join_complete", { title });
  } else {
    let title = "회원가입 문제 발생";
    res.render("ordercheck/auth/join_fail", { title });
  }
});

//요금제 가입
router.get("/subscribe/step1", alwaysCheck, async (req, res, next) => {
  let title = "요금제 가입 1단계";
  res.render("ordercheck/auth/subscribe_step01", { title, plan });
});
router.get("/subscribe/step2", alwaysCheck, async (req, res, next) => {
  let title = "요금제 가입 2단계";
  res.render("ordercheck/auth/subscribe_step02", { title });
});
router.get("/subscribe/step3", alwaysCheck, async (req, res, next) => {
  let title = "요금제 가입 3단계";
  res.render("ordercheck/auth/subscribe_step03", { title });
});
router.get("/subscribe/complete", alwaysCheck, async (req, res, next) => {
  let title = "요금제 카드 등록";
  res.render("ordercheck/auth/join_complete02", { title });
});

router.get("/password/find", alwaysCheck, async (req, res, next) => {
  let title = "비밀번호 찾기";
  res.render("ordercheck/auth/password_find", { title });
});
router.get("/password/reset", alwaysCheck, async (req, res, next) => {
  const { user_phone } = req.query;
  let title = "비밀번호 재설정";
  res.render("ordercheck/auth/password_reset", { title, user_phone });
});
router.get("/password/complete", alwaysCheck, async (req, res, next) => {
  let title = "비밀번호 재설정 완료";
  res.render("ordercheck/auth/password_complete", { title });
});

router.get("/information", async (req, res, next) => {
  let findAllUser = await db.user.findAll({
    where: { deleted: null },
    include: [
      {
        model: db.card,
        attributes: ["idx"],
        require: false,
      },
    ],
  });
  findAllUser = JSON.parse(JSON.stringify(findAllUser));

  let findCompany = await db.company.findAll({
    where: { company_name: { [Op.ne]: "" }, deleted: null },
    include: [
      {
        model: db.userCompany,
        where: { active: true, standBy: false },
      },
      {
        model: db.plan,
        where: { active: 1 },
      },
    ],
  });

  findCompany = JSON.parse(JSON.stringify(findCompany));

  let findReceipt = await db.receipt.findAll({
    where: { receipt_kind: "자동 문자 충전" },
    include: [
      {
        model: db.company,
        include: [
          {
            model: db.user,
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  res.render("ordercheck/auth/information", {
    findAllUser,
    findCompany,
    findReceipt,
  });
});

module.exports = router;
