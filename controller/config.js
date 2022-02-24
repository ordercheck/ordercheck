const db = require('../model/db');
const { makeSpreadArray } = require('../lib/functions');
const _f = require('../lib/functions');
const { getFileName, findMembers } = require('../lib/apiFunctions');
const { Op } = require('sequelize');
const { payNow } = require('../lib/payFunction');
const moment = require('moment');
const {
  showTemplateListAttributes,
  showPlanAttributes,
  showPlanHistoryAttributes,
  showDetailPlanAttributes,
  showSmsHistoryAttributes,
  showCardsInfoAttributes,
  showCardDetailAttributes,
} = require('../lib/attributes');
const attributes = require('../lib/attributes');
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
    const findCompanyResult = await db.company.findByPk(company_idxData, {
      attributes: ['company_logo_title'],
    });
    // 로고를 새로 업로드 하는 경우
    if (!findCompanyResult.company_logo_title) {
      const file_name = getFileName(fileData.key);
      await updateCompanyLogo(fileData.location, file_name, changeData);
    }
    // 로고를 삭제하는 경우
    if (!fileData) {
      delFile(
        findCompanyResult.company_logo_title,
        `ordercheck/${changeData}/${company_idxData}`
      );
      await updateCompanyLogo(null, null, changeData);
    }
    // 로고를 바꾸는 경우
    if (findCompanyResult.company_logo_title) {
      delFile(
        findCompanyResult.company_logo_title,
        `ordercheck/${changeData}/${company_idxData}`
      );
      const file_name = getFileName(fileData.key);
      await updateCompanyLogo(fileData.location, file_name, changeData);
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
          `SELECT user.idx, personal_code, user_phone, userCompany.company_idx, user_profile, user_email, user_name, plan, calculateReload,
          date_format(user.createdAt, '%Y.%m.%d') as createdAt
          FROM user 
          LEFT JOIN userCompany ON user.idx = userCompany.user_idx 
          LEFT JOIN config ON userCompany.config_idx = config.idx  
          LEFT JOIN plan ON userCompany.company_idx = plan.company_idx and plan.active = 1     
          WHERE user.idx = ${req.user_idx}`
        )
        .spread((r) => {
          return makeSpreadArray(r);
        });

      const findFilesResult = await db.files.findAll({
        where: {
          company_idx: userProfile[0].company_idx,
        },
        attributes: ['file_size'],
        raw: true,
      });

      let fileStoreSize = 0;
      findFilesResult.forEach((data) => {
        fileStoreSize += data.file_size;
      });
      userProfile[0].fileStoreSize = fileStoreSize;

      return res.send({ success: 200, userProfile: userProfile[0] });
    } catch (err) {
      next(err);
    }
  },
  getCompanyProfile: async (req, res, next) => {
    try {
      let companyProfile = await db.sequelize
        .query(
          `SELECT plan, company_name, company_logo, company_subdomain, address, detail_address, business_number, business_enrollment,  business_enrollment_title,user_name FROM userCompany 
      LEFT JOIN company ON userCompany.company_idx = company.idx
      INNER JOIN plan ON userCompany.company_idx = company.idx
      LEFT JOIN user ON company.huidx = user.idx
      WHERE userCompany.user_idx = ${req.user_idx}
   `
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
    try {
      const result = await updateLogoAndEnrollment(
        company_idx,
        file.transforms[0],
        'logo'
      );
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
      const findResult = await findMembers(
        { company_idx, deleted: null },
        company_idx
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
  showTemplateList: async (req, res, next) => {
    const { company_idx } = req;
    const findResult = await db.config.findAll({
      where: { company_idx },
      attributes: showTemplateListAttributes,
    });
    return res.send({ success: 200, findResult });
  },
  addTemplate: async (req, res, next) => {
    const { company_idx, body, user_idx } = req;
    try {
      const findUserResult = await db.user.findByPk(user_idx, {
        attributes: ['user_name'],
      });
      body.create_people = findUserResult.user_name;
      body.company_idx = company_idx;
      await db.config.create(body);
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
    // 삭제 하려는 카드가 main 카드인지 체크
    //아임포트 카드 삭제
    // db 카드 삭제
  },
};
