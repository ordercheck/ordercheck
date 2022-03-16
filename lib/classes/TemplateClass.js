const db = require("../../model/db");
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
} = require("../../lib/attributes");
class Template {
  constructor(configData) {
    this.configData = { ...configData };
  }

  updateConfig = async (updateData, whereData) => {
    db.config.update(updateData, { where: whereData });
  };

  findConfigFindByPk = async (templateId) => {
    const findResult = await db.config.findByPk(templateId, {
      attributes: { exclude: showDetailTemplateConfig },
    });
    return findResult;
  };

  findAllConfig = async (whereData) => {
    const findResult = await db.config.findAll({
      where: whereData,
      attributes: showTemplateListAttributes,
      raw: true,
    });
    return findResult;
  };

  createConfig = async (title, user_name, company_idx) => {
    this.configData.template_name = title;
    this.configData.create_people = user_name;
    this.configData.company_idx = company_idx;
    const createdResult = await this.createConfig(this.configData);
    return createdResult;
  };

  createConfig = async (createData) => {
    const createdResult = await db.config.create(createData);
    return createdResult;
  };

  // 중복된 form이 있는지 확인
  checkTitle = async (whereData) => {
    const data = { title: whereData.template_name };
    const checkTitle = await db.config.findOne(
      { where: whereData },
      { attributes: ["duplicateCount"] }
    );

    // 중복된 title이 있는 경우
    if (checkTitle) {
      data.title = `${whereData.template_name}_${
        checkTitle.duplicateCount + 1
      }`;
      db.config.increment({ duplicateCount: 1 }, { where: whereData });
    }

    return data;
  };
}

module.exports = { Template };
