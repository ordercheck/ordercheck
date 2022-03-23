const db = require("../../model/db");

class Template {
  constructor(configData) {
    this.configData = { ...configData };
  }

  destroyConfig = async (whereData) => {
    await db.config.destroy({ where: whereData });
  };

  findConfig = async (whereData, attributesData) => {
    const findResult = await db.config.findOne({
      where: whereData,
      attributes: attributesData,
    });

    return findResult;
  };

  updateConfig = async (updateData, whereData) => {
    db.config.update(updateData, { where: whereData });
  };

  findConfigFindByPk = async (templateId, attributesData) => {
    const findResult = await db.config.findByPk(templateId, {
      attributes: attributesData,
    });
    return findResult;
  };

  findAllConfig = async (whereData, attributesData, orderData) => {
    const findResult = await db.config.findAll({
      where: whereData,
      attributes: attributesData,
      order: orderData,
      raw: true,
    });
    return findResult;
  };

  createPrivateConfig = async (title, user_name, company_idx) => {
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
