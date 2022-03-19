const db = require("../model/db");
const { makeSpreadArray } = require("../lib/functions");
const {
  createRandomCompany,
  includeUserToCompany,
  createFreePlan,
} = require("../lib/apiFunctions");
const { masterConfig } = require("../lib/standardTemplate");
const { Template } = require("../lib/classes/TemplateClass");
const { cancelSchedule } = require("../lib/payFunction");
const bcrypt = require("bcrypt");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
const _f = require("../lib/functions");
const checkUserPassword = async (userIdx, userPassword) => {
  // 유저 전화번호 먼저 찾기
  const findUser = await db.user.findByPk(userIdx, {
    attributes: ["user_password"],
  });

  const compareResult = await bcrypt.compare(
    userPassword,
    findUser.user_password
  );

  //   비밀번호가 일치하지 않을 때
  if (!compareResult) {
    return false;
  }
  return true;
};

const updateUser = async (updateData, whereData) => {
  await db.user.update(updateData, {
    where: whereData,
  });
};

module.exports = {
  getUserProfile: async (req, res, next) => {
    const template = new Template({});
    try {
      let userProfile = await db.sequelize
        .query(
          `SELECT user.idx, personal_code, user_phone, userCompany.company_idx, user_profile, 
              user_email, user_name, plan, calculateReload, config_idx,
              whiteLabelChecked,chatChecked,analysticChecked,
              date_format(user.createdAt, '%Y.%m.%d') as createdAt
              FROM user 
              LEFT JOIN userCompany ON user.idx = userCompany.user_idx 
              LEFT JOIN userConfig ON user.idx = userConfig.user_idx
              LEFT JOIN plan ON userCompany.company_idx = plan.company_idx and plan.active = 1     
              WHERE user.idx = ${req.user_idx}`
        )
        .spread((r) => {
          return makeSpreadArray(r);
        });

      const findFilesResult = await db.files.findAll({
        where: {
          company_idx: userProfile[0].company_idx,
          isFolder: false,
        },
        attributes: ["file_size"],
        raw: true,
      });

      let fileStoreSize = 0;
      findFilesResult.forEach((data) => {
        fileStoreSize += data.file_size;
      });

      const findConfig = await template.findConfigFindByPk(
        userProfile[0].config_idx,
        {
          exclude: ["createdAt", "updatedAt", "company_idx", "duplicateCount"],
        }
      );

      userProfile[0].fileStoreSize = fileStoreSize;
      userProfile[0].authList = findConfig;

      return res.send({ success: 200, userProfile: userProfile[0] });
    } catch (err) {
      next(err);
    }
  },
  checkUserCompany: async (req, res, next) => {
    const { company_idx } = req;
    try {
      const findResult = await db.plan.findOne({
        where: { company_idx },
        attributes: ["plan"],
      });
      return res.send({ success: 200, findResult });
    } catch (err) {
      next(err);
    }
  },
  delUser: async (req, res, next) => {
    let {
      body: { user_password, reason },
      user_idx,
      company_idx,
    } = req;

    try {
      const checkResult = await checkUserPassword(user_idx, user_password);
      if (!checkResult) {
        res.send({
          success: 400,
          message: "비밀번호가 일치하지 않습니다.",
        });
      }
      // 탈퇴사유 생성
      await db.delReason.create({ reason, user_idx });

      // 계정 delete처리

      const deletedTime = moment().format("YYYY.MM.DD");

      await db.user.update(
        {
          deleted: deletedTime,
        },
        {
          where: {
            idx: user_idx,
          },
        }
      );

      return res.send({ success: 200 });

      //  결제 예정 플랜 취소
    } catch (err) {
      next(err);
    }
  },
  exitCompany: async (req, res, next) => {
    const {
      body: { user_password },
      user_idx,
      company_idx,
    } = req;
    const template = new Template({});

    const checkResult = await checkUserPassword(user_idx, user_password);
    if (!checkResult) {
      res.send({
        success: 400,
        message: "비밀번호가 일치하지 않습니다.",
      });
    }

    // 기존에 사용하던 무료플랜 있는지 체크
    const checkCompany = await db.company.findOne({
      where: {
        huidx: user_idx,
      },
      include: [
        {
          model: db.plan,
          where: { plan: "FREE" },
        },
      ],
    });

    // 기존의 회사가 없을 때
    if (!checkCompany) {
      // 랜덤 회사 만들기
      const randomCompany = await createRandomCompany(user_idx);

      // master template 만들기
      masterConfig.company_idx = randomCompany.idx;
      const createTempalteResult = await template.createConfig({
        masterConfig,
      });
      // 팀원 template  만들기
      await template.createConfig({
        company_idx: randomCompany.idx,
      });

      const findUser = await db.user.findByPk(user_idx, {
        attributes: ["user_name"],
      });

      // 유저 회사에 소속시키기
      await includeUserToCompany({
        user_idx: user_idx,
        company_idx: randomCompany.idx,
        searchingName: findUser.user_name,
        config_idx: createTempalteResult.idx,
      });
      // 무료 플랜 만들기
      await createFreePlan(randomCompany.idx);
    } else {
      await db.userCompany.update(
        { active: true },
        {
          where: {
            company_idx: checkCompany.idx,
            user_idx,
          },
        }
      );
    }

    if (user_idx == checkHuidx.huidx) {
      await db.userCompany.destroy({
        where: {
          company_idx,
        },
      });
      // 유저의 메인 카드 찾기
      const findMainCard = await db.card.findOne({
        where: { main: true, user_idx },
        attributes: ["customer_uid"],
      });

      // 플랜 merchant_uid 체크
      const findPlan = await db.plan.findOne({
        where: { company_idx, active: 3 },
        attributes: ["merchant_uid"],
      });

      await cancelSchedule(findMainCard.customer_uid, findPlan.merchant_uid);
    } else {
      await db.userCompany.destroy({
        where: {
          company_idx,
          user_idx,
        },
      });
    }

    return res.send({ success: 200 });
  },

  addUserProfile: async (req, res, next) => {
    const { file, user_idx } = req;

    const originalUrl = file.location;

    const thumbNail = originalUrl.replace(/\/original\//, "/thumb/");

    await db.user.update(
      {
        user_profile: thumbNail,
      },
      { where: { idx: user_idx } }
    );

    return res.send({ success: 200 });
  },

  delUserProfile: async (req, res, next) => {
    const { user_idx } = req;
    await db.user.update({ user_profile: "" }, { where: { idx: user_idx } });
    return res.send({ success: 200 });
  },
  changeUserProfile: async (req, res, next) => {
    const { body, user_idx, company_idx } = req;

    try {
      const result = Object.keys(body);
      result.forEach((data) => {
        if (!body[data]) {
          delete body[data];
        }
      });

      if (body.user_name) {
        await db.userCompany.update(
          {
            searchingName: body.user_name,
          },
          {
            where: { user_idx, company_idx },
          }
        );
      }

      await updateUser(body, { idx: user_idx });

      return res.send({ success: 200 });
    } catch (err) {
      return res.send({
        success: 400,
        message: "이미 존재하는 이메일 입니다.",
      });
    }
  },
  showUserAlarmConfig: async (req, res, next) => {
    const { user_idx } = req;

    const findResult = await db.userConfig.findOne({
      where: { user_idx },
      attributes: showUserAlarmConfigAttributes,
    });
    return res.send({ success: 200, findResult });
  },
  changeUserAlarmConfig: async (req, res, next) => {
    const { body } = req;
    const result = Object.keys(body);
    result.forEach((data) => {
      if (!body[data]) {
        delete body[data];
      }
    });

    await updateUser(body, { user_idx });
  },
};
