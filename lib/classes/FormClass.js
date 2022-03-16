const { ETC } = require("../classes/ETC");
const db = require("../../model/db");
class Form extends ETC {
  constructor(body) {
    super();
    this.bodyData = body;
  }

  checkTitle = async (whereData) => {
    const data = { title: whereData.template_name };
    const checkTitle = await db.formLink.findOne(
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
