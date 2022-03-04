const db = require('../model/db');
const { makeSpreadArray } = require('../lib/functions');
const _f = require('../lib/functions');
const { getFileName, findMembers, findMember } = require('../lib/apiFunctions');
const { Op } = require('sequelize');
const { masterConfig } = require('../lib/standardTemplate');

const {
  payNow,
  delCardPort,
  cancelSchedule,
  schedulePay,
} = require('../lib/payFunction');
const moment = require('moment');
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
} = require('../lib/attributes');

require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');

const { delFile } = require('../lib/aws/fileupload').ufile;

const updateLogoAndEnrollment = async (
  company_idxData,
  fileData,
  changeData
) => {
  const updateCompanyLogo = async (UrlData, TitleData, change) => {
    let updateKey;
    change == 'logo'
      ? (updateKey = 'company_logo')
      : (updateKey = 'business_enrollment');

    const updateKeyTitle = `${updateKey}_title`;

    await db.company.update(
      {
        [updateKey]: UrlData,
        [updateKeyTitle]: TitleData,
      },
      { where: { idx: company_idxData } }
    );
  };
  try {
    // 로고를 삭제하는 경우
    if (!fileData && changeData == 'logo') {
      await updateCompanyLogo('', '', changeData);
    }
    // 로고를 바꾸는 경우
    else if (fileData && changeData == 'logo') {
      const originalUrl = fileData.location;
      const thumbNail = originalUrl.replace(/\/original\//, '/thumb/');
      await updateCompanyLogo(thumbNail, fileData.originalname, changeData);
    }

    //사업자 등록증 새로 등록
    else if (fileData && changeData == 'enrollment') {
      await updateCompanyLogo(
        fileData.location,
        fileData.originalname,
        changeData
      );
    }
    // 사업자 등록증 삭제
    else if (!fileData && changeData == 'enrollment') {
      await updateCompanyLogo(null, null, changeData);
    }

    return true;
  } catch (err) {
    return false;
  }
};

module.exports = {
  getUserProfile: async (req, res, next) => {
    try {
      let userProfile = await db.sequelize
        .query(
          `SELECT user.idx, personal_code, user_phone, userCompany.company_idx, user_profile, 
          user_email, user_name, plan, calculateReload, config_idx,
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
        attributes: ['file_size'],
        raw: true,
      });

      let fileStoreSize = 0;
      findFilesResult.forEach((data) => {
        fileStoreSize += data.file_size;
      });

      const findConfig = await db.config.findByPk(userProfile[0].company_idx, {
        attributes: { exclude: ['createdAt', 'updatedAt', 'company_idx'] },
      });
      userProfile[0].fileStoreSize = fileStoreSize;
      userProfile[0].authList = findConfig;
      return res.send({ success: 200, userProfile: userProfile[0] });
    } catch (err) {
      next(err);
    }
  },
  getCompanyProfile: async (req, res, next) => {
    try {
      let companyProfile = await db.sequelize
        .query(
          `SELECT plan, company_name, company_logo, company_subdomain, address, 
          detail_address, business_number, business_enrollment, business_enrollment_title, user_name,
          whiteLabelChecked,  
          chatChecked, 
          analysticChecked
          FROM userCompany 
          LEFT JOIN company ON userCompany.company_idx = company.idx
          LEFT JOIN plan ON userCompany.company_idx = company.idx
          LEFT JOIN user ON company.huidx = user.idx
          WHERE userCompany.user_idx = ${req.user_idx}
   `
        )
        .spread((r) => {
          return makeSpreadArray(r);
        });

      if (companyProfile[0].whiteLabelChecked == 1) {
        companyProfile[0].whiteLabelChecked = true;
      }

      if (companyProfile[0].chatChecked == 1) {
        companyProfile[0].chatChecked = true;
      }
      if (companyProfile[0].analysticChecked == 1) {
        companyProfile[0].analysticChecked = true;
      }

      if (companyProfile[0].whiteLabelChecked == 0) {
        companyProfile[0].whiteLabelChecked = false;
      }
      if (companyProfile[0].chatChecked == 0) {
        companyProfile[0].chatChecked = false;
      }
      if (companyProfile[0].analysticChecked == 0) {
        companyProfile[0].analysticChecked = false;
      }

      return res.send({ success: 200, companyProfile: companyProfile[0] });
    } catch (err) {
      next(err);
    }
  },
  changeCompanyLogo: async (req, res, next) => {
    const { company_idx, file } = req;

    try {
      const result = await updateLogoAndEnrollment(company_idx, file, 'logo');
      if (result) {
        return res.send({ success: 200 });
      }
    } catch (err) {
      next(err);
    }
  },

  delCompanyLogo: async (req, res, next) => {
    const { company_idx, file } = req;
    try {
      const result = await updateLogoAndEnrollment(company_idx, file, 'logo');
      if (result) {
        return res.send({ success: 200 });
      }
    } catch (err) {
      next(err);
    }
  },
  changeCompanyInfo: async (req, res, next) => {
    const {
      body: {
        company_name,
        company_subdomain,
        address,
        detail_address,
        business_number,
      },
      company_idx,
    } = req;
    const updateCompanyInfo = async (updateKey, updateData) => {
      await db.company.update(
        { [updateKey]: updateData },
        { where: { idx: company_idx } }
      );
    };

    try {
      if (company_name) {
        await updateCompanyInfo('company_name', company_name);
      }
      if (company_subdomain) {
        await updateCompanyInfo('company_subdomain', company_subdomain);
      }
      if (address) {
        await updateCompanyInfo('address', address);
      }
      if (detail_address) {
        await updateCompanyInfo('detail_address', detail_address);
      }
      if (business_number) {
        await updateCompanyInfo('business_number', business_number);
      }

      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },
  changeCompanyEnrollment: async (req, res, next) => {
    const { company_idx, file } = req;
    try {
      const result = await updateLogoAndEnrollment(
        company_idx,
        file,
        'enrollment'
      );
      if (result) {
        return res.send({ success: 200 });
      }
    } catch (err) {
      next(err);
    }
  },
  getCompanyProfileMember: async (req, res, next) => {
    const { company_idx } = req;
    try {
      const findResult = await findMembers({
        company_idx,
        deleted: null,
        active: true,
      });

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
      const findResult = await findMembers(
        {
          searchingName: {
            [Op.like]: `%${search}%`,
          },
          company_idx,
          deleted: null,
        },
        company_idx
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
    const deletedTime = moment().format('YYYY.MM.DD');
    try {
      await db.userCompany.update(
        { deleted: deletedTime },
        { where: { idx: memberId } }
      );
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
    const findUser = await db.user.findByPk(user_idx, {
      attributes: ['user_name'],
    });

    masterConfig.template_name = title;
    masterConfig.create_people = findUser.user_name;
    masterConfig.create_people = company_idx;

    await db.config.create(masterConfig);

    return res.send({ success: 200 });
  },
  showTemplateList: async (req, res, next) => {
    const { company_idx } = req;
    const findResult = await db.config.findAll({
      where: { company_idx },
      attributes: showTemplateListAttributes,
      raw: true,
    });

    let No = 1;
    findResult.map((data) => {
      data.No = No;
      No++;
    });

    return res.send({ success: 200, findResult });
  },
  showDetailTemplate: async (req, res, next) => {
    const { templateId } = req.params;
    const findResult = await db.config.findByPk(templateId, {
      attributes: { exclude: showDetailTemplateConfig },
    });
    return res.send({ success: 200, findResult });
  },
  changeTemplate: async (req, res, next) => {
    const {
      company_idx,
      body,
      user_idx,
      params: { templateId },
    } = req;
    try {
      const findUserResult = await db.user.findByPk(user_idx, {
        attributes: ['user_name'],
      });

      const updatedDate = moment().format('YYYY.MM.DD HH:mm');

      const update_people = `${updatedDate} ${findUserResult.user_name}`;
      body.update_people = update_people;
      body.company_idx = company_idx;
      await db.config.update(body, { where: { idx: templateId } });
      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },
  delTemplate: async (req, res, next) => {
    const {
      params: { templateId },
    } = req;
    try {
      const findUserResult = await db.userCompany.findAll({
        where: { config_idx: templateId },
        raw: true,
        nest: true,
      });
      const findConfigResult = await db.config.findOne({
        where: { idx: templateId, template_name: '팀원' },
        attributes: ['idx'],
      });
      findUserResult.forEach(async (data) => {
        await db.userCompany.update(
          { config_idx: findConfigResult.idx },
          { where: { idx: data.idx } }
        );
      });
      await db.config.destroy({ where: { idx: templateId } });
      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },
  showPlan: async (req, res, next) => {
    const { company_idx } = req;
    const findPlanResult = await db.plan.findOne({
      where: { idx: company_idx, active: 1 },
      include: [
        {
          model: db.company,
          attributes: ['form_link_count'],
        },
      ],
      attributes: showPlanAttributes,
    });
    return res.send(findPlanResult);
  },
  showPlanHistory: async (req, res, next) => {
    const { company_idx } = req;
    try {
      const findPlanResult = await db.plan.findAll({
        where: { company_idx },
        attributes: showPlanHistoryAttributes,
        order: [['createdAt', 'DESC']],
      });
      return res.send({ success: 200, findPlanResult });
    } catch (err) {
      next(err);
    }
  },
  showDetailPlan: async (req, res, next) => {
    const { planId } = req.params;
    const findPlanResult = await db.plan.findOne({
      where: { merchant_uid: planId },
      attributes: showDetailPlanAttributes,
    });
    return res.send({ success: 200, findPlanResult });
  },
  showSmsInfo: async (req, res, next) => {
    const { user_idx } = req;
    const findResult = await db.sms.findOne({
      where: { user_idx },
      attributes: ['text_cost', 'repay', 'auto_price', 'auto_min'],
    });
    return res.send({ success: 200, findResult });
  },
  changeSms: async (req, res, next) => {
    const { user_idx } = req;
    try {
      await db.sms.update(req.body, {
        where: {
          user_idx,
        },
      });
      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },
  paySms: async (req, res, next) => {
    const {
      user_idx,
      body: { text_cost },
    } = req;

    const findCardResult = await db.card.findOne({
      where: { user_idx, main: true },
    });
    if (!findCardResult) {
      return res.send({ success: 400, message: '등록된 카드가 없습니다.' });
    }

    const merchant_uid = _f.random5();

    const payResult = await payNow(
      findCardResult.customer_uid,
      text_cost.replace(/,/g, ''),
      merchant_uid,
      '문자 충전'
    );

    if (!payResult.success) {
      return next(payResult.message);
    }

    const findSmsResult = await db.sms.findOne({
      where: { user_idx },
      attributes: ['text_cost'],
    });
    // 이전 문자비용 숫자로 바꾸기
    const beforeCost = parseInt(findSmsResult.text_cost.replace(/,/g, ''));
    // 추가할 문자비용 숫자로 바꾸기
    const plusCost = parseInt(text_cost.replace(/,/g, ''));
    const addCost = (beforeCost + plusCost).toLocaleString();

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

    return res.send({ success: 200, message: '충전 완료' });
  },
  showSmsHistory: async (req, res, next) => {
    const { user_idx } = req;
    try {
      const findResult = await db.smsHistory.findAll({
        where: { user_idx },
        attributes: showSmsHistoryAttributes,
      });
      return res.send({ success: 200, findResult });
    } catch (err) {
      next(err);
    }
  },
  showCardsInfo: async (req, res, next) => {
    const { user_idx } = req;
    try {
      const findResult = await db.card.findAll({
        where: { user_idx },
        attributes: showCardsInfoAttributes,
      });
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
        attributes: ['main'],
      });
      if (findCardResult.main == true) {
        next({ message: '기본 결제 카드로 지정된 카드 입니다.' });
      }

      // db 카드 삭제
      await db.card.destroy({ where: { idx: cardId } });

      res.send({ success: 200, message: '카드 삭제 완료' });
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
    // 메인으로 설정되어있는 카드 false로 변경

    const findMainCardResult = await db.card.findOne(
      { where: { user_idx, main: true } },
      { attributes: ['idx', 'customer_uid'] }
    );

    await db.card.update(
      { main: false },
      { where: { idx: findMainCardResult.idx } }
    );

    //타겟 카드를 true로 변경
    await db.card.update({ main: true }, { where: { idx: cardId } });

    // 기존의 아임포트 결제 예약 취소

    await cancelSchedule(findMainCardResult.customer_uid);

    // 새로운 카드로 결제 예약

    const findPlanResult = await db.plan.findOne({
      where: { company_idx, active: 3 },
    });

    const findCardResult = await db.card.findByPk(cardId);

    const findUserResult = await db.user.findByPk(user_idx);

    const Hour = moment().format('HH');

    const startDate = findPlanResult.start_plan.replace(/\./g, '-');

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
  },

  getReceiptList: async (req, res, next) => {
    const findReceiptList = async (whereData) => {
      const findReceiptListResult = await db.receipt.findAll({
        where: whereData,
        attributes: getReceiptListAttributes,
        order: [['createdAt', 'DESC']],
      });
      return findReceiptListResult;
    };

    const {
      query: { category },
      company_idx,
    } = req;

    try {
      let findResult;

      if (category == 0) {
        findResult = await findReceiptList({ company_idx });
      }

      if (category == 1) {
        findResult = await findReceiptList({
          company_idx,
          receipt_kind: '구독',
        });
      }
      if (category == 2) {
        findResult = await findReceiptList({
          company_idx,
          receipt_kind: '자동문자',
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

    const findResult = await db.receipt.findOne({
      where: { receiptId },
      attributes: { exclude: ['idx', 'updatedAt'] },
      raw: true,
    });

    findResult.tax_price =
      findResult.result_price_levy - findResult.result_price;

    return res.send({ success: 200, findResult });
  },
  showFormList: async (req, res, next) => {
    const { company_idx } = req;

    const findResult = await db.formLink.findAll({
      where: { company_idx },
      include: [
        {
          model: db.formOpen,
          attributes: ['user_name'],
        },
      ],
      attributes: showFormListAttributes,
    });
    return res.send({ success: 200, findResult });
  },
  setFormOpenMembers: async (req, res, next) => {
    const {
      params: { formId },
      body: { members },
      company_idx,
    } = req;

    members.forEach(async (data) => {
      const findUserNameResult = await db.user.findByPk(data, {
        attributes: ['user_name'],
      });

      await db.formOpen.create({
        formLink_idx: formId,
        user_name: findUserNameResult.user_name,
        user_idx: data,
      });
    });
    return res.send({ success: 200 });
  },
  showChatTemplate: async (req, res, next) => {
    const { company_idx } = req;
    const findResult = await db.chatTemplate.findAll({
      where: { company_idx },
      attributes: ['title', 'contents', 'edit'],
    });
    return res.send({ success: 200, findResult });
  },
  changeMemberInfo: async (req, res, next) => {
    const {
      body: { user_name, user_email, templateId },
      params: { memberId },
      company_idx,
    } = req;

    // 검색용 usre_name 변경, config 변경
    await db.userCompany.update(
      { searchingName: user_name, config_idx: templateId },
      { where: { idx: memberId } }
    );
    // user찾기
    const findUserResult = await db.userCompany.findByPk(memberId, {
      attributes: ['user_idx'],
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
  },
};
