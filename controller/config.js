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

require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");

module.exports = {
  getCompanyProfile: async (req, res, next) => {
    try {
      let companyProfile = await db.sequelize
        .query(
          `SELECT plan, company_name, company_logo, company_subdomain, address, 
          detail_address, company.business_number, business_enrollment, business_enrollment_title, user_name,
          card.active AS cardActive,
          text_cost,
          whiteLabelChecked,  
          chatChecked, 
          analysticChecked
          FROM userCompany 
          LEFT JOIN company ON userCompany.company_idx = company.idx
          LEFT JOIN plan ON userCompany.company_idx = plan.company_idx
          LEFT JOIN user ON company.huidx = user.idx
          LEFT JOIN card ON card.user_idx = user.idx AND main=true
          LEFT JOIN sms ON sms.user_idx = user.idx
          WHERE userCompany.user_idx = ${req.user_idx} AND userCompany.active = true AND standBy = false`
        )
        .spread((r) => {
          return makeSpreadArray(r);
        });

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
      await company.delCompanyMember(memberId);
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
      const createdResult = createConfigClass.createPrivateConfig(
        checkTitleResult.title,
        findUser.user_name,
        company_idx
      );

      return res.send({ success: 200, templateId: createdResult.idx });
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
        showTemplateListAttributes
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
      let message_price;
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
        if (payResult.success == 200) {
          message_price = findResult.auto_price;
        }
        isPayment = true;
      }

      findResult.dataValues.text_cost = findResult.text_cost.toLocaleString();
      findResult.dataValues.auto_price = findResult.auto_price.toLocaleString();
      findResult.dataValues.auto_min = findResult.auto_min.toLocaleString();

      return res.send({ success: 200, findResult, isPayment, message_price });
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
        company_name: findCompany.company_name,
        before_text_price: findSmsResult.text_cost,
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

    res.send({ success: 200, message: "충전 완료", message_price: plusCost });

    const receiptId = generateRandomCode(6);

    await db.receipt.create({
      company_idx,
      card_name: findCardResult.card_name,
      card_code: findCardResult.card_code,
      result_price_levy: text_cost,
      before_text_price: findSmsResult.text_cost,
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
        const second = findCardInfo[i].card_number.substring(4, 8);
        const third = findCardInfo[i].card_number.substring(8, 12);
        findCardInfo[i].card_number = `**** ${second} ${third} ****`;
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
      }

      if (category == 1) {
        findResult = await findReceiptList({
          company_idx,
          receipt_kind: "구독",
        });
      }
      if (category == 2) {
        findResult = await findReceiptList({
          company_idx,
          receipt_kind: "자동 문자 충전",
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
      if (!findResult.plan) {
        findResult.tax_price =
          findResult.result_price_levy - findResult.result_price;
      } else {
        findResult.tax_price = findResult.result_price_levy * 0.1;
      }

      findResult.createdAt = findResult.createdAt
        .split(" ")[0]
        .replace(/-/g, ".");

      const second = findResult.card_number.substring(4, 8);
      const third = findResult.card_number.substring(8, 12);

      findResult.card_number = `**** ${second} ${third}  ****`;

      return res.send({ success: 200, findResult });
    } catch (err) {
      next(err);
    }
  },
  showFormList: async (req, res, next) => {
    const { company_idx } = req;

    try {
      const findResult = await db.formLink.findAll({
        where: { company_idx },
        include: [
          {
            model: db.formOpen,
            attributes: ["user_name"],
          },
        ],
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
    } = req;

    try {
      members.forEach(async (data) => {
        const findUserNameResult = await db.user.findByPk(data, {
          attributes: ["user_name"],
        });

        await db.formOpen.create({
          formLink_idx: formId,
          user_name: findUserNameResult.user_name,
          user_idx: data,
        });
      });
      return res.send({ success: 200 });
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
};
