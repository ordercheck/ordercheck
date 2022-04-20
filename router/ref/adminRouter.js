const express = require("express");
const router = express.Router();
const db = require("../../model/db");
const _f = require("../../lib/functions");
const user_session_check = (req, res, next) => {
  next();
};
const fileUpload = require("../../lib/aws/fileupload.js");

const axios = require("axios");
const aws = require("../../lib/aws/aws");
const request = require("request");
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotalySecretKey");
const jusoKey = "devU01TX0FVVEgyMDIxMDUwNjE1Mjg1MzExMTEzNDQ=";
const jwt = require("jsonwebtoken");
const db_config = require("../../lib/config/db_config");

const { Expo } = require("expo-server-sdk");
const {
  makeArray,
  makeSpreadArray,
  randomString9,
} = require("../../lib/functions");

const tokenSecret = "qkdlwldmsaksakstp!!";
let global_uidx = 0;

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
router.get("/", async (req, res, next) => {
  res.render("admin/login");
});

router.post("/login", async (req, res) => {
  const { company_id, company_password } = req.body;

  let result = await db.companies
    .findAll({ where: { company_id, company_password } })
    .then((r) => {
      return makeArray(r);
    });
  if (result.length > 0) {
    const dataStoredInToken = result[0];
    const secret = tokenSecret;
    const expiresIn = 60 * 60 * 60;
    const loginToken = jwt.sign(dataStoredInToken, secret, { expiresIn });

    res.send({ success: 200, loginToken });
  } else {
    res.send({ success: 400 });
  }
});

router.get("/totalcase/upload", check_data, async (req, res) => {
  const token = req.query.token;
  const code = req.query.code == undefined ? "" : req.query.code;
  const company_data = await verify_data(token);
  if (code == "") {
    res.render("admin/totalcaseUpload", { company_data, token, code });
  } else {
    let data = await db.totalcases.findAll({ where: { code } }).then((r) => {
      return makeArray(r)[0];
    });
    res.render("admin/totalcaseUpdate", { company_data, token, code, data });
  }
});

router.post("/totalcase/d", check_data, async (req, res) => {
  const token = req.query.token;
  const { idx } = req.body;

  await db.totalcases.destroy({ where: { idx } });
  res.send({ success: 200 });
});

router.post("/banner/d", check_data, async (req, res) => {
  const token = req.query.token;
  const { idx } = req.body;

  await db.banners.destroy({ where: { idx } });
  res.send({ success: 200 });
});

router.post("/upload/image", async (req, res) => {
  let image_data = req.body.image_data;
  let file = image_data.bi;
  let query = {
    file: file,
    fileName: image_data.image_name,
    fileType: image_data.image_type,
  };

  fileUpload.ufile.blobUpload(query, async (err, url) => {
    console.log(err);
    console.log(url);
    if (err) {
      res.send({ success: 400, message: err });
    } else {
      res.send({ success: 200, url });
    }
  });
});

router.get("/base/main", check_data, async (req, res) => {
  const token = req.query.token;
  const company_data = await verify_data(token);
  const cidx = company_data.idx;
  let data = await db.companies.findAll({ where: { idx: cidx } }).then((r) => {
    return makeArray(r)[0];
  });
  res.render("admin/baseMainUpdate", { company_data, token, data });
});
router.post("/base/main", check_data, async (req, res) => {
  const {
    title,
    subTitle,
    logo,
    kakao_thumb,
    naver,
    instagram,
    facebook,
    footer,
  } = req.body;
  const token = req.query.token;
  const company_data = await verify_data(token);
  const cidx = company_data.idx;
  await db.companies.update(
    { title, subTitle, logo, kakao_thumb, naver, instagram, facebook, footer },
    { where: { idx: cidx } }
  );
  res.send({ success: 200 });
});

router.get("/totalcase/list", check_data, async (req, res) => {
  const token = req.query.token;
  const company_data = await verify_data(token);
  // let data = await db.totalcases.findAll({where:{active:1}}).then((r)=>{
  //     return makeArray(r)
  // })
  let data = await db.totalcases.findAll().then((r) => {
    return makeArray(r);
  });
  // res.send({success:200,data})
  res.render("admin/totalcaseList", { company_data, token, data });
});

router.post("/totalcase/active", check_data, async (req, res) => {
  const { idx, to } = req.body;
  const { token } = req.query;

  console.log(idx, to, token);
  await db.totalcases.update({ active: to }, { where: { idx } });

  res.send({ success: 200 });
});

router.post("/totalcase/upload", check_data, async (req, res) => {
  const token = req.query.token;
  const company_data = await verify_data(token);
  console.log(req.body);
  if (req.body._category.length == 0) {
    return res.send({ success: 400, message: "카테고리를 입력해주세요" });
  }
  if (req.body._category.length == 0) {
    return res.send({ success: 400, message: "카테고리를 입력해주세요" });
  }
  if (req.body._input_thumbnail == "") {
    return res.send({ success: 400, message: "썸네일을 업로드해주세요" });
  }
  // if(req.body._before_array.length == 0){
  //     return res.send({success:400, message:"BEFORE 사진을 입력해주세요"});
  // }
  if (req.body._after_array.length == 0) {
    return res.send({ success: 400, message: "AFTER 사진을 입력해주세요" });
  }

  let cidx = company_data.idx;
  let title = req.body._title;
  let highlight = req.body._hightlight;
  let category = req.body._category.join(", ");
  let price = req.body._price;
  let pyeung = req.body._pyeung;
  let date = req.body._date;
  let term = req.body._term;
  let term_type = req.body._term_type;
  let thumbnail = req.body._input_thumbnail;
  let before =
    req.body._before_array == undefined
      ? ""
      : req.body._before_array.join("**by**");
  let after = req.body._after_array.join("**by**");

  let code = req.body.code;

  if (code == "") {
    code = randomString9();
    await db.totalcases.create({
      cidx,
      title,
      highlight,
      category,
      price,
      pyeung,
      date,
      term,
      term_type,
      thumbnail,
      before,
      after,
      code,
    });
  } else {
    await db.totalcases.update(
      {
        title,
        highlight,
        category,
        price,
        pyeung,
        date,
        term,
        term_type,
        thumbnail,
        before,
        after,
      },
      { where: { code, cidx } }
    );
  }

  res.send({ success: 200, code });
});

router.get("/event/list", check_data, async (req, res) => {
  const token = req.query.token;
  const company_data = await verify_data(token);
  // let data = await db.totalcases.findAll({where:{active:1}}).then((r)=>{
  //     return makeArray(r)
  // })
  let data = await db.events.findAll().then((r) => {
    return makeArray(r);
  });
  // res.send({success:200,data})
  res.render("admin/eventList", { company_data, token, data });
});

router.get("/event/upload", check_data, async (req, res) => {
  const token = req.query.token;
  const company_data = await verify_data(token);
  const code = req.query.code == undefined ? "" : req.query.code;
  console.log(token);
  console.log(code);

  if (code == "") {
    res.render("admin/eventUpload", { company_data, token, code });
  } else {
    let data = await db.events.findAll({ where: { code } }).then((r) => {
      return makeArray(r)[0];
    });
    res.render("admin/eventUpdate", { company_data, token, code, data });
  }
});

router.post("/event/upload", check_data, async (req, res) => {
  try {
    let { title, thumbnail, start, end, image, code, link } = req.body;
    const token = req.query.token;
    const company_data = await verify_data(token);
    let cidx = company_data.idx;
    console.log(req.body);
    console.log(code);
    if (code == "") {
      code = randomString9();
      await db.events.create({
        cidx,
        title,
        thumbnail,
        image,
        start,
        end,
        code,
        link,
      });
      res.send({ success: 200, code });
    } else {
      await db.events.update(
        { title, thumbnail, image, start, end, link },
        { where: { code } }
      );
      res.send({ success: 200, code });
    }
  } catch (error) {
    console.log(error);
    res.send({ success: 400 });
  }
});

router.post("/event/active", check_data, async (req, res) => {
  const { idx, to } = req.body;
  const { token } = req.query;

  console.log(idx, to, token);
  await db.events.update({ active: to }, { where: { idx } });

  res.send({ success: 200 });
});

router.get("/banner/upload", check_data, async (req, res) => {
  const token = req.query.token;
  const company_data = await verify_data(token);
  const code = req.query.code == undefined ? "" : req.query.code;
  console.log(token);
  console.log(code);

  if (code == "") {
    res.render("admin/bannerUpload", { company_data, token, code });
  } else {
    let data = await db.banners.findAll({ where: { code } }).then((r) => {
      return makeArray(r)[0];
    });
    res.render("admin/bannerUpdate", { company_data, token, code, data });
  }
});

router.post("/banner/upload", check_data, async (req, res) => {
  try {
    let { title, link, banner, mobile_banner, code } = req.body;
    const token = req.query.token;
    const company_data = await verify_data(token);
    let cidx = company_data.idx;

    if (code == "") {
      code = randomString9();
      await db.banners.create({
        cidx,
        title,
        link,
        banner,
        mobile_banner,
        code,
      });
      res.send({ success: 200, code });
    } else {
      await db.banners.update(
        { title, link, banner, mobile_banner },
        { where: { code } }
      );
      res.send({ success: 200, code });
    }
  } catch (error) {
    console.log(error);
    res.send({ success: 400 });
  }
});

router.get("/banner/list", check_data, async (req, res) => {
  const token = req.query.token;
  const company_data = await verify_data(token);
  // let data = await db.totalcases.findAll({where:{active:1}}).then((r)=>{
  //     return makeArray(r)
  // })
  let data = await db.banners.findAll().then((r) => {
    return makeArray(r);
  });
  // res.send({success:200,data})
  res.render("admin/bannerList", { company_data, token, data });
});

router.post("/banner/active", check_data, async (req, res) => {
  const { idx, to } = req.body;
  const { token } = req.query;

  console.log(idx, to, token);
  await db.banners.update({ active: to }, { where: { idx } });

  res.send({ success: 200 });
});

router.post("/banner/order", check_data, async (req, res) => {
  const { idx, order } = req.body;
  await db.banners.update({ order }, { where: { idx } });

  res.send({ success: 200 });
});

module.exports = router;
