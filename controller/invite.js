const {
  includeUserToCompany,
  createRandomCompany,
  createFreePlan,

  decreasePriceAndHistory,
} = require("../lib/apiFunctions");
const { masterConfig } = require("../lib/standardTemplate");
const {
  sendInviteEmail,
  sendJoinEmail,
} = require("../mail/sendOrdercheckEmail");
const { Company } = require("../lib/classes/CompanyClass");
const axios = require("axios");

const db = require("../model/db");
const { createToken } = require("../lib/jwtfunctions");
const { Template } = require("../lib/classes/TemplateClass");

const { Alarm } = require("../lib/classes/AlarmClass");

module.exports = {
  sendEmail: async (req, res, next) => {
    const {
      body: { company_url, target_email },
      user_idx,
      company_idx,
    } = req;
    try {
      const company_result = await db.company.findByPk(company_idx, {
        attributes: ["company_name"],
      });
      const user_result = await db.user.findByPk(user_idx, {
        attributes: ["user_name"],
      });
      target_email.forEach(async (target) => {
        await sendInviteEmail(
          company_url,
          company_result.company_name,
          user_result.user_name,
          target
        );
      });
      return res.send({ success: 200, msg: "이메일 보내기 성공" });
    } catch (err) {
      next(err);
    }
  },
  sendSMS: async (req, res, next) => {
    const {
      body: { company_url, target_phoneNumber },
      user_idx,
      company_idx,
      text_cost,
      repay,
      sms_idx,
      huidxToken,
      huidx,
    } = req;
    const io = req.app.get("io");
    const alarm = new Alarm({});
    // 문자 비용 계산(없으면 오류)
    if (text_cost < target_phoneNumber.length * 37) {
      return res.send({ success: 400, message: "LMS 비용이 부족합니다." });
    }

    // 회사 정보 찾기
    const findCompany = await db.company.findByPk(company_idx, {
      attributes: ["company_name"],
    });
    // 초대한 유저 찾기
    const findInviter = await db.user.findByPk(user_idx, {
      attributes: ["user_name", "user_phone"],
    });

    const message = `[${findCompany.company_name}]
안녕하세요,
${findInviter.user_name}님이 ${findCompany.company_name} 회사에 초대합니다:)
--
참여하기:
${company_url}
 `;

    for (i = 0; i < target_phoneNumber.length; i++) {
      const user_phone = target_phoneNumber[i].replace(
        /[ \{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\ '\"\\(\=]/gi,
        ""
      );

      await axios({
        url: "/api/send/sms",
        method: "post", // POST method
        headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
        data: { user_phone, message, type: "LMS" },
      });

      // 비용에서 차감
      // 알림톡 비용 차감 후 저장
      await decreasePriceAndHistory(
        { text_cost: 37 },
        sms_idx,
        "LMS",
        message,
        findInviter.user_phone,
        target_phoneNumber[i]
      );
    }

    // 문자 자동 충전
    if (repay) {
      const autoSms = await db.sms.findByPk(sms_idx, {
        attributes: ["text_cost", "auto_min", "auto_price"],
      });

      if (autoSms.text_cost < autoSms.auto_min) {
        await axios({
          url: "/api/config/company/sms/pay",
          method: "post", // POST method
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${huidxToken} `,
          }, // "Content-Type": "application/json"
          data: { text_cost: autoSms.auto_price },
        });
      }
    }

    res.send({ success: 200 });

    const checkSmsCost = await db.sms.findOne({
      where: { company_idx },
      attributes: ["text_cost"],
    });
    if (checkSmsCost.text_cost <= 1000) {
      const message = alarm.messageCostAlarm(checkSmsCost.text_cost);
      const insertData = {
        message,
        path: `/setting/message`,
        alarm_type: 36,
      };
      const sendMember = [huidx];
      alarm.sendMultiAlarm(insertData, sendMember, io);
    }
  },

  showStandbyUser: async (req, res, next) => {
    const { company_idx } = req;
    const company = new Company({});
    const standbyUser = await company.findMembers(
      {
        company_idx,
        active: true,
        standBy: true,
      },
      ["createdAt", "DESC"]
    );

    return res.send({ success: 200, standbyUser });
  },
  joinStandbyUser: async (req, res, next) => {
    const {
      params: { memberId },
      company_idx,
      user_idx,
    } = req;
    const findUserCompanyResult = await db.userCompany.findByPk(memberId, {
      attributes: ["user_idx", "company_idx"],
    });

    const findBeforeCompanyUser = await db.userCompany.findOne({
      where: {
        user_idx: findUserCompanyResult.user_idx,
        active: true,
        standBy: false,
      },
      include: [
        {
          model: db.user,
          attributes: ["user_email"],
        },
      ],
      attributes: ["idx", "searchingName"],
    });

    if (findBeforeCompanyUser) {
      await db.userCompany.update(
        { active: false },
        { where: { idx: findBeforeCompanyUser.idx } }
      );
    }

    await db.userCompany.update(
      { active: true, standBy: false },
      { where: { idx: memberId } }
    );

    res.send({ success: 200 });
    // 웹 알림 보내기
    const io = req.app.get("io");
    const alarm = new Alarm({});
    const findCompany = await db.company.findByPk(company_idx, {
      attributes: ["company_name", "company_subdomain"],
    });

    // 가입 신청자 알람
    const approveMessage = alarm.approveAlarmMember(findCompany.company_name);
    alarm.createAlarm({
      message: approveMessage,
      company_idx,
      user_idx: findUserCompanyResult.user_idx,
      alarm_type: 5,
    });

    //팀원들 알람
    const findCompanyMembers = await db.userCompany.findAll({
      where: {
        active: true,
        standBy: false,
        company_idx,
      },
      include: [
        {
          model: db.config,
          where: { member_approval: true },
        },
      ],
      attributes: ["user_idx"],
      raw: true,
    });

    const findAuthUser = await db.user.findByPk(user_idx, {
      attributes: ["user_name"],
    });

    const message = alarm.approveAlarmAuth(
      findAuthUser.user_name,
      findBeforeCompanyUser.searchingName
    );

    const members = [];

    findCompanyMembers.forEach((data) => {
      if (data.user_idx !== user_idx) {
        members.push(data.user_idx);
      }
    });

    const insertData = {
      message,
      alarm_type: 6,
      path: `/setting/manage_member`,
    };
    alarm.sendMultiAlarm(insertData, members, io);

    io.to(findUserCompanyResult.user_idx).emit("invite", "approve");

    // 이메일 보내기
    await sendJoinEmail(
      findBeforeCompanyUser.searchingName,
      findCompany.company_name,
      findBeforeCompanyUser.user.user_email
    );
    return;
  },
  refuseUser: async (req, res, next) => {
    const { memberId } = req.params;

    const findUserCompanyResult = await db.userCompany.findByPk(memberId, {
      attributes: ["user_idx"],
    });

    await db.userCompany.update(
      {
        active: true,
      },
      {
        where: {
          user_idx: findUserCompanyResult.user_idx,
          active: false,
          standBy: false,
        },
      }
    );

    await db.userCompany.update(
      { active: false, standBy: true },
      { where: { idx: memberId } }
    );

    res.send({ success: 200 });

    // 알림 보내기
    const io = req.app.get("io");
    io.to(findUserCompanyResult.user_idx).emit("invite", "refuse");
    return;
  },
  rejoinCompany: async (req, res, next) => {
    const {
      body: { company_subdomain },
      user_idx,
    } = req;

    // 재가입 신청 하고자 하는 회사 정보 먼저 찾기
    const findCompany = await db.company.findOne(
      { where: { company_subdomain, deleted: null } },
      { attributes: ["idx"] }
    );

    // userCompany 업데이트
    await db.userCompany.update(
      {
        active: true,
      },
      {
        where: {
          company_idx: findCompany.idx,
          user_idx,
        },
      }
    );
    return res.send({ success: 200 });
  },
  cancelJoinCompany: async (req, res, next) => {
    const {
      body: { company_subdomain },
      user_idx,
    } = req;
    const template = new Template({});

    try {
      const loginToken = await createToken({ user_idx });
      const findCompany = await db.company.findOne(
        { where: { company_subdomain, deleted: null } },
        { attributes: ["idx"] }
      );

      // 신청 삭제
      await db.userCompany.destroy({
        where: { company_idx: findCompany.idx, user_idx },
      });

      // 기존에 사용하던 무료플랜 있는지 체크
      const checkCompany = await db.company.findOne({
        where: {
          huidx: user_idx,
          deleted: null,
        },
      });

      // 기존의 회사가 없을 때
      if (!checkCompany) {
        // 랜덤 회사 만들기
        const randomCompany = await createRandomCompany(user_idx);

        // master template 만들기

        masterConfig.company_idx = randomCompany.idx;

        const createTempalteResult = await template.createConfig(masterConfig);

        // 팀원 template  만들기
        await template.createConfig({
          company_idx: randomCompany.idx,
        });

        const findUser = await db.user.findByPk(user_idx, {
          attributes: ["user_name"],
        });

        // 유저 회사에 소속시키기
        await includeUserToCompany({
          user_idx,
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

      return res.send({ success: 200, loginToken });
    } catch (err) {
      next(err);
    }
  },

  joinToCompany: async (req, res, next) => {
    const {
      user_idx,
      params: { company_subdomain },
    } = req;

    const findCompany = await db.company.findOne({
      where: { company_subdomain, deleted: null },
      attributes: ["idx"],
    });

    // 이미 가입 되어 있는지 체크
    const checkJoinCompany = await db.userCompany.count({
      where: {
        user_idx,
        company_idx: findCompany.idx,
        active: true,
        standBy: true,
      },
    });

    if (checkJoinCompany !== 0) {
      return res.send({
        success: 400,
        message: "이미 가입 신청 되어 있습니다.",
      });
    }

    const checkUser = await db.user.findByPk(user_idx, {
      attributes: ["idx", "user_name"],
    });
    const template = new Template({});

    const findConfigResult = await template.findConfig(
      {
        template_name: "팀원",
        company_idx: findCompany.idx,
      },
      ["idx"]
    );

    await includeUserToCompany({
      user_idx: checkUser.idx,
      company_idx: findCompany.idx,
      standBy: true,
      active: true,
      searchingName: checkUser.user_name,
      config_idx: findConfigResult.idx,
    });

    return res.send({ success: 200, message: "가입 신청 완료" });
  },
};
