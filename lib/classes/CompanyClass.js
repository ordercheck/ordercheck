const db = require("../../model/db");

const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");

const {
  getCompanyProfileMemberUserAttributes,
  getCompanyProfileMemberMainAttributes,
} = require("../../lib/attributes");
class Company {
  delCompanyAndChangeFree = async (member) => {
    const findUser = await this.findOneUserCompany({ idx: member }, [
      "user_idx",
    ]);
    await this.delCompanyMember(member);
    await this.updateCompanyMember(
      { active: true },
      { user_idx: findUser.user_idx, active: false, standBy: false }
    );
  };

  delCompanyMember = async (member) => {
    await db.userCompany.destroy({ where: { idx: member } });
  };

  findOneUserCompany = async (whereData, attributesData) => {
    return await db.userCompany.findOne({
      where: whereData,
      attributes: attributesData,
    });
  };
  findMembers = async (whereData, sortData, user) => {
    const result = await db.userCompany.findAll({
      where: whereData,
      include: [
        {
          model: db.user,
          attributes: getCompanyProfileMemberUserAttributes,
        },
        {
          model: db.config,
          attributes: [["idx", "templateId"], "template_name"],
        },
      ],
      attributes: getCompanyProfileMemberMainAttributes,
      order: [sortData],
      raw: true,
      nest: true,
    });

    let findResult = [];
    for (let i = 0; i < result.length; i++) {
      // 나일때
      if (result[i].user_idx == user) {
        findResult.unshift(result[i]);
        findResult.splice(i + 1, 1);
      } else {
        findResult.push(result[i]);
      }
    }

    console.log(findResult);
    const memberList = [];
    for (let i = 0; i < findResult.length; i++) {
      const includeData = { ...findResult[i].user, ...findResult[i].config };
      const pushData = {
        ...includeData,
        memberId: findResult[i].memberId,
        createdAt: findResult[i].createdAt,
        user_idx: findResult[i].user_idx,
        No: No,
      };

      memberList.push(pushData);
      No -= 1;
    }

    return memberList;
  };

  updateCompany = async (updateData, whereData) => {
    await db.company.update(updateData, { where: whereData });
  };

  updateCompanyMember = async (updateData, whereData) => {
    await db.userCompany.update(updateData, { where: whereData });
  };

  updateLogoAndEnrollment = async (company_idxData, fileData, changeData) => {
    const updateCompanyLogo = async (UrlData, TitleData, change) => {
      let updateKey;
      change == "logo"
        ? (updateKey = "company_logo")
        : (updateKey = "business_enrollment");

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
      if (!fileData && changeData == "logo") {
        await updateCompanyLogo("", "", changeData);
      }
      // 로고를 바꾸는 경우
      else if (fileData && changeData == "logo") {
        const originalUrl = fileData.location;
        const thumbNail = originalUrl.replace(/\/original\//, "/thumb/");
        await updateCompanyLogo(thumbNail, fileData.originalname, changeData);
      }

      //사업자 등록증 새로 등록
      else if (fileData && changeData == "enrollment") {
        await updateCompanyLogo(
          fileData.location,
          fileData.originalname,
          changeData
        );
      }
      // 사업자 등록증 삭제
      else if (!fileData && changeData == "enrollment") {
        await updateCompanyLogo(null, null, changeData);
      }

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  };
}

module.exports = { Company };
