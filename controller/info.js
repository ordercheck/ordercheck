const db = require("../model/db");
const { makeSpreadArray } = require("../lib/functions");
const {
  createRandomCompany,
  includeUserToCompany,
  createFreePlan,
  findMemberExceptMe,
} = require("../lib/apiFunctions");
const { masterConfig } = require("../lib/standardTemplate");
const { showUserAlarmConfigAttributes } = require("../lib/attributes");
const { Template } = require("../lib/classes/TemplateClass");
const { cancelSchedule } = require("../lib/payFunction");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
const _f = require("../lib/functions");
const { EventBridge } = require("aws-sdk");
const attributes = require("../lib/attributes");
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
              LEFT JOIN userCompany ON user.idx = userCompany.user_idx AND active = true AND standBy = false
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

      const checkCompanyExist = await db.company.findByPk(company_idx, {
        attributes: ["companyexist"],
      });

      if (checkCompanyExist.companyexist) {
        return res.send({ success: 400, message: "회사를 먼저 나가주세요" });
      }

      // 결제 예정 취소
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

      if (findMainCard && findPlan) {
        // 결제 예정 취소
        await cancelSchedule(findMainCard.customer_uid, findPlan.merchant_uid);
      }

      // 탈퇴사유 생성
      await db.delReason.create({ reason, user_idx });

      // 계정 delete처리

      const deletedTime = moment();

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

    try {
      // 비밀번호가 일치하지 않을 경우
      const checkResult = await checkUserPassword(user_idx, user_password);
      if (!checkResult) {
        return res.send({
          success: 400,
          message: "비밀번호가 일치하지 않습니다.",
        });
      }

      // 지금 회사가 무료플랜인지 체크 나중에 삭제
      const checking = await db.plan.findOne({ where: { company_idx } });
      if (checking.plan == "FREE") {
        const checkHuidx = await db.company.findByPk(company_idx, {
          attributes: ["huidx"],
        });

        if (user_idx == checkHuidx.huidx) {
          const checkUsers = await db.userCompany.findAll({
            where: { company_idx, active: true, standBy: false },
            raw: true,
          });

          await db.company.destroy({ where: { idx: company_idx } });

          checkUsers.forEach(async (data) => {
            await db.userCompany.update(
              { active: true },
              {
                where: {
                  user_idx: data.user_idx,
                  active: false,
                  standBy: false,
                },
              }
            );
          });
          const template = new Template({});
          // 랜덤 회사 만들기
          const randomCompany = await createRandomCompany(user_idx);

          // master template 만들기
          masterConfig.company_idx = randomCompany.idx;
          const createTempalteResult = await template.createConfig(
            masterConfig
          );

          // 팀원 template  만들기
          await template.createConfig({
            company_idx: randomCompany.idx,
          });

          const findUser = await db.user.findByPk(user_idx);
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
          await db.userCompany.destroy({
            where: {
              company_idx,
              user_idx,
            },
          });
          await db.userCompany.update(
            { active: true },
            { where: { user_idx, active: false, standBy: false } }
          );
        }
        const findSub = await db.company.findOne({
          where: {
            huidx: user_idx,
          },
          attributes: ["company_subdomain"],
        });

        return res.send({
          success: 200,
          company_subdomain: findSub.company_subdomain,
        });
      }

      // 기존에 사용하던 무료플랜 체크
      // const checkCompany = await db.company.findOne({
      //   where: {
      //     huidx: user_idx,
      //   },
      //   include: [
      //     {
      //       model: db.plan,
      //       where: { plan: "FREE" },
      //     },
      //   ],
      // });

      const checkHuidx = await db.company.findByPk(company_idx, {
        attributes: ["huidx"],
      });
      // 소유주 체크
      if (user_idx == checkHuidx.huidx) {
        // 소유주가 탈퇴한 회사 delete처리
        const deletedTime = moment();

        await db.company.update(
          { deleted: deletedTime },
          { where: { idx: company_idx } }
        );

        // 소속 다 제거
        await db.userCompany.destroy({
          where: {
            company_idx,
          },
        });

        // 소유주 빼고 팀원들 찾기
        const findUserCompany = await findMemberExceptMe(company_idx, user_idx);

        // 팀원들 다른 플랜 active처리
        findUserCompany.forEach(async (data) => {
          await db.userCompany.update(
            { active: true },
            {
              where: { user_idx: data.user_idx, active: false, standBy: false },
            }
          );
        });

        const template = new Template({});
        // 랜덤 회사 만들기
        const randomCompany = await createRandomCompany(user_idx);

        // master template 만들기
        masterConfig.company_idx = randomCompany.idx;
        const createTempalteResult = await template.createConfig(masterConfig);

        // 팀원 template  만들기
        await template.createConfig({
          company_idx: randomCompany.idx,
        });

        const findUser = await db.user.findByPk(user_idx);
        // 유저 회사에 소속시키기
        await includeUserToCompany({
          user_idx: user_idx,
          company_idx: randomCompany.idx,
          searchingName: findUser.user_name,
          config_idx: createTempalteResult.idx,
        });

        await db.plan.update(
          { company_idx: randomCompany.idx },
          {
            where: {
              company_idx,
            },
          }
        );
      } else {
        await db.userCompany.destroy({
          where: {
            company_idx,
            user_idx,
          },
        });
        await db.userCompany.update(
          { active: true },
          { where: { user_idx, active: false, standBy: false } }
        );
      }

      const findCompanySub = await db.company.findOne({
        where: { huidx: user_idx },
      });

      return res.send({
        success: 200,
        company_subdomain: findCompanySub.company_subdomain,
      });
    } catch (err) {
      next(err);
    }
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
      // 비밀번호는 변경 하면 안됨
      if (body.user_password) {
        return res.send({ success: 400, message: "rejected" });
      }
      await db.user.update(body, {
        where: { idx: user_idx },
      });

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
    const { body, user_idx } = req;
    try {
      const result = Object.keys(body);
      result.forEach((data) => {
        if (!body[data]) {
          delete body[data];
        }
      });

      await db.userConfig.update(body, { where: { user_idx } });
      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },
  joinCompany: async (req, res, next) => {
    const {
      params: { company_subdomain },
      user_idx,
    } = req;
    try {
      // 회사 정보 먼저 찾기
      const findCompanyResult = await db.company.findOne({
        where: { company_subdomain, deleted: null },
        include: [
          {
            model: db.config,
            where: { template_name: "팀원" },
            attributes: ["idx"],
          },
        ],
        raw: true,
        nest: true,
        attributes: ["idx", "company_name"],
      });

      const findUserName = await db.user.findByPk(user_idx, {
        attributes: ["user_name"],
      });

      await db.userCompany.create({
        searchingName: findUserName.user_name,
        active: true,
        standBy: true,
        company_idx: findCompanyResult.idx,
        user_idx,
        config_idx: findCompanyResult.configs.idx,
      });

      return res.send({
        success: 200,
        company_subdomain,
        company_name: findCompanyResult.company_name,
      });
    } catch (err) {
      next(err);
    }
  },
};
