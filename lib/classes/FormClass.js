const { ETC } = require("../classes/ETC");
const db = require("../../model/db");
class Form extends ETC {
  constructor(body) {
    super();
    this.bodyData = body;
  }

  findFormOpenAndLink = async (whereData, attributesData) => {
    return await db.formOpen.findAll({
      where: whereData,
      include: [
        {
          model: db.formLink,
          attributes: attributesData,
        },
      ],
      order: [["createdAt", "DESC"]],
      raw: true,
      nest: true,
    });
  };

  findAllLink = async (whereData, attributesData) => {
    const findFormLinkResult = await db.formLink.findAll({
      where: whereData,
      attributes: attributesData,
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    return findFormLinkResult;
  };

  createOpenMember = async (data) => {
    await db.formOpen.create(data);
  };

  createFormLink = async (insertData) => {
    const createResult = await db.formLink.create(insertData);
    return createResult;
  };

  checkTitle = async (whereData) => {
    const data = { title: whereData.title };
    const checkTitle = await db.formLink.findOne(
      { where: whereData },
      { attributes: ["duplicateCount"] }
    );

    // 중복된 title이 있는 경우
    if (checkTitle) {
      data.title = `${whereData.title}_${checkTitle.duplicateCount + 1}`;
      db.formLink.increment({ duplicateCount: 1 }, { where: whereData });
    }

    return data;
  };

  createNewUrl = (imgUrl, conceptUrl) => {
    this.bodyData.floor_plan = JSON.stringify(imgUrl);
    this.bodyData.hope_concept = JSON.stringify(conceptUrl);
    this.bodyData.expand = this.bodyData.expand.replace(/,/g, ", ");
    this.bodyData.carpentry = this.bodyData.carpentry.replace(/,/g, ", ");
    this.bodyData.paint = this.bodyData.paint.replace(/,/g, ", ");
    this.bodyData.bathroom_option = this.bodyData.bathroom_option.replace(
      /,/g,
      ", "
    );
    this.bodyData.floor = this.bodyData.floor.replace(/,/g, ", ");
    this.bodyData.tile = this.bodyData.tile.replace(/,/g, ", ");
    this.bodyData.electricity_lighting =
      this.bodyData.electricity_lighting.replace(/,/g, ", ");
    this.bodyData.kitchen_option = this.bodyData.kitchen_option.replace(
      /,/g,
      ", "
    );
    this.bodyData.furniture = this.bodyData.furniture.replace(/,/g, ", ");
    this.bodyData.facility = this.bodyData.facility.replace(/,/g, ", ");
    this.bodyData.film = this.bodyData.film.replace(/,/g, ", ");
    this.bodyData.etc = this.bodyData.etc.replace(/,/g, ", ");
    return this.bodyData;
  };
}

module.exports = { Form };
