const db = require("../model/db");
const { makeSpreadArray } = require("../lib/functions");
const _f = require("../lib/functions");
const { findMember } = require("../lib/apiFunctions");
const { generateRandomCode } = require("../lib/functions");
const { Op } = require("sequelize");
const { Company } = require("../lib/classes/CompanyClass");
const { Template } = require("../lib/classes/TemplateClass");
const { createConfig } = require("../lib/standardTemplate");
const axios = require("axios");
const {
  payNow,
  delCardPort,
  cancelSchedule,
  schedulePay,
} = require("../lib/payFunction");
const moment = require("moment");
const {
  showTemplateListAttributes,
  showPlanAttributes,
  showPlanHistoryAttributes,
  showDetailPlanAttributes,
  showSmsHistoryAttributes,
  showCardsInfoAttributes,
  showCardDetailAttributes,
  showDetailTemplateConfig,
  getReceiptListAttributes,
  showFormListAttributes,
} = require("../lib/attributes");
const attributes = require("../lib/attributes");
const { Alarm } = require("../lib/classes/AlarmClass");

require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");

module.exports = {
  getCompanyProfile: async (req, res, next) => {
    const { user_idx, company_idx } = req;
    try {
      let companyProfile = await db.sequelize
        .query(
          `SELECT plan, company_name, company_logo, company_subdomain, address, 
          detail_address, company.business_number, business_enrollment, business_enrollment_title, user_name,
          card.message_active AS messageActive,
          companyexist,
          card.active AS cardActive,
          text_cost,
          plan.whiteLabelChecked,  
          chatChecked, 
          analysticChecked,
          form_link_count
          FROM userCompany 
          LEFT JOIN company ON userCompany.company_idx = company.idx
          LEFT JOIN plan ON userCompany.company_idx = plan.company_idx
          LEFT JOIN user ON company.huidx = user.idx
          LEFT JOIN card ON card.user_idx = user.idx AND main=true
          LEFT JOIN sms ON sms.user_idx = user.idx
          WHERE userCompany.user_idx = ${user_idx} AND userCompany.active = true AND standBy = false`
        )
        .spread((r) => {
          return makeSpreadArray(r);
        });
      const findPlan = await db.plan.findOne({
        where: { company_idx, active: 1 },
        attributes: [
          "plan",
          "chat_price",
          "analystic_price",
          "whiteLabel_price",
          "expire_plan",
          "plan_price",
          "free_plan",
          "start_plan",
          "pay_type",
        ],
      });

      const planDetail = {
        plan: findPlan.plan,
        plan_price: findPlan.plan_price.toLocaleString(),
        chat_price: findPlan.chat_price.toLocaleString(),
        analystic_price: findPlan.analystic_price.toLocaleString(),
        whiteLabel_price: findPlan.whiteLabel_price.toLocaleString(),
        start_plan: findPlan.start_plan ? findPlan.start_plan : false,
        expire_plan: findPlan.expire_plan
          ? moment(findPlan.expire_plan.replace(/\./g, "-"))
              .add(1, "d")
              .format("YYYY.MM.DD")
          : false,
        free_plan: findPlan.free_plan ? true : false,
        pay_type: findPlan.pay_type,
      };
      companyProfile[0].planDetail = planDetail;

      return res.send({ success: 200, companyProfile: companyProfile[0] });
    } catch (err) {
      next(err);
    }
  },
  changeCompanyLogo: async (req, res, next) => {
    const { company_idx, file } = req;
    const company = new Company({});
    try {
      const result = await company.updateLogoAndEnrollment(
        company_idx,
        file,
        "logo"
      );
      if (result) {
        return res.send({ success: 200 });
      }
    } catch (err) {
      next(err);
    }
  },

  delCompanyLogo: async (req, res, next) => {
    const { company_idx, file } = req;
    const company = new Company({});
    try {
      const result = await company.updateLogoAndEnrollment(
        company_idx,
        file,
        "logo"
      );
      if (result) {
        return res.send({ success: 200 });
      }
    } catch (err) {
      next(err);
    }
  },
  changeCompanyInfo: async (req, res, next) => {
    const { body, company_idx } = req;
    const company = new Company({});
    try {
      try {
        await company.updateCompany(body, { idx: company_idx });

        return res.send({ success: 200 });
      } catch (err) {
        return res.send({
          success: 400,
          message: "해당 회사 도메인은 이미 사용되었습니다.",
        });
      }
    } catch (err) {
      next(err);
    }
  },

  changeCompanyEnrollment: async (req, res, next) => {
    const { company_idx, file } = req;
    const company = new Company({});
    try {
      const result = await company.updateLogoAndEnrollment(
        company_idx,
        file,
        "enrollment"
      );
      if (result) {
        return res.send({ success: 200 });
      }
    } catch (err) {
      next(err);
    }
  },
  getCompanyProfileMember: async (req, res, next) => {
    const { company_idx, user_idx } = req;
    const company = new Company({});
    try {
      const findResult = await company.findMembers(
        {
          company_idx,
          active: true,
          standBy: false,
        },
        ["searchingName", "ASC"],
        user_idx
      );
      return res.send({ success: 200, findResult });
    } catch (err) {
      next(err);
    }
  },

  searchMember: async (req, res, next) => {
    const {
      query: { search },
      company_idx,
    } = req;
    try {
      const company = new Company({});
      const findResult = await company.findMembers(
        {
          searchingName: {
            [Op.like]: `%${search}%`,
          },
          company_idx,
          active: true,
          standBy: false,
        },

        ["searchingName", "ASC"]
      );

      return res.send(findResult);
    } catch (err) {
      next(err);
    }
  },

  delCompanyMember: async (req, res, next) => {
    const {
      params: { memberId },
    } = req;
    const company = new Company({});
    try {
      await company.delCompanyAndChangeFree(memberId);
      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },
  addTemplate: async (req, res, next) => {
    const {
      body: { title },
      company_idx,
      user_idx,
    } = req;
    try {
      const template = new Template({});
      const checkTitleResult = await template.checkTitle({
        template_name: title,
      });
      const findUser = await db.user.findByPk(user_idx, {
        attributes: ["user_name"],
      });

      const createConfigClass = new Template(createConfig);

      const createdResult = await createConfigClass.createPrivateConfig(
        checkTitleResult.title,
        findUser.user_name,
        company_idx
      );

      return res.send({
        success: 200,
        templateId: createdResult.idx,
      });
    } catch (err) {
      next(err);
    }
  },
  showTemplateList: async (req, res, next) => {
    const { company_idx } = req;
    const template = new Template({});
    try {
      const findResult = await template.findAllConfig(
        {
          company_idx,
        },
        showTemplateListAttributes,
        [["createdAt", "DESC"]]
      );

      let No = 1;
      findResult.map((data) => {
        data.No = No;
        No++;
      });

      return res.send({ success: 200, findResult });
    } catch (err) {
      next(err);
    }
  },
  showDetailTemplate: async (req, res, next) => {
    const { templateId } = req.params;

    try {
      const template = new Template({});

      const findResult = await template.findConfigFindByPk(templateId, {
        exclude: showDetailTemplateConfig,
      });

      return res.send({ success: 200, findResult });
    } catch (err) {
      next(err);
    }
  },
  changeTemplate: async (req, res, next) => {
    const {
      company_idx,
      body,
      user_idx,
      params: { templateId },
    } = req;
    const template = new Template({});
    try {
      const findUserResult = await db.user.findByPk(user_idx, {
        attributes: ["user_name"],
      });

      const updatedDate = moment().format("YYYY.MM.DD HH:mm");

      const update_people = `${updatedDate} ${findUserResult.user_name}`;

      body.update_people = update_people;
      body.company_idx = company_idx;

      await template.updateConfig(body, { idx: templateId });

      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },
  delTemplate: async (req, res, next) => {
    const {
      params: { templateId },
      company_idx,
    } = req;
    try {
      const template = new Template({});

      const findUserResult = await db.userCompany.findAll({
        where: { config_idx: templateId, standBy: false, active: true },
        raw: true,
        nest: true,
      });

      const findConfigResult = await template.findConfig(
        { company_idx, template_name: "팀원" },
        ["idx"]
      );

      findUserResult.forEach(async (data) => {
        await db.userCompany.update(
          { config_idx: findConfigResult.idx },
          { where: { idx: data.idx } }
        );
      });

      await template.destroyConfig({ idx: templateId });

      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },
  showPlan: async (req, res, next) => {
    const { company_idx } = req;
    try {
      const findPlanResult = await db.plan.findOne({
        where: { idx: company_idx, active: 1 },
        include: [
          {
            model: db.company,
            attributes: ["form_link_count"],
          },
        ],
        attributes: showPlanAttributes,
      });

      // 남은 날짜 구하기
      if (!findPlanResult.free_plan) {
        return res.send(findPlanResult);
      }
      let now = moment().format("YYYY-MM-DD");
      now = moment(now);
      const freePlan = moment(findPlanResult.start_plan.replace(/\./g, "-"));
      let diffTime = moment(freePlan.diff(now)).format("DD");
      diffTime = parseInt(diffTime) - 1;

      return res.send(findPlanResult);
    } catch (err) {
      next(err);
    }
  },
  showPlanHistory: async (req, res, next) => {
    const { company_idx } = req;
    try {
      const findPlanResult = await db.plan.findAll({
        where: { company_idx },
        attributes: showPlanHistoryAttributes,
        order: [["createdAt", "DESC"]],
      });
      return res.send({ success: 200, findPlanResult });
    } catch (err) {
      next(err);
    }
  },
  showDetailPlan: async (req, res, next) => {
    const { planId } = req.params;
    try {
      const findPlanResult = await db.plan.findOne({
        where: { merchant_uid: planId },
        attributes: showDetailPlanAttributes,
      });
      return res.send({ success: 200, findPlanResult });
    } catch (err) {
      next(err);
    }
  },
  showSmsInfo: async (req, res, next) => {
    const { user_idx } = req;
    try {
      const findResult = await db.sms.findOne({
        where: { user_idx },
        attributes: ["text_cost", "repay", "auto_price", "auto_min"],
      });

      findResult.dataValues.text_cost = findResult.text_cost.toLocaleString();
      findResult.dataValues.auto_price = findResult.auto_price.toLocaleString();
      findResult.dataValues.auto_min = findResult.auto_min.toLocaleString();

      return res.send({ success: 200, findResult });
    } catch (err) {
      next(err);
    }
  },
  changeSms: async (req, res, next) => {
    const { user_idx, token, body } = req;
    try {
      await db.sms.update(body, {
        where: {
          user_idx,
        },
      });

      const findResult = await db.sms.findOne({
        where: { user_idx },
        attributes: ["text_cost", "repay", "auto_price", "auto_min"],
      });

      // 현재 문자 요금과 비교하여 문자 결제 진행
      let isPayment = false;

      if (findResult.text_cost < findResult.auto_min) {
        const payResult = await axios({
          url: "/api/config/company/sms/pay",
          method: "post", // POST method
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token} `,
          }, // "Content-Type": "application/json"
          data: { text_cost: findResult.auto_price },
        });

        isPayment = true;
      }

      findResult.dataValues.text_cost = findResult.text_cost.toLocaleString();
      findResult.dataValues.auto_price = findResult.auto_price.toLocaleString();
      findResult.dataValues.auto_min = findResult.auto_min.toLocaleString();

      return res.send({ success: 200, findResult, isPayment });
    } catch (err) {
      next(err);
    }
  },
  paySms: async (req, res, next) => {
    const {
      user_idx,
      company_idx,
      body: { text_cost },
    } = req;

    const findCardResult = await db.card.findOne({
      where: { user_idx, main: true },
      attributes: [
        "idx",
        "customer_uid",
        "card_number",
        "card_name",
        "card_code",
      ],
    });

    const findSmsResult = await db.sms.findOne({
      where: { user_idx },
      attributes: ["text_cost"],
    });

    if (!findCardResult) {
      return res.send({ success: 400, message: "등록된 카드가 없습니다." });
    }
    // 영수증 등록 로직
    const findCompany = await db.company.findByPk(company_idx, {
      attributes: ["company_name"],
    });

    const merchant_uid = _f.random5();

    const payResult = await payNow(
      findCardResult.customer_uid,
      text_cost,
      merchant_uid,
      "문자 충전"
    );

    if (!payResult.success) {
      await db.card.update(
        {
          active: false,
          message_active: false,
        },
        {
          where: {
            idx: findCardResult.idx,
          },
        }
      );
      res.send({ success: 400, message: "문자 충전 실패" });
      const receiptId = generateRandomCode(6);

      await db.receipt.create({
        company_idx,
        card_name: findCardResult.card_name,
        card_code: findCardResult.card_code,
        result_price_levy: text_cost,
        receiptId,
        status: false,
        receipt_category: 2,
        result_price: text_cost * 0.9,
        company_name: findCompany.company_name,
        message_price: text_cost,
        receipt_kind: "자동 문자 충전",
        card_number: findCardResult.card_number,
      });
      return;
    }

    const beforeCost = findSmsResult.text_cost;
    const plusCost = text_cost;
    const addCost = beforeCost + plusCost;

    await db.sms.update(
      {
        text_cost: addCost,
      },
      {
        where: {
          user_idx,
        },
      }
    );

    res.send({ success: 200, message: "충전 완료" });

    const receiptId = generateRandomCode(6);

    await db.receipt.create({
      company_idx,
      card_name: findCardResult.card_name,
      card_code: findCardResult.card_code,
      result_price_levy: text_cost,
      message_price: text_cost,
      receipt_category: 2,
      result_price: text_cost * 0.9,
      receiptId,
      company_name: findCompany.company_name,
      receipt_kind: "자동 문자 충전",
      card_number: findCardResult.card_number,
    });
  },
  showSmsHistory: async (req, res, next) => {
    const { user_idx } = req;
    try {
      // 해당 유저의 sms조회
      const findSms = await db.sms.findOne({
        where: { user_idx },
      });

      const findResult = await db.smsHistory.findAll({
        where: { sms_idx: findSms.idx },
        attributes: showSmsHistoryAttributes,
        order: [["createdAt", "DESC"]],
      });

      return res.send({ success: 200, findResult });
    } catch (err) {
      next(err);
    }
  },
  showCardsInfo: async (req, res, next) => {
    const { user_idx, company_idx } = req;
    try {
      let findCardInfo = await db.card.findAll({
        where: { user_idx },
        attributes: showCardsInfoAttributes,
        raw: true,
      });

      let cardEmail;
      let mainCardId;
      for (let i = 0; i < findCardInfo.length; i++) {
        // 메인 카드 이메일 찾기
        if (findCardInfo[i].main == true) {
          cardEmail = findCardInfo[i].card_email;
          mainCardId = findCardInfo[i].cardId;
        }

        const first = findCardInfo[i].card_number.substring(0, 4);
        const last = findCardInfo[i].card_number.substring(12, 16);

        findCardInfo[i].card_number = `${first} **** **** ${last}`;
        let [year, month] = findCardInfo[i].expiry.split("-");
        findCardInfo[i].expiry = `${month}/${year.slice(-2)}`;
      }
      // 플랜 다음 결제일 체크
      const findPlan = await db.plan.findOne({
        where: { company_idx, active: 3 },
        attributes: ["start_plan"],
      });

      let expirePlan;
      if (findPlan) {
        expirePlan = findPlan.start_plan.replace(/\./g, "-");
        expirePlan = moment(expirePlan).format("YYYY.MM.DD");
      }

      const findResult = { findCardInfo, expirePlan, cardEmail, mainCardId };
      return res.send({ success: 200, findResult });
    } catch (err) {
      next(err);
    }
  },
  showCardDetailInfo: async (req, res, next) => {
    const {
      params: { cardId },
    } = req;
    try {
      const findResult = await db.card.findByPk(cardId, {
        attributes: showCardDetailAttributes,
      });

      return res.send({ success: 200, findResult });
    } catch (err) {
      next(err);
    }
  },

  delCard: async (req, res, next) => {
    const { cardId } = req.params;
    // 삭제 하려는 카드가 main 카드인지 체크
    try {
      const findCardResult = await db.card.findByPk(cardId, {
        attributes: ["main"],
      });
      if (findCardResult.main == true) {
        return res.send({ message: "기본 결제 카드로 지정된 카드 입니다." });
      }

      // db 카드 삭제
      await db.card.destroy({ where: { idx: cardId } });

      res.send({ success: 200, message: "카드 삭제 완료" });
      //아임포트 카드 삭제
      await delCardPort(findCardResult.customer_uid);
    } catch (err) {
      next(err);
    }
  },
  setCardMain: async (req, res, next) => {
    const {
      user_idx,
      company_idx,
      params: { cardId },
    } = req;

    try {
      // 메인으로 설정되어있는 카드 false로 변경
      const findMainCardResult = await db.card.findOne(
        { where: { user_idx, main: true } },
        { attributes: ["idx", "customer_uid"] }
      );

      // 이미 main으로 설정된 카드가 있을 때
      if (findMainCardResult) {
        await db.card.update(
          { main: false },
          { where: { idx: findMainCardResult.idx } }
        );
      }

      //타겟 카드를 true로 변경
      await db.card.update({ main: true }, { where: { idx: cardId } });

      // 기존의 아임포트 결제 예약 취소
      const findPlanResult = await db.plan.findOne({
        where: { company_idx, active: 3 },
      });
      await cancelSchedule(
        findMainCardResult.customer_uid,
        findPlanResult.merchant_uid
      );

      // 새로운 카드로 결제 예약

      const findCardResult = await db.card.findByPk(cardId);

      const findUserResult = await db.user.findByPk(user_idx);

      const startDate = findPlanResult.start_plan.replace(/\./g, "-");

      const changeToUnix = moment(`${startDate} ${Hour}:00`).unix();

      await schedulePay(
        changeToUnix,
        findCardResult.customer_uid,
        findPlanResult.result_price_levy,
        findUserResult.user_name,
        findUserResult.user_phone,
        findUserResult.user_email,
        findPlanResult.merchant_uid
      );

      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },

  getReceiptList: async (req, res, next) => {
    const findReceiptList = async (whereData) => {
      const findReceiptListResult = await db.receipt.findAll({
        where: whereData,
        attributes: getReceiptListAttributes,
        order: [["createdAt", "DESC"]],
        raw: true,
      });

      // 돈에 , 붙이기
      for (let i = 0; i < findReceiptListResult.length; i++) {
        findReceiptListResult[i].result_price_levy =
          findReceiptListResult[i].result_price_levy.toLocaleString();
      }

      return findReceiptListResult;
    };

    const {
      params: { category },
      company_idx,
    } = req;

    try {
      let findResult;
      if (category == undefined) {
        findResult = [];
      }
      if (category == 0) {
        findResult = await findReceiptList({ company_idx });
      } else {
        findResult = await findReceiptList({
          company_idx,
          receipt_category: category,
        });
      }

      return res.send({ success: 200, findResult });
    } catch (err) {
      next(err);
    }
  },
  getReceiptDetail: async (req, res, next) => {
    const {
      params: { receiptId },
    } = req;

    try {
      const findResult = await db.receipt.findOne({
        where: { receiptId },
        attributes: { exclude: ["idx", "updatedAt"] },
        raw: true,
      });

      // 플랜 영수증일 때
      findResult.tax_price =
        findResult.result_price_levy - findResult.result_price;

      findResult.createdAt = findResult.createdAt
        .split(" ")[0]
        .replace(/-/g, ".");

      const first = findResult.card_number.substring(0, 4);
      const last = findResult.card_number.substring(12, 16);

      findResult.card_number = `${first} **** **** ${last}`;

      return res.send({ success: 200, findResult });
    } catch (err) {
      next(err);
    }
  },
  showFormList: async (req, res, next) => {
    const { company_idx, user_idx } = req;
    try {
      const findResult = await db.formLink.findAll({
        where: { company_idx },
        include: [
          {
            model: db.formOpen,
            as: "member",
            where: { user_idx },
            attributes: ["user_name"],
          },
        ],
        order: [["createdAt", "DESC"]],
        attributes: showFormListAttributes,
      });
      return res.send({ success: 200, findResult });
    } catch (err) {
      next(err);
    }
  },
  setFormOpenMembers: async (req, res, next) => {
    const {
      params: { formId },
      body: { members },
      user_idx,
    } = req;

    try {
      // 볼 수 있는 팀원들 전체 조회
      const formOpenMembers = await db.formOpen.findAll({
        where: { formLink_idx: formId },
        attributes: ["user_idx", "idx"],
        raw: true,
      });

      // 초대된 멤버
      const invitedMember = [];

      // 기존에 있던 멤버
      const nonMember = [];
      // db에 넣기
      for (i = 0; i < members.length; i++) {
        const checkMemberResult = await db.formOpen.findOne({
          where: { formLink_idx: formId, user_idx: members[i] },
        });

        if (!checkMemberResult) {
          // 이름 찾기
          const findUser = await db.user.findByPk(members[i], {
            attributes: ["user_name"],
          });
          await db.formOpen.create({
            formLink_idx: formId,
            user_idx: members[i],
            user_name: findUser.user_name,
          });
          invitedMember.push(parseInt(members[i]));
        } else {
          nonMember.push(parseInt(members[i]));
        }
      }

      // 삭제할 idx 찾기
      const delData = [];
      const deletedMember = [];
      for (i = 0; i < formOpenMembers.length; i++) {
        const result = members.includes(formOpenMembers[i].user_idx);
        if (!result) {
          delData.push(formOpenMembers[i].idx);
          deletedMember.push(formOpenMembers[i].user_idx);
        }
      }

      await db.formOpen.destroy({ where: { idx: delData } });

      res.send({ success: 200 });
      const alarm = new Alarm({});
      const io = req.app.get("io");

      // 폼 타이틀 찾기
      const findFormLink = await db.formLink.findByPk(formId, {
        attributes: ["title"],
      });

      // 보낸사람 찾기
      const inviter = await db.user.findByPk(user_idx, {
        attributes: ["user_name"],
      });

      // 기존에 있던 팀원들 알람 보내기
      nonMember.forEach(async (data) => {
        const defaultMember = await db.user.findByPk(data, {
          attributes: ["user_name"],
        });
        const inviteDefaultAlarm = alarm.inviteDefaultMemberAlarm(
          inviter.user_name,
          findFormLink.title,
          defaultMember.user_name
        );

        const invitedMemberData = {
          message: inviteDefaultAlarm,
          alarm_type: 16,
          user_idx: data,
        };
        // 알람 대상에 자기 자신 제외
        const sendMembers = [];
        if (data !== user_idx) {
          sendMembers.push(data);
        }

        alarm.sendMultiAlarm(invitedMemberData, sendMembers, io);
      });

      // 템플릿 초대 받은 사람 알림
      invitedMember.forEach(async (data) => {
        const inviteMessage = alarm.inviteFormAlarm(
          inviter.user_name,
          findFormLink.title
        );

        const invitedMemberData = {
          message: inviteMessage,
          alarm_type: 15,
          user_idx: data,
        };

        // 자기 자신 제외
        const sendMembers = [];
        if (data !== user_idx) {
          sendMembers.push(data);
        }

        alarm.sendMultiAlarm(invitedMemberData, sendMembers, io);
      });

      // 템플릿에서 제외 된 사람 알람
      deletedMember.forEach(async (data) => {
        const deletedMessage = alarm.excludeFormAlarm(
          inviter.user_name,
          findFormLink.title
        );

        const deletedMemberData = {
          message: deletedMessage,
          alarm_type: 17,
          user_idx: data,
        };

        // 자기 자신 제외
        const sendMembers = [];
        if (data !== user_idx) {
          sendMembers.push(data);
        }

        alarm.sendMultiAlarm(deletedMemberData, sendMembers, io);
      });
      return;
    } catch (err) {
      next(err);
    }
  },
  showChatTemplate: async (req, res, next) => {
    const { company_idx } = req;
    try {
      const findResult = await db.chatTemplate.findAll({
        where: { company_idx },
        attributes: ["title", "contents", "edit"],
      });
      return res.send({ success: 200, findResult });
    } catch (err) {
      next(err);
    }
  },
  changeMemberInfo: async (req, res, next) => {
    const {
      body: { user_name, user_email, templateId },
      params: { memberId },
    } = req;
    try {
      // 검색용 usre_name 변경, config 변경
      await db.userCompany.update(
        { searchingName: user_name, config_idx: templateId },
        { where: { idx: memberId } }
      );
      // user찾기
      const findUserResult = await db.userCompany.findByPk(memberId, {
        attributes: ["user_idx"],
      });
      // user 정보 변경
      await db.user.update(
        { user_name, user_email },
        { where: { idx: findUserResult.user_idx } }
      );

      const findResult = await findMember({
        idx: memberId,
      });

      return res.send({ success: 200, findResult });
    } catch (err) {
      next(err);
    }
  },
  changeMainCardEmail: async (req, res, next) => {
    const {
      params: { cardId },
      body,
    } = req;
    try {
      await db.card.update(body, { where: { idx: cardId } });
    } catch (err) {
      next(err);
    }

    return res.send({ success: 200 });
  },
  createCompany: async (req, res, next) => {
    const {
      body: { company_subdomain, company_name },
      company_idx,
    } = req;

    try {
      await db.company.update(
        { company_subdomain, company_name, companyexist: true },
        { where: { idx: company_idx } }
      );
      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },
  showFormOpenMember: async (req, res, next) => {
    const {
      company_idx,
      user_idx,
      params: { formId },
    } = req;
    try {
      // 해당 form 찾기
      const findForm = await db.formLink.findByPk(formId, {
        attributes: ["title"],
      });

      // 열람 권한 있는 멤버 찾기
      let memberList = await db.userCompany.findAll({
        where: { company_idx, active: true, standBy: false },
        include: [
          {
            model: db.user,
            attributes: ["user_profile"],
          },
        ],
        order: [["searchingName", "ASC"]],
        attributes: [
          ["user_idx", "memberId"],
          ["searchingName", "user_name"],
        ],
      });

      // 소유주 idx 찾기
      const companyOwner = await db.company.findByPk(company_idx, {
        attributes: ["huidx"],
      });

      memberList = JSON.parse(JSON.stringify(memberList));

      for (i = 0; i < memberList.length; i++) {
        if (memberList[i].memberId === companyOwner.huidx) {
          memberList[i].owner = true;
        } else {
          memberList[i].owner = false;
        }
        memberList[i].user_profile = memberList[i].user.user_profile;
        delete memberList[i].user;
        if (memberList[i].memberId === user_idx) {
          memberList.unshift(memberList[i]);
          memberList.splice(i + 1, 1);
        }
      }

      let selectMemberList = await db.formOpen.findAll({
        where: { formLink_idx: formId },
        include: [
          {
            model: db.userCompany,
            attributes: ["idx"],
            where: { active: true, standBy: false },
            include: [
              {
                model: db.user,
                attributes: ["user_profile"],
              },
            ],
          },
        ],
        order: [["user_name", "ASC"]],
        attributes: [["user_idx", "memberId"], "user_name"],
      });

      selectMemberList = JSON.parse(JSON.stringify(selectMemberList));

      for (i = 0; i < selectMemberList.length; i++) {
        if (selectMemberList[i].memberId === companyOwner.huidx) {
          selectMemberList[i].owner = true;
        } else {
          selectMemberList[i].owner = false;
        }

        selectMemberList[i].user_profile =
          selectMemberList[i].userCompany.user.user_profile;
        delete selectMemberList[i].userCompany;
        if (selectMemberList[i].memberId === user_idx) {
          selectMemberList.unshift(selectMemberList[i]);
          selectMemberList.splice(i + 1, 1);
        }
      }

      const findResult = {
        memberList,
        selectMemberList,
        formTitle: findForm.title,
      };

      return res.send({
        success: 200,
        findResult,
      });
    } catch (err) {
      next(err);
    }
  },
  changeWhiteLabel: async (req, res, next) => {
    const {
      params: { check },
      company_idx,
    } = req;

    await db.company.update(
      {
        whiteLabelChecked: check,
      },
      {
        where: {
          company_idx,
        },
      }
    );

    return res.send({ success: 200 });
  },
};
