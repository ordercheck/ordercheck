const db = require("../model/db");
const { makeSpreadArray } = require("../lib/functions");
const _f = require("../lib/functions");
const { findMember } = require("../lib/apiFunctions");
const { generateRandomCode } = require("../lib/functions");
const { Op } = require("sequelize");
const { Company } = require("../lib/classes/CompanyClass");
const { Template } = require("../lib/classes/TemplateClass");
const { createConfig } = require("../lib/standardTemplate");
const { failSmsPay } = require("../lib/kakaoPush");
const axios = require("axios");
const { verify_data } = require("../lib/jwtfunctions");
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

const { Alarm } = require("../lib/classes/AlarmClass");
const { plan } = require("../model/db");

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
          plan_price, chat_price, analystic_price, whiteLabel_price, start_plan, expire_plan, free_plan, pay_type,
          card.message_active AS messageActive,
          companyexist,
          card.active AS cardActive,
          plan_active,
          text_cost,
          used_free_period,
          plan.whiteLabelChecked,  
          chatChecked, 
          analysticChecked,
          form_link_count
          FROM userCompany 
          LEFT JOIN company ON userCompany.company_idx = company.idx
          LEFT JOIN plan ON userCompany.company_idx = plan.company_idx AND plan.active = 1
          LEFT JOIN user ON company.huidx = user.idx
          LEFT JOIN card ON card.user_idx = user.idx AND main=true
          LEFT JOIN sms ON sms.company_idx = userCompany.company_idx
          WHERE userCompany.user_idx = ${user_idx} AND userCompany.active = true AND standBy = false`
        )
        .spread((r) => {
          return makeSpreadArray(r);
        });
      const findPlan = await db.plan.findOne({
        where: { company_idx, active: 1 },
      });
      const findNextPlan = await db.plan.findOne({
        where: { company_idx, active: 3 },
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
        free_plan: findPlan.free_plan ? findPlan.free_plan : false,
        pay_type: findPlan.pay_type,
      };

      let nextPlan = false;
      if (findNextPlan) {
        nextPlan = {
          plan: findNextPlan.plan,
          plan_price: findNextPlan.plan_price.toLocaleString(),
          chat_price: findNextPlan.chat_price.toLocaleString(),
          analystic_price: findNextPlan.analystic_price.toLocaleString(),
          whiteLabel_price: findNextPlan.whiteLabel_price.toLocaleString(),
          start_plan: findNextPlan.start_plan ? findNextPlan.start_plan : false,
          expire_plan: findNextPlan.expire_plan
            ? moment(findNextPlan.expire_plan.replace(/\./g, "-"))
                .add(1, "d")
                .format("YYYY.MM.DD")
            : false,
          free_plan: findNextPlan.free_plan ? findPlan.free_plan : false,
          pay_type: findNextPlan.pay_type,
          failed_date: findNextPlan.failed_date
            ? moment(findNextPlan.failed_date.replace(/\./g, "-"))
                .add("1", "d")
                .format("YYYY.MM.DD")
            : null,
          failed_count: findNextPlan.failed_count,
          whiteLabelChecked: findNextPlan.whiteLabelChecked,
          chatChecked: findNextPlan.chatChecked,
          analysticChecked: findNextPlan.analysticChecked,
        };
      }

      companyProfile[0].planDetail = planDetail;
      companyProfile[0].nextPlan = nextPlan;

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
        if (!body.company_name) {
          await company.updateCompany(body, { idx: company_idx });
        } else {
          body.companyexist = true;
          await company.updateCompany(body, { idx: company_idx });
        }

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
        where: {
          merchant_uid: planId,
          [Op.or]: [{ active: 1 }, { active: 0 }],
        },
        attributes: showDetailPlanAttributes,
      });
      console.log(findPlanResult);
      return res.send({ success: 200, findPlanResult });
    } catch (err) {
      next(err);
    }
  },
  showSmsInfo: async (req, res, next) => {
    const { user_idx, company_idx } = req;
    try {
      const findResult = await db.sms.findOne({
        where: { company_idx },
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
    const { user_idx, token, body, company_idx } = req;
    try {
      await db.sms.update(body, {
        where: {
          company_idx,
        },
      });

      const findResult = await db.sms.findOne({
        where: { company_idx },
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
    const findHuidx = await db.user.findByPk(user_idx, {
      attributes: ["user_email", "user_phone"],
    });
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
      where: { company_idx },
      attributes: ["text_cost"],
    });

    if (!findCardResult) {
      return res.send({ success: 400, message: "등록된 카드가 없습니다." });
    }
    // 영수증 등록 로직
    const findCompany = await db.company.findByPk(company_idx, {
      attributes: ["company_name", "company_subdomain"],
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
      const receiptId = generateRandomCode();

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

      // 문자 자동충전 실패 알람 보내기
      const alarm = new Alarm({});
      const message = alarm.failedAutoMessageAlarm();

      const insertData = {
        message,
        path: "/setting/payment_history",
        alarm_type: 34,
      };

      const sendMember = [user_idx];
      const io = req.app.get("io");
      alarm.sendMultiAlarm(insertData, sendMember, io);

      // sendFailCostEmail(findCompany.company_name, 123, findHuidx.user_email);

      failSmsPay(
        findCompany.company_name,
        findHuidx.user_phone.replace(
          /[ \{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\ '\"\\(\=]/gi,
          ""
        )
      );
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
          company_idx,
        },
      }
    );

    res.send({ success: 200, message: "충전 완료" });

    const receiptId = generateRandomCode();

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

    // sendTextPayEmail(
    //   findCompany.company_name,
    //   receiptId,
    //   beforeCost,
    //   plusCost,
    //   addCost,
    //   123,
    //   findHuidx.user_email
    // );
  },
  showSmsHistory: async (req, res, next) => {
    const { user_idx, company_idx } = req;
    try {
      // 해당 유저의 sms조회
      const findSms = await db.sms.findOne({
        where: { company_idx },
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
      const checkCompany = await db.company.findByPk(company_idx, {
        attributes: ["huidx"],
      });

      let findCardInfo = await db.card.findAll({
        where: { user_idx: checkCompany.huidx },
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

      const changeToUnix = moment(
        `${startDate} ${findPlanResult.pay_hour}:00`
      ).unix();

      const nextMerchant_uid = generateRandomCode();

      await schedulePay(
        changeToUnix,
        findCardResult.customer_uid,
        findPlanResult.result_price_levy,
        findUserResult.user_name,
        findUserResult.user_phone,
        findUserResult.user_email,
        nextMerchant_uid
      );

      await db.plan.update(
        { merchant_uid: nextMerchant_uid },
        { where: { idx: findPlanResult.idx } }
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
      let findResult = await db.formLink.findAll({
        where: { company_idx },
        include: [
          {
            model: db.formOpen,
            as: "member",
            attributes: ["user_name", "user_idx"],
          },
        ],
        order: [["createdAt", "DESC"]],
        attributes: showFormListAttributes,
      });
      findResult = JSON.parse(JSON.stringify(findResult));

      findResult = findResult.filter((data) => {
        for (i = 0; i < data.member.length; i++) {
          if (data.member[i].user_idx == user_idx) {
            return data;
          }
        }
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
      company_idx,
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

      // 템플릿 초대 받은 사람 알림
      invitedMember.forEach(async (data) => {
        const inviteMessage = alarm.inviteFormAlarm(
          inviter.user_name,
          findFormLink.title
        );

        const invitedMemberData = {
          message: inviteMessage,
          path: `/consulting_form/detail/${formId}/form-edit`,
          alarm_type: 22,
          user_idx: data,
        };

        // 자기 자신 제외
        const sendMembers = [];
        if (data !== user_idx) {
          sendMembers.push(data);
        }
        alarm.sendMultiAlarm(invitedMemberData, sendMembers, io);
      });

      // 기존에 있던 팀원들 알람 보내기
      nonMember.forEach(async (data) => {
        // 초대된 사람이 없을 때 처리
        if (invitedMember.length !== 0) {
          const defaultMember = await db.user.findByPk(invitedMember[0], {
            attributes: ["user_name"],
          });
          const inviteDefaultAlarm = alarm.inviteDefaultMemberAlarm(
            inviter.user_name,
            findFormLink.title,
            defaultMember.user_name,
            invitedMember.length == 0 ? 0 : invitedMember.length - 1
          );

          const invitedMemberData = {
            message: inviteDefaultAlarm,
            alarm_type: 23,
            path: `/consulting_form/detail/${formId}/form-edit`,
            user_idx: data,
          };

          // 알람 대상에 자기 자신 제외
          const sendMembers = [];
          if (data !== user_idx) {
            sendMembers.push(data);
          }

          alarm.sendMultiAlarm(invitedMemberData, sendMembers, io);
        }
      });

      // 템플릿에서 제외 된 사람 알람
      deletedMember.forEach(async (data) => {
        const deletedMessage = alarm.excludeFormAlarm(
          inviter.user_name,
          findFormLink.title
        );

        const deletedMemberData = {
          message: deletedMessage,
          path: `/consulting_form`,
          alarm_type: 24,
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
      company_idx,
      user_idx,
    } = req;
    try {
      const findTemplate = await db.config.findByPk(templateId, {
        attributes: ["template_name"],
      });

      // 검색용 usre_name 변경, config 변경
      db.userCompany.update(
        { searchingName: user_name, config_idx: templateId },
        { where: { idx: memberId } }
      );

      // user찾기
      const findUserResult = await db.userCompany.findByPk(memberId, {
        include: [
          {
            model: db.config,
          },
        ],
      });

      // user 정보 변경
      db.user.update(
        { user_name, user_email },
        { where: { idx: findUserResult.user_idx } }
      );

      // formLink create_people 변경
      // user 정보 변경
      db.formLink.update(
        { create_people: user_name },
        { where: { company_idx, create_people: findUserResult.searchingName } }
      );
      // formOpen 정보 변경
      db.formOpen.update(
        { user_name },
        { where: { user_idx: findUserResult.user_idx } }
      );

      // 파일 보관함 정보 변경
      db.folders.update(
        { upload_people: user_name },
        { where: { company_idx, upload_people: findUserResult.searchingName } }
      );

      db.files.update(
        { upload_people: user_name },
        { where: { company_idx, upload_people: findUserResult.searchingName } }
      );

      // 템플릿 변경
      db.config.update(
        { create_people: user_name },
        { where: { company_idx, create_people: findUserResult.searchingName } }
      );
      db.files.update(
        { update_people: user_name },
        { where: { company_idx, update_people: findUserResult.searchingName } }
      );

      const findResult = await findMember({
        idx: memberId,
      });
      if (
        (findTemplate.template_name == "소유주",
        findUserResult.config.template_name !== "소유주")
      ) {
        const io = req.app.get("io");

        // 새로운 소유주 정보
        const findMember = await db.userCompany.findByPk(memberId, {
          attributes: ["user_idx"],
        });

        // 회사 소유주 변경
        await db.company.update(
          { huidx: findMember.user_idx },
          { where: { idx: company_idx } }
        );

        // 템플릿 변경
        const findTeamTemplate = await db.config.findOne({
          where: { company_idx, template_name: "팀원" },
          attributes: ["idx"],
        });

        // 기존 소유주 템플릿 변경
        await db.userCompany.update(
          { config_idx: findTeamTemplate.idx },
          { where: { user_idx, company_idx, config_idx: templateId } }
        );

        // 회사에 속한 멤버들 찾기
        const checkMembers = await db.userCompany.findAll({
          where: {
            company_idx,
          },
          attributes: ["user_idx"],
          raw: true,
        });

        // 새로운 소유주 카드 등록 여부 체크
        const checkOwnerCard = await db.card.findOne({
          where: { user_idx: findMember.user_idx, main: true },
        });

        // 기존 소유주의 등록된 카드
        const checkMainCard = await db.card.findOne({
          where: { user_idx, main: true },
        });

        // 회사 플랜 결제 예정 정보
        const checkPlan = await db.plan.findOne({
          where: { company_idx, active: 3 },
        });

        // 카드등록이 안되어있을 때
        if (!checkOwnerCard) {
          checkMembers.forEach((data) => {
            if (data.user_idx !== findMember.user_idx) {
              db.user.update(
                { login_access: false },
                { where: { idx: data.user_idx } }
              );
            }
            if (data.user_idx !== user_idx) {
              io.to(data.user_idx).emit("changeOwner", false);
            }
          });
          // 기존 소유주가 등록된 카드가 있을 때
          if (checkMainCard) {
            cancelSchedule(checkMainCard.customer_uid, checkPlan.merchant_uid);
          }

          db.plan.update(
            { enrollment: false },
            { where: { idx: checkPlan.idx } }
          );
        } else {
          checkMembers.forEach((data) => {
            db.user.update(
              { login_access: true },
              { where: { idx: data.user_idx } }
            );
            io.to(data.user_idx).emit("changeOwner", true);
          });
          // 기존 소유주가 등록된 카드가 있을 때
          if (checkMainCard) {
            await cancelSchedule(
              checkMainCard.customer_uid,
              checkPlan.merchant_uid
            );
          }

          //  카드가 있으므로 새로운 소유주 카드로 플랜 결제 예정

          // 새로운 카드로 결제 예약

          const findCardResult = await db.card.findByPk(checkOwnerCard.idx);

          const findUserResult = await db.user.findByPk(findMember.user_idx);

          const startDate = checkPlan.start_plan.replace(/\./g, "-");

          const changeToUnix = moment(
            `${startDate} ${checkPlan.pay_hour}:00`
          ).unix();

          const nextMerchant_uid = generateRandomCode();
          // 다음 카드 결제 신청
          await schedulePay(
            changeToUnix,
            findCardResult.customer_uid,
            checkPlan.result_price_levy,
            findUserResult.user_name,
            findUserResult.user_phone,
            findUserResult.user_email,
            nextMerchant_uid
          );

          db.plan.update(
            { merchant_uid: nextMerchant_uid, enrollment: true },
            { where: { idx: checkPlan.idx } }
          );
        }
      }
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

  changePlan: async (req, res, next) => {
    let {
      body: { ct, pt },
      user_idx,
      company_idx,
    } = req;

    const t = await db.sequelize.transaction();

    let card_data = await verify_data(ct);
    const plan_data = await verify_data(pt);

    console.log("카드 정보", card_data);
    console.log("플랜 정보", plan_data);

    db.company.update(
      { used_free_period: true },
      { where: { idx: company_idx }, transaction: t }
    );
    try {
      // 유저정보 찾기
      const user_data = await db.user.findByPk(user_idx);

      if (!card_data) {
        // 이미 메인 카드가 있을 때
        card_data = await db.card.findOne({
          where: { user_idx, main: true, active: true },
        });
      } else {
        card_data.user_idx = user_idx;
        card_data = await db.card.create(card_data, {
          transaction: t,
        });
      }

      // 현재 플랜 체크
      const nowPlan = await db.plan.findOne({
        where: { company_idx, active: 1 },
      });
      // 결제 예약 플랜 찾기
      const scheduledPlan = await db.plan.findOne({
        where: { company_idx, active: 3 },
      });

      let nextExpireDate;
      if (plan_data.pay_type == "month") {
        if (scheduledPlan) {
          const startPlan = scheduledPlan.start_plan.replace(/\./gi, "-");
          nextExpireDate = moment(startPlan)
            .add("1", "M")
            .subtract("1", "days")
            .format("YYYY.MM.DD");
        }
      } else {
        if (scheduledPlan) {
          const startPlan = scheduledPlan.start_plan.replace(/\./gi, "-");
          nextExpireDate = moment(startPlan)
            .add("1", "Y")
            .subtract("1", "days")
            .format("YYYY.MM.DD");
        }
      }

      const nextMerchant_uid = generateRandomCode();
      // 프리플랜에서 요금제 가입 할 때
      if (nowPlan.plan == "프리") {
        console.log("프리 플랜에서 요금제 가입 할 때");
        // 무료체험 기간일 때
        if (!plan_data.start_plan) {
          await db.plan.destroy({
            where: { idx: scheduledPlan.idx },
            transaction: t,
          });
          plan_data.start_plan = scheduledPlan.start_plan;
          plan_data.expire_plan = scheduledPlan.expire_plan;
          plan_data.pay_hour = scheduledPlan.pay_hour;
          plan_data.free_plan = scheduledPlan.free_plan;
          plan_data.company_idx = company_idx;
          plan_data.merchant_uid = nextMerchant_uid;

          await db.plan.create(
            {
              ...plan_data,
              active: 3,
            },
            {
              transaction: t,
            }
          );

          const startFreeDate = moment().format("YYYY.MM.DD");

          await db.plan.update(
            { active: 0, free_period_expire: startFreeDate },
            { where: { idx: nowPlan.idx }, transaction: t }
          );
          plan_data.free_period_start = startFreeDate;
          plan_data.free_period_expire = nextExpireDate;
          await db.plan.create(plan_data, {
            transaction: t,
          });

          // 시간을 unix형태로 변경(실제)

          const startDate = plan_data.start_plan.replace(/\./g, "-");

          const changeToUnix = moment(
            `${startDate} ${scheduledPlan.pay_hour}:00`
          ).unix();

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
        } else {
          await db.plan.destroy({
            where: { idx: nowPlan.idx },
            transaction: t,
          });
          const nowStartPlan = plan_data.start_plan;
          const nowExpirePlan = plan_data.expire_plan;
          // 시간을 unix형태로 변경(실제)
          const Hour = moment().format("HH");

          plan_data.merchant_uid = nextMerchant_uid;
          plan_data.company_idx = company_idx;
          plan_data.pay_hour = Hour;
          // 결제 예약 플랜 생성
          let nextStartDate;
          if (plan_data.pay_type == "month") {
            nextStartDate = moment(plan_data.expire_plan.replace(/\./g, "-"))
              .add("1", "days")
              .format("YYYY.MM.DD");
            nextExpireDate = moment(nextStartDate.replace(/\./g, "-"))
              .add("1", "M")
              .subtract("1", "days")
              .format("YYYY.MM.DD");
          } else {
            nextStartDate = moment(plan_data.expire_plan.replace(/\./g, "-"))
              .add("1", "days")
              .format("YYYY.MM.DD");
            nextExpireDate = moment(nextStartDate.replace(/\./g, "-"))
              .add("1", "Y")
              .subtract("1", "days")
              .format("YYYY.MM.DD");
          }
          // 무료플랜이 아닐 때
          if (!plan_data.free_plan) {
            plan_data.start_plan = nextStartDate;
            plan_data.expire_plan = nextExpireDate;
          }

          await db.plan.create(
            {
              ...plan_data,
              active: 3,
            },
            {
              transaction: t,
            }
          );
          const startFreeDate = moment().format("YYYY.MM.DD");
          plan_data.free_period_start = startFreeDate;
          plan_data.free_period_expire = nowExpirePlan;
          plan_data.start_plan = nowStartPlan;
          plan_data.expire_plan = nowExpirePlan;

          // 무료플랜이 아닐 때
          if (!plan_data.free_plan) {
            plan_data.merchant_uid = generateRandomCode();
          }
          // 현재 플랜 생성
          await db.plan.create(plan_data, {
            transaction: t,
          });

          // 회사 초기화 날짜 수정
          await db.company.update(
            { resetDate: moment().add("1", "M") },
            { where: { idx: company_idx }, transaction: t }
          );

          let scheduleUnixTime;
          if (plan_data.free_plan) {
            scheduleUnixTime = moment(
              `${nowStartPlan.replace(/\./g, "-")} ${Hour}:00`
            ).unix();
          } else {
            // 변경한 플랜 바로 결제
            const { success } = await payNow(
              card_data.customer_uid,
              plan_data.result_price_levy,
              plan_data.merchant_uid,
              "플랜 즉시 결제"
            );

            if (!success) {
              await t.rollback();
              return res.send({ success: 400, message: "결제 실패" });
            }

            scheduleUnixTime = moment(
              `${nextStartDate.replace(/\./g, "-")} ${Hour}:00`
            ).unix();
          }

          // 다음 카드 결제 신청
          await schedulePay(
            scheduleUnixTime,
            card_data.customer_uid,
            plan_data.result_price_levy,
            user_data.user_name,
            user_data.user_phone,
            user_data.user_email,
            nextMerchant_uid
          );
        }
      } else {
        // 프리로 다운그레이드 할 때
        if (plan_data.plan == "프리") {
          // 현재 플랜이 무료체험 기간일 때
          if (scheduledPlan.free_plan) {
            console.log("유료에서 프리로 다운그레이드인데 무료체험기간");
            plan_data.company_idx = company_idx;
            plan_data.free_plan = nowPlan.free_plan;
            plan_data.start_plan = nowPlan.start_plan;
            plan_data.expire_plan = nextExpireDate;
            plan_data.enrollment = null;
            plan_data.merchant_uid = nextMerchant_uid;
            plan_data.pay_hour = scheduledPlan.pay_hour;
            const startFreeDate = moment().format("YYYY.MM.DD");
            plan_data.free_period_start = startFreeDate;
            plan_data.free_period_expire = nextExpireDate;
            await db.plan.update(
              { active: 0, free_period_expire: startFreeDate },
              {
                where: { idx: nowPlan.idx },
                transaction: t,
              }
            );
            // 결제 예약 플랜 삭제
            await db.plan.destroy({
              where: { idx: scheduledPlan.idx },
              transaction: t,
            });
            await db.plan.create(plan_data, {
              transaction: t,
            });

            plan_data.will_free = nowPlan.start_plan;
            await db.plan.create(
              { ...plan_data, active: 3 },
              {
                transaction: t,
              }
            );
            console.log("기본 플랜 만들기 active 3");
          } else {
            console.log(
              "유료에서 프리로 다운그레이드인데 무료체험기간 끝났을 때"
            );
            // 무료플랜 전환 예정 업데이트

            await db.plan.update(
              {
                will_free: scheduledPlan.start_plan,
                plan: "프리",
                plan_price: 0,
              },
              { where: { idx: scheduledPlan.idx }, transaction: t }
            );
          }
          console.log("기존 결제 예정 취소");
          console.log(card_data.customer_uid);

          // 기존의 결제 예정 취소
          await cancelSchedule(
            card_data.customer_uid,
            scheduledPlan.merchant_uid
          );
        } else {
          console.log("유료에서 유료로 업그레이드 다운그레이드 할 때");
          // 결제 예약 플랜 삭제
          await db.plan.destroy({
            where: { idx: scheduledPlan.idx },
            transaction: t,
          });

          // 시간을 unix형태로 변경(실제)

          const startDate = scheduledPlan.start_plan.replace(/\./g, "-");

          const changeToUnix = moment(
            `${startDate} ${scheduledPlan.pay_hour}:00`
          ).unix();

          // 새로 변경될 플랜 생성
          plan_data.merchant_uid = nextMerchant_uid;
          plan_data.company_idx = company_idx;
          plan_data.pay_hour = scheduledPlan.pay_hour;
          plan_data.start_plan = scheduledPlan.start_plan;
          plan_data.expire_plan = nextExpireDate;
          const newPlan = await db.plan.create(
            { ...plan_data, active: 3 },
            {
              transaction: t,
            }
          );

          // 현재 플랜이 무료체험 기간일 때
          if (scheduledPlan.free_plan) {
            console.log("유료에서 유료로 바꾸는데 무료체험 기간일 때");

            const startFreeDate = moment().format("YYYY.MM.DD");
            plan_data.free_period_start = startFreeDate;
            plan_data.free_period_expire = nextExpireDate;

            plan_data.free_plan = nowPlan.free_plan;
            await db.plan.update(
              { active: 0, free_period_expire: startFreeDate },
              {
                where: { idx: nowPlan.idx },
                transaction: t,
              }
            );
            await db.plan.create(
              { ...plan_data, active: 1 },
              {
                transaction: t,
              }
            );

            await db.plan.update(
              { free_plan: nowPlan.free_plan },
              { where: { idx: newPlan.idx }, transaction: t }
            );
          }

          // 스케쥴 취소
          await cancelSchedule(
            card_data.customer_uid,
            scheduledPlan.merchant_uid
          );

          // 다음 카드 결제 신청
          await schedulePay(
            changeToUnix,
            card_data.customer_uid,
            newPlan.result_price_levy,
            user_data.user_name,
            user_data.user_phone,
            user_data.user_email,
            nextMerchant_uid
          );
        }
      }
      await t.commit();
      return res.send({ success: 200 });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
};
