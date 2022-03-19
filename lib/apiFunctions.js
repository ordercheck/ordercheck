const db = require("../model/db");
const { makeArray } = require("./functions");
const _f = require("./functions");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
const { Alarm } = require("./classes/AlarmClass");
let { masterConfig } = require("../lib/standardTemplate");
const {
  showDetailConsultingAttributes,
  showDetailJoinConsultingAttributes,
  showDetailMainConsultingAttributes,
  findSameUserAttributes,
  searchCustomersAttributes,
  searchFileStoreFoldersAttributes,
  searchFileStoreFilesAttributes,
  searchFormLinkAttributes,
  getCompanyProfileMemberUserAttributes,
  getCompanyProfileMemberMainAttributes,
  findWhiteFormDetailAttributes,
} = require("../lib/attributes");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const { log } = require("async");

module.exports = {
  // 필터링 유저 체크
  checkUserCompany: async (company_idx, user_idx) => {
    const checkResult = await db.userCompany.findOne({
      where: { company_idx, user_idx },
      attributes: ["authority"],
    });

    if (!checkResult) {
      return false;
    }
    return checkResult;
  },

  changeDate: (date) => {
    date = date.replace(/ /gi, "").split("-");
    const firstDate = new Date(date[0].replace(/\./gi, "-"));
    const secondDate = new Date(date[1].replace(/\./gi, "-"));
    firstDate.setDate(firstDate.getDate());
    secondDate.setDate(secondDate.getDate() + 1);
    return { firstDate, secondDate };
  },

  joinFunction: async (user_data) => {
    try {
      let phoneCheck = await db.user
        .findAll({ where: { user_phone: user_data.user_phone, deleted: null } })
        .then((r) => {
          return makeArray(r);
        });

      if (phoneCheck.length > 0) {
        return {
          success: false,
          message: "이미 존재하는 계정",
        };
      } else {
        user_data.personal_code = Math.random().toString(36).substr(2, 11);
        // 비밀번호 암호화
        const hashResult = await bcrypt.hash(
          user_data.user_password,
          parseInt(process.env.SALT)
        );
        user_data.user_password = hashResult;
        const createUserResult = await db.user.create(user_data);

        return {
          success: true,
          createUserResult,
        };
      }
    } catch (err) {
      console.log(err);
      const Err = err.message;
      return {
        success: false,
        message: Err,
      };
    }
  },

  findWhiteFormDetail: async (formId) => {
    const formDetail = await db.formLink.findOne({
      where: { idx: formId },
      attributes: findWhiteFormDetailAttributes,
    });

    formDetail.dataValues.urlPath = formDetail.form_link;
    // 열람가능 인원 보여주기
    let findAllUsers = await db.userCompany.findAll({
      where: { company_idx: formDetail.company_idx, deleted: null, active: 1 },
      include: [
        {
          model: db.config,
          attributes: ["form_total"],
        },
      ],
    });

    findAllUsers = JSON.parse(JSON.stringify(findAllUsers));

    const member = [];
    findAllUsers.forEach((data) => {
      if (data.config.form_total) {
        member.push({ memberId: data.idx, name: data.searchingName });
      }
    });
    formDetail.dataValues.member = member;

    return { formDetail };
  },
  createRandomCompany: async (huidx) => {
    const randomCompany = await db.company.create({
      company_name: Math.random().toString(36).substr(2, 11),
      company_subdomain: _f.randomNumber6(),
      huidx,
      companyexist: false,
    });
    return randomCompany;
  },
  includeUserToCompany: async (data) => {
    await db.userCompany.create(data);
  },

  createFreePlan: async (company_idx) => {
    await db.plan.create({
      company_idx,
    });
  },

  getFileName: (data) => {
    const file_name = data.split("/");
    return file_name[file_name.length - 1];
  },

  createFileStore: async (data, t) => {
    try {
      // 전화번호로 조회 후 없으면 생성
      const findCustomerFileResult = await db.customerFile.findOne({
        where: {
          customer_phoneNumber: data.customer_phoneNumber,
          company_idx: data.company_idx,
        },
      });

      if (!findCustomerFileResult) {
        await db.customerFile.create(data, {
          transaction: t,
        });
      }
      return { success: true };
    } catch (err) {
      console.log(err);
      await t.rollback();
      return {
        success: false,
        err,
      };
    }
  },
  checkPage: async (limit, page, company_idx) => {
    const intlimit = parseInt(limit);
    const intPage = parseInt(page);

    const start = (intPage - 1) * intlimit;
    return { start, intlimit, intPage };
  },

  addUserId: (customerData, addminus, No) => {
    // userId, fullAddress 추가
    customerData = customerData.map((data) => {
      data.contact_person = {
        idx: data.user.idx,
        user_name: data.user.user_name,
      };
      delete data.user;
      data.No = No;
      addminus == "plus" ? No++ : No--;
      data.customer_phoneNumber = data.customer_phoneNumber.replace(/-/g, ".");
      data.fullAddress = `${data.address} ${data.detail_address}`;
      return data;
    });

    return customerData;
  },
  changeToJSON: (data) => {
    return JSON.parse(JSON.stringify(data));
  },

  getDetailCustomerInfo: async (whereData, next) => {
    let consultResult = await db.customer.findOne({
      where: whereData,
      include: [
        {
          model: db.consulting,
          attributes: showDetailConsultingAttributes,
        },
        {
          model: db.timeLine,
          attributes: showDetailJoinConsultingAttributes,
        },
        {
          model: db.user,
          attributes: ["idx", "user_name"],
        },
      ],
      attributes: showDetailMainConsultingAttributes,
      order: [[db.timeLine, "createdAt", "DESC"]],
    });

    if (!consultResult) {
      next({ message: "유저가 없습니다." });
      return false;
    }
    consultResult = consultResult.toJSON();

    consultResult.consultings.forEach((data) => {
      if (data.floor_plan || data.hope_concept) {
        data.floor_plan = JSON.parse(data.floor_plan);
        data.hope_concept = JSON.parse(data.hope_concept);
      }
      consultResult.consultingTimeLines.push(data);
    });
    // 변경 후 필드 삭제
    delete consultResult.consultings;

    const findSameUser = await db.customer.findAll({
      where: {
        customer_phoneNumber: consultResult.customer_phoneNumber,
        company_idx: whereData.company_idx,
        deleted: null,
      },
      attributes: findSameUserAttributes,
      raw: true,
      nest: true,
    });

    consultResult.sameUser = findSameUser;

    return consultResult;
  },
  makePureText: (replaceData) => {
    const pureText = replaceData.replace(
      /[ \{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\ '\"\\(\=]/gi,
      ""
    );
    return pureText;
  },
  searchFileandFolder: async (req, pureText, isTotalSearch) => {
    const getFolderPath = async (pathData, customerFile_idx, joinData) => {
      const pathArr = pathData.split("/");
      const findTitleResult = await db.folders.findAll({
        where: { uuid: { [Op.in]: pathArr }, customerFile_idx },
        attributes: ["title"],
        raw: true,
        nest: true,
      });

      const path = [];
      findTitleResult.forEach((data) => {
        path.push(data.title);
      });

      pathData = path.join(joinData);

      return pathData;
    };
    const searchUserFoldersFilesPath = async (findFilesResult) => {
      const newPathResult = await Promise.all(
        findFilesResult.map(async (data) => {
          if (!data.path) {
            data.path = data.customerFile.customer_name;
          } else {
            const newFormUrl = await getFolderPath(
              data.path,
              data.customerFile_idx,
              " > "
            );
            data.path = `${data.customerFile.customer_name} > ${newFormUrl}`;
          }
          delete data.customerFile;
          return data;
        })
      );
      return newPathResult;
    };
    // 파일 또는 폴더 찾기
    const findFilesAndFolders = async (
      fileOrFolder,
      attributesData,
      whereData
    ) => {
      const findFoldersResult = await fileOrFolder.findAll({
        where: whereData,
        include: [
          {
            model: db.customerFile,
            attributes: ["customer_name"],
          },
        ],

        attributes: attributesData,
        raw: true,
        nest: true,
      });
      return findFoldersResult;
    };

    const findCustomerResult = await db.customerFile.findAll({
      where: {
        company_idx: req.company_idx,
        [Op.or]: {
          customer_name: {
            [Op.like]: `%${pureText}%`,
          },
          searchingPhoneNumber: {
            [Op.like]: `%${pureText}%`,
          },
        },
      },
      attributes: searchCustomersAttributes,

      raw: true,
      nest: true,
    });

    let findFoldersResult = await findFilesAndFolders(
      db.folders,
      searchFileStoreFoldersAttributes,
      {
        company_idx: req.company_idx,
        searchingTitle: {
          [Op.like]: `%${pureText}%`,
        },
      }
    );

    let findFilesResult = await findFilesAndFolders(
      db.files,
      searchFileStoreFilesAttributes,
      {
        company_idx: req.company_idx,
        isFolder: false,
        searchingTitle: {
          [Op.like]: `%${pureText}%`,
        },
      }
    );

    // path재설정
    if (findFoldersResult.length !== 0) {
      findFoldersResult = await searchUserFoldersFilesPath(findFoldersResult);
    }

    if (findFilesResult.length !== 0) {
      findFilesResult = await searchUserFoldersFilesPath(findFilesResult);
    }

    // 배열로 하나로 묶기
    const totalFindResult = [];

    for (i = 0; i < findCustomerResult.length; i++) {
      findCustomerResult[i].Type = "Customer";
      totalFindResult.push(findCustomerResult[i]);
    }

    for (i = 0; i < findFoldersResult.length; i++) {
      const findUserResult = await db.customerFile.findByPk(
        findFoldersResult[i].customerFile_idx,
        {
          attributes: ["customer_phoneNumber"],
        }
      );
      findFoldersResult[i].customer_phoneNumber =
        findUserResult.customer_phoneNumber;
      findFoldersResult[i].Type = "Folder";
      totalFindResult.push(findFoldersResult[i]);
    }

    for (i = 0; i < findFilesResult.length; i++) {
      const findUserResult = await db.customerFile.findByPk(
        findFilesResult[i].customerFile_idx,
        {
          attributes: ["customer_phoneNumber"],
        }
      );
      findFilesResult[i].customer_phoneNumber =
        findUserResult.customer_phoneNumber;
      findFilesResult[i].Type = "File";
      totalFindResult.push(findFilesResult[i]);
    }

    return totalFindResult;
  },
  searchingByTitle: async (pureText, companyIdx) => {
    const searchResult = await db.formLink.findAll({
      where: {
        searchingTitle: {
          [Op.like]: `%${pureText}%`,
        },
        company_idx: companyIdx,
      },
      attributes: searchFormLinkAttributes,
      order: [["createdAt", "DESC"]],
    });

    return searchResult;
  },
  findMembers: async (whereData, sortData, user) => {
    const result = await db.userCompany.findAll({
      where: whereData,
      include: [
        {
          model: db.user,
          attributes: getCompanyProfileMemberUserAttributes,
        },
        {
          model: db.config,
          attributes: ["idx", "template_name"],
        },
      ],
      attributes: getCompanyProfileMemberMainAttributes,
      order: [sortData],
      raw: true,
      nest: true,
    });
    console.log("result", result);
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
  },
  findMember: async (whereData) => {
    const result = await db.userCompany.findOne({
      where: whereData,
      include: [
        {
          model: db.user,
          attributes: getCompanyProfileMemberUserAttributes,
        },
        {
          model: db.config,
          attributes: ["idx", "template_name"],
        },
      ],
      attributes: getCompanyProfileMemberMainAttributes,
      raw: true,
      nest: true,
    });

    result.template_name = result.config.template_name;
    result.templateId = result.config.idx;
    result.user_name = result.user.user_name;
    result.user_phone = result.user.user_phone;
    result.user_email = result.user.user_email;
    result.personal_code = result.user.personal_code;

    result.user_profile = result.user.user_profile;
    delete result.user;
    delete result.config;

    return result;
  },

  checkTitle: async (findDBdata, whereData, title, req) => {
    // 중복된 form이 있는지 확인
    const checkTitle = await findDBdata.findOne(
      { where: whereData },
      { attributes: ["duplicateCount"] }
    );
    // 중복된 title이 있는 경우
    if (checkTitle) {
      req.title = `${title}_${checkTitle.duplicateCount + 1}`;

      findDBdata.increment({ duplicateCount: 1 }, { where: whereData });
    }

    return req;
  },

  sendCompanyAlarm: async (insertData, findMembers, io) => {
    try {
      const expiry_date = moment().add("14", "day").format("YYYY.MM.DD HH:mm");
      insertData.expiry_date = expiry_date;

      findMembers.forEach(async (data) => {
        insertData.user_idx = data.user_idx;

        const createResult = await db.alarm.create(insertData);

        const alarm = new Alarm(createResult);
        io.to(data.user_idx).emit("addAlarm", alarm.alarmData.dataValues);
      });
    } catch (err) {
      console.log(err);
    }
  },
  findMemberExceptMe: async (company_idx, user_idx) => {
    const findMembers = await db.userCompany.findAll({
      where: { company_idx, active: true, user_idx: { [Op.ne]: user_idx } },
      attributes: ["user_idx"],
      raw: true,
    });
    return findMembers;
  },

  decreasePriceAndHistory: async (
    decreaseData,
    sms_idx,
    type,
    text,
    receiver_phoneNumber
  ) => {
    // 문자 보내기 전 비용 차감
    db.sms.decrement(decreaseData, { where: { idx: sms_idx } });

    price = decreaseData.text_cost.toLocaleString();

    // 알림톡 history 추가
    await db.smsHistory.create({
      receiver_phoneNumber,
      type,
      text,
      price,
      sms_idx,
    });
  },

  isEmptyObj: (obj) => {
    if (Object.keys(obj).length === 0 && obj.constructor === Object) {
      return true;
    }
  },
};
