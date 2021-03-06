const db = require("../model/db");
const { makeSpreadArray } = require("../lib/functions");
const _f = require("../lib/functions");
const {
  findMember,
  createPlanData,
  setPlanDate,
} = require("../lib/apiFunctions");
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
const { EventBridge } = require("aws-sdk");

require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");

module.exports = {
  getCompanyProfile: async (req, res, next) => {
    const { user_idx, company_idx } = req;

    try {
      let companyProfile = await db.sequelize
        .query(
          `SELECT plan, company_name, company_logo, company_subdomain, company.customer_count, address, 
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

      const companyAuth = await db.planInfo.findOne({
        where: { plan: companyProfile[0].plan },
      });

      console.log(
        companyAuth.maxAddCustomer - companyProfile[0].customer_count
      );

      companyAuth.dataValues.restCustomers =
        companyAuth.maxAddCustomer - companyProfile[0].customer_count;
      companyProfile[0].planDetail = planDetail;
      companyProfile[0].nextPlan = nextPlan;
      companyProfile[0].companyAuth = companyAuth;
      return res.send({
        success: 200,
        companyProfile: companyProfile[0],
      });
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
          message: "?????? ?????? ???????????? ?????? ?????????????????????.",
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
        if (data.updated_date && data["user.user_name"]) {
          data.update_people = `${data.updated_date} ${data["user.user_name"]}`;
        }

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
      const updated_date = moment().format("YYYY.MM.DD HH:mm");

      body.update_user_idx = user_idx;
      body.updated_date = updated_date;
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
        { company_idx, template_name: "??????" },
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

      // ?????? ?????? ?????????
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
    const { token, body, company_idx } = req;

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

      // ?????? ?????? ????????? ???????????? ?????? ?????? ??????
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

    const findHuidx = await db.user.findByPk(user_idx);
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
      return res.send({ success: 400, message: "????????? ????????? ????????????." });
    }
    // ????????? ?????? ??????
    const findCompany = await db.company.findByPk(company_idx, {
      attributes: ["company_name", "company_subdomain"],
    });

    const merchant_uid = _f.random5();

    const payResult = await payNow(
      findCardResult.customer_uid,
      text_cost,
      merchant_uid,
      "?????? ??????"
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
      res.send({ success: 400, message: "?????? ?????? ??????" });

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
        receipt_kind: "?????? ?????? ??????",
        card_number: findCardResult.card_number,
      });

      // ?????? ???????????? ?????? ?????? ?????????
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
        findCompany.company_name == ""
          ? findHuidx.user_name
          : findCompany.company_name,
        findHuidx.user_phone.replace(
          /[ \{\}\[\]\/?.,;:|\)*~`!^\-_+???<>@\#$%&\ '\"\\(\=]/gi,
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

    res.send({ success: 200, message: "?????? ??????" });

    const receiptId = generateRandomCode();
    console.log(beforeCost);
    console.log(addCost);
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
      receipt_kind: "?????? ?????? ??????",
      card_number: findCardResult.card_number,
      before_text_price: beforeCost,
      after_text_price: addCost,
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
      // ?????? ????????? sms??????
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
        // ?????? ?????? ????????? ??????
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
      // ?????? ?????? ????????? ??????
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
    // ?????? ????????? ????????? main ???????????? ??????
    try {
      const findCardResult = await db.card.findByPk(cardId, {
        attributes: ["main"],
      });
      if (findCardResult.main == true) {
        return res.send({ message: "?????? ?????? ????????? ????????? ?????? ?????????." });
      }

      // db ?????? ??????
      await db.card.destroy({ where: { idx: cardId } });

      res.send({ success: 200, message: "?????? ?????? ??????" });
      //???????????? ?????? ??????
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
      // ???????????? ?????????????????? ?????? false??? ??????
      const findMainCardResult = await db.card.findOne({
        where: { user_idx, main: true },
      });

      // ?????? main?????? ????????? ????????? ?????? ???
      if (findMainCardResult) {
        await db.card.update(
          { main: false },
          { where: { idx: findMainCardResult.idx } }
        );
      }

      //?????? ????????? true??? ??????
      await db.card.update({ main: true }, { where: { idx: cardId } });

      // ????????? ???????????? ?????? ?????? ??????
      const findPlanResult = await db.plan.findOne({
        where: { company_idx, active: 3 },
      });
      await cancelSchedule(
        findMainCardResult.customer_uid,
        findPlanResult.merchant_uid
      );

      // ????????? ????????? ?????? ??????

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

      // ?????? , ?????????
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

      if (findResult.receipt_category !== 3) {
        // ?????? ???????????? ???
        findResult.tax_price =
          findResult.result_price_levy - findResult.result_price;

        findResult.createdAt = findResult.createdAt
          .split(" ")[0]
          .replace(/-/g, ".");

        const first = findResult.card_number.substring(0, 4);
        const last = findResult.card_number.substring(12, 16);

        findResult.card_number = `${first} **** **** ${last}`;

        return res.send({ success: 200, findResult });
      }
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
      // ??? ??? ?????? ????????? ?????? ??????
      const formOpenMembers = await db.formOpen.findAll({
        where: { formLink_idx: formId },
        attributes: ["user_idx", "idx"],
        raw: true,
      });

      // ????????? ??????
      const invitedMember = [];

      // ????????? ?????? ??????
      const nonMember = [];
      // db??? ??????
      for (i = 0; i < members.length; i++) {
        const checkMemberResult = await db.formOpen.findOne({
          where: { formLink_idx: formId, user_idx: members[i] },
        });

        if (!checkMemberResult) {
          // ?????? ??????
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

      // ????????? idx ??????
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

      // ??? ????????? ??????
      const findFormLink = await db.formLink.findByPk(formId, {
        attributes: ["title"],
      });

      // ???????????? ??????
      const inviter = await db.user.findByPk(user_idx, {
        attributes: ["user_name"],
      });

      // ????????? ?????? ?????? ?????? ??????
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

        // ?????? ?????? ??????
        const sendMembers = [];
        if (data !== user_idx) {
          sendMembers.push(data);
        }
        alarm.sendMultiAlarm(invitedMemberData, sendMembers, io);
      });

      // ????????? ?????? ????????? ?????? ?????????
      nonMember.forEach(async (data) => {
        // ????????? ????????? ?????? ??? ??????
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

          // ?????? ????????? ?????? ?????? ??????
          const sendMembers = [];
          if (data !== user_idx) {
            sendMembers.push(data);
          }

          alarm.sendMultiAlarm(invitedMemberData, sendMembers, io);
        }
      });

      // ??????????????? ?????? ??? ?????? ??????
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

        // ?????? ?????? ??????
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

      // ????????? usre_name ??????, config ??????
      db.userCompany.update(
        { searchingName: user_name, config_idx: templateId },
        { where: { idx: memberId } }
      );

      // user??????
      const findUserResult = await db.userCompany.findByPk(memberId, {
        include: [
          {
            model: db.config,
          },
        ],
      });

      // user ?????? ??????
      await db.user.update(
        { user_name, user_email },
        { where: { idx: findUserResult.user_idx } }
      );

      // formLink create_people ??????
      // user ?????? ??????
      db.formLink.update(
        { create_people: user_name },
        { where: { company_idx, create_people: findUserResult.searchingName } }
      );
      // formOpen ?????? ??????
      db.formOpen.update(
        { user_name },
        { where: { user_idx: findUserResult.user_idx } }
      );

      // ?????? ????????? ?????? ??????
      db.folders.update(
        { upload_people: user_name },
        { where: { company_idx, upload_people: findUserResult.searchingName } }
      );

      db.files.update(
        { upload_people: user_name },
        { where: { company_idx, upload_people: findUserResult.searchingName } }
      );

      // ????????? ??????
      await db.config.update(
        { create_people: user_name },
        { where: { company_idx, create_people: findUserResult.searchingName } }
      );

      const findResult = await findMember({
        idx: memberId,
      });
      if (
        (findTemplate.template_name == "?????????",
        findUserResult.config.template_name !== "?????????")
      ) {
        const io = req.app.get("io");

        // ????????? ????????? ??????
        const findMember = await db.userCompany.findByPk(memberId, {
          attributes: ["user_idx"],
        });

        // ?????? ????????? ??????
        await db.company.update(
          { huidx: findMember.user_idx },
          { where: { idx: company_idx } }
        );

        // ????????? ??????
        const findTeamTemplate = await db.config.findOne({
          where: { company_idx, template_name: "??????" },
          attributes: ["idx"],
        });

        // ?????? ????????? ????????? ??????
        await db.userCompany.update(
          { config_idx: findTeamTemplate.idx },
          { where: { user_idx, company_idx, config_idx: templateId } }
        );

        // ????????? ?????? ????????? ??????
        const checkMembers = await db.userCompany.findAll({
          where: {
            company_idx,
          },
          attributes: ["user_idx"],
          raw: true,
        });

        // ????????? ????????? ?????? ?????? ?????? ??????
        const checkOwnerCard = await db.card.findOne({
          where: { user_idx: findMember.user_idx, main: true },
        });

        // ?????? ???????????? ????????? ??????
        const checkMainCard = await db.card.findOne({
          where: { user_idx, main: true },
        });

        // ?????? ?????? ?????? ?????? ??????
        const checkPlan = await db.plan.findOne({
          where: { company_idx, active: 3 },
        });

        // ??????????????? ??????????????? ???
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
          // ?????? ???????????? ????????? ????????? ?????? ???
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
          // ?????? ???????????? ????????? ????????? ?????? ???
          if (checkMainCard) {
            await cancelSchedule(
              checkMainCard.customer_uid,
              checkPlan.merchant_uid
            );
          }

          //  ????????? ???????????? ????????? ????????? ????????? ?????? ?????? ??????

          // ????????? ????????? ?????? ??????

          const findCardResult = await db.card.findByPk(checkOwnerCard.idx);

          const findUserResult = await db.user.findByPk(findMember.user_idx);

          const startDate = checkPlan.start_plan.replace(/\./g, "-");

          const changeToUnix = moment(
            `${startDate} ${checkPlan.pay_hour}:00`
          ).unix();

          const nextMerchant_uid = generateRandomCode();
          // ?????? ?????? ?????? ??????
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
      // ?????? form ??????
      const findForm = await db.formLink.findByPk(formId, {
        attributes: ["title"],
      });

      // ?????? ?????? ?????? ?????? ??????
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

      // ????????? idx ??????
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
      body: {
        ct,
        planIdx,
        payType,
        whiteLabelChecked,
        chatChecked,
        analysticChecked,
      },
      user_idx,
      company_idx,
    } = req;

    const toChangePlan = await db.planInfo.findByPk(planIdx);
    console.log(req.body);

    const plan_data = await createPlanData(
      toChangePlan,
      payType,
      whiteLabelChecked,
      chatChecked,
      analysticChecked
    );

    plan_data.company_idx = company_idx;
    plan_data.result_price_levy =
      plan_data.result_price * 0.1 + plan_data.result_price;

    // ???????????? ??????
    const t = await db.sequelize.transaction();

    // ?????? ?????? ??????
    let card_data = await verify_data(ct);

    // ???????????? ???????????? ??????
    const findCompany = await db.company.findByPk(company_idx);
    const usedFreePlan = !findCompany.used_free_period ? false : true;
    // ????????? ???????????? ????????? ???????????? ???????????? ??????
    db.company.update(
      { used_free_period: true },
      { where: { idx: company_idx }, transaction: t }
    );
    try {
      // ???????????? ??????
      const user_data = await db.user.findByPk(user_idx);

      if (!card_data) {
        // ?????? ?????? ????????? ?????? ??? ??????????????? ??????
        card_data = await db.card.findOne({
          where: { user_idx, main: true, active: true },
        });
      } else {
        // ??????????????? ????????? ?????? ???????????? ??????
        card_data.user_idx = user_idx;
        card_data = await db.card.create(card_data, {
          transaction: t,
        });
      }

      // ?????? ?????? ??????
      const nowPlan = await db.plan.findOne({
        where: { company_idx, active: 1 },
      });
      // ?????? ?????? ?????? ??????
      const scheduledPlan = await db.plan.findOne({
        where: { company_idx, active: 3 },
      });
      // ?????? ????????????????????? ??????
      const usingFree = !nowPlan.free_plan ? false : true;
      let nextExpireDate;
      if (payType == "month") {
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
      // ?????????????????? ????????? ?????? ??? ???
      if (nowPlan.plan == "??????") {
        console.log("?????? ???????????? ????????? ?????? ??? ???");
        // ???????????? ????????? ???
        if (usingFree) {
          await db.plan.destroy({
            where: { idx: scheduledPlan.idx },
            transaction: t,
          });
          plan_data.start_plan = scheduledPlan.start_plan;
          plan_data.expire_plan = nextExpireDate;
          plan_data.pay_hour = scheduledPlan.pay_hour;
          plan_data.free_plan = scheduledPlan.free_plan;

          plan_data.merchant_uid = nextMerchant_uid;
          plan_data.plan = toChangePlan.plan;

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
            {
              active: 0,
              free_period_expire: startFreeDate,
            },
            { where: { idx: nowPlan.idx }, transaction: t }
          );
          plan_data.free_period_start = startFreeDate;
          plan_data.free_period_expire = nextExpireDate;
          await db.plan.create(plan_data, {
            transaction: t,
          });

          // ????????? unix????????? ??????(??????)

          const startDate = plan_data.start_plan.replace(/\./g, "-");

          const changeToUnix = moment(
            `${startDate} ${scheduledPlan.pay_hour}:00`
          ).unix();

          // ?????? ?????? ?????? ??????
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
          // ?????????????????? ????????? ???
          if (!usedFreePlan) {
            console.log("??????????????? ?????????????????? ????????? ???");
            const { nowStartPlan, nowExpirePlan } = await setPlanDate(payType);
            const Hour = moment().format("HH");
            plan_data.pay_hour = Hour;
            plan_data.free_plan = moment().format("YYYY.MM.DD");
            plan_data.start_plan = nowStartPlan;
            plan_data.expire_plan = nowExpirePlan;
            plan_data.result_price_levy =
              plan_data.result_price * 0.1 + plan_data.result_price;
            plan_data.merchant_uid = nextMerchant_uid;
            plan_data.free_period_start = plan_data.free_plan;
            plan_data.free_period_expire = plan_data.expire_plan;
            await db.plan.create(plan_data, {
              transaction: t,
            });
            await db.plan.create(
              {
                ...plan_data,
                active: 3,
              },
              {
                transaction: t,
              }
            );

            const scheduleUnixTime = moment(
              `${nowStartPlan.replace(/\./g, "-")} ${Hour}:00`
            ).unix();

            // ?????? ?????? ?????? ??????
            await schedulePay(
              scheduleUnixTime,
              card_data.customer_uid,
              plan_data.result_price_levy,
              user_data.user_name,
              user_data.user_phone,
              user_data.user_email,
              nextMerchant_uid
            );
          } else {
            let nowStartPlan;
            let nowExpirePlan;
            const nowMerchentUid = nextMerchant_uid;
            const nextMerchentUid = generateRandomCode();
            if (payType == "month") {
              nowStartPlan = moment().format("YYYY.MM.DD");
              nowExpirePlan = moment()
                .add("1", "M")
                .subtract("1", "days")
                .format("YYYY.MM.DD");
            } else {
              nowStartPlan = moment().format("YYYY.MM.DD");
              nowExpirePlan = moment()
                .add("1", "Y")
                .subtract("1", "days")
                .format("YYYY.MM.DD");
            }
            const Hour = moment().format("HH");

            plan_data.start_plan = nowStartPlan;
            plan_data.expire_plan = nowExpirePlan;

            plan_data.merchant_uid = nowMerchentUid;
            plan_data.pay_hour = Hour;

            await db.plan.create(plan_data, {
              transaction: t,
            });

            if (payType == "month") {
              nowStartPlan = moment(nowExpirePlan.replace(/\./gi, "-"))
                .add("1", "days")
                .format("YYYY.MM.DD");
              nowExpirePlan = moment(nowStartPlan.replace(/\./gi, "-"))
                .add("1", "M")
                .subtract("1", "days")
                .format("YYYY.MM.DD");
            } else {
              nowStartPlan = moment(nowExpirePlan.replace(/\./gi, "-"))
                .add("1", "days")
                .format("YYYY.MM.DD");
              nowExpirePlan = moment(nowStartPlan.replace(/\./gi, "-"))
                .add("1", "Y")
                .subtract("1", "days")
                .format("YYYY.MM.DD");
            }
            plan_data.start_plan = nowStartPlan;
            plan_data.expire_plan = nowExpirePlan;
            plan_data.merchant_uid = nextMerchentUid;
            if (scheduledPlan) {
              await db.plan.destroy({
                where: { idx: scheduledPlan.idx },
                transaction: t,
              });
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

            const { success } = await payNow(
              card_data.customer_uid,
              plan_data.result_price_levy,
              nowMerchentUid,
              "?????? ?????? ??????"
            );
            if (!success) {
              await t.rollback();
              return res.send({ success: 400, message: "?????? ??????." });
            }

            const scheduleUnixTime = moment(
              `${nowStartPlan.replace(/\./g, "-")} ${Hour}:00`
            ).unix();

            await schedulePay(
              scheduleUnixTime,
              card_data.customer_uid,
              plan_data.result_price_levy,
              user_data.user_name,
              user_data.user_phone,
              user_data.user_email,
              nextMerchentUid
            );
          }
        }
      } else {
        // ????????? ?????????????????? ??? ???
        if (plan_data.plan == "??????") {
          // ?????? ????????? ???????????? ????????? ???
          if (usingFree) {
            console.log("???????????? ????????? ???????????????????????? ??????????????????");
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
              {
                active: 0,
                free_period_expire: startFreeDate,
              },
              {
                where: { idx: nowPlan.idx },
                transaction: t,
              }
            );
            // ?????? ?????? ?????? ??????
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
            console.log("?????? ?????? ????????? active 3");
          } else {
            console.log(
              "???????????? ????????? ???????????????????????? ?????????????????? ????????? ???"
            );
            // ???????????? ?????? ?????? ????????????

            await db.plan.update(
              {
                will_free: scheduledPlan.start_plan,
                plan: "??????",
                whiteLabel_price: 0,
                chat_price: 0,
                analystic_price: 0,
                pay_type: null,
                plan_price: 0,
              },
              { where: { idx: scheduledPlan.idx }, transaction: t }
            );
          }
          console.log("?????? ?????? ?????? ??????");
          console.log(card_data.customer_uid);

          // ????????? ?????? ?????? ??????
          await cancelSchedule(
            card_data.customer_uid,
            scheduledPlan.merchant_uid
          );
        } else {
          console.log("???????????? ????????? ??????????????? ?????????????????? ??? ???");
          // ?????? ?????? ?????? ??????
          await db.plan.destroy({
            where: { idx: scheduledPlan.idx },
            transaction: t,
          });

          // ????????? unix????????? ??????(??????)

          const startDate = scheduledPlan.start_plan.replace(/\./g, "-");

          const changeToUnix = moment(
            `${startDate} ${scheduledPlan.pay_hour}:00`
          ).unix();

          // ?????? ????????? ?????? ??????
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

          // ?????? ????????? ???????????? ????????? ???
          if (usingFree) {
            console.log("???????????? ????????? ???????????? ???????????? ????????? ???");

            const startFreeDate = moment().format("YYYY.MM.DD");
            plan_data.free_period_start = startFreeDate;
            plan_data.free_period_expire = nextExpireDate;

            plan_data.free_plan = nowPlan.free_plan;
            await db.plan.update(
              {
                active: 0,
                free_period_expire: startFreeDate,
              },
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

          // ????????? ??????
          await cancelSchedule(
            card_data.customer_uid,
            scheduledPlan.merchant_uid
          );

          // ?????? ?????? ?????? ??????
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
