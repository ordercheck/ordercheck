class Company {
  constructor(body) {
    this.bodyData = body;
  }

  delCompanyMember = async (member) => {
    const deletedTime = moment().format('YYYY.MM.DD');
    await this.updateCompany(
      { deleted: deletedTime, active: false },
      { idx: member }
    );
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
          attributes: ['idx', 'template_name'],
        },
      ],
      attributes: getCompanyProfileMemberMainAttributes,
      order: [sortData],
      raw: true,
      nest: true,
    });

    let No = 0;
    let findResult = [];
    for (let i = 0; i < result.length; i++) {
      if (result[i].memberId == user) {
        findResult.unshift(result[i]);
        findResult.splice(i + 1, 1);
      } else {
        findResult.push(result[i]);
      }
    }

    const mapResult = findResult.map((data) => {
      const includeData = { ...data.user, ...data.config };
      data = {
        ...includeData,
        memberId: data.memberId,
        createdAt: data.createdAt,
        No: No + 1,
      };
      return data;
    });

    return mapResult;
  };

  updateCompany = async (updateData, whereData) => {
    await db.company.update(updateData, { where: whereData });
  };

  updateLogoAndEnrollment = async (company_idxData, fileData, changeData) => {
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
}

module.exports = { Company };
