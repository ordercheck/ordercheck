const db = require('../model/db');
const { makeArray } = require('./functions');
const _f = require('./functions');

let { masterConfig } = require('../lib/standardTemplate');
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
  alarmAttributes,
} = require('../lib/attributes');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = {
  // 필터링 유저 체크
  checkUserCompany: async (company_idx, user_idx) => {
    const checkResult = await db.userCompany.findOne({
      where: { company_idx, user_idx },
      attributes: ['authority'],
    });

    if (!checkResult) {
      return false;
    }
    return checkResult;
  },

  changeDate: (date) => {
    date = date.replace(/ /gi, '').split('-');
    const firstDate = new Date(date[0].replace(/\./gi, '-'));
    const secondDate = new Date(date[1].replace(/\./gi, '-'));
    firstDate.setDate(firstDate.getDate());
    secondDate.setDate(secondDate.getDate() + 1);
    return { firstDate, secondDate };
  },

  joinFunction: async (user_data) => {
    try {
      let phoneCheck = await db.user
        .findAll({ where: { user_phone: user_data.user_phone } })
        .then((r) => {
          return makeArray(r);
        });

      if (phoneCheck.length > 0) {
        return {
          success: false,
          message: '이미 존재하는 계정',
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
  errorFunction: async (err) => {
    console.log(err);

    const Err = err.message;
    await db.err.create({ err: Err });
  },
  findWhiteFormDetail: async (formId) => {
    const formDetail = await db.formLink.findOne({
      where: { idx: formId },
      attributes: [
        ['idx', 'formId'],
        'title',
        'thumbNail',
        'form_link',
        'tempType',
        'expression',
        'whiteLabelChecked',
      ],
    });

    formDetail.dataValues.urlPath = `${formDetail.form_link}/${formDetail.expression}`;

    // 임의의 값
    formDetail.dataValues.member = ['김기태', 'aaa', 'bbb'];
    return { formDetail };
  },
  createRandomCompany: async (huidx) => {
    const randomCompany = await db.company.create({
      company_name: Math.random().toString(36).substr(2, 11),
      company_subdomain: _f.randomNumber6(),
      huidx,
    });
    return randomCompany;
  },
  includeUserToCompany: async (data) => {
    await db.userCompany.create(data);
  },
  giveMasterAuth: async (company_idx) => {
    masterConfig.company_idx = company_idx;
    const createTemplateResult = await db.config.create(masterConfig);
    return createTemplateResult;
  },
  createFreePlan: async (company_idx) => {
    await db.plan.create({
      company_idx,
    });
  },

  getFileName: (data) => {
    const file_name = data.split('/');
    return file_name[file_name.length - 1];
  },

  createFileStore: async (data, t) => {
    console.log(data);
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
      addminus == 'plus' ? No++ : No--;
      data.customer_phoneNumber = data.customer_phoneNumber.replace(/-/g, '.');
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
          include: [
            {
              model: db.formLink,
              as: 'tempType',
              attributes: ['tempType'],
            },
          ],
        },
        {
          model: db.timeLine,
          attributes: showDetailJoinConsultingAttributes,
        },
        {
          model: db.user,
          attributes: ['idx', 'user_name'],
        },
      ],
      attributes: showDetailMainConsultingAttributes,
      order: [[db.timeLine, 'createdAt', 'DESC']],
    });

    if (!consultResult) {
      next({ message: '유저가 없습니다.' });
      return false;
    }
    consultResult = consultResult.toJSON();

    consultResult.consultings.forEach((data) => {
      data.tempType = data.tempType.tempType;
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
      ''
    );
    return pureText;
  },
  searchFileandFolder: async (req, pureText) => {
    const searchUserFoldersFilesPath = async (findFilesResult) => {
      const newPathResult = await Promise.all(
        findFilesResult.map(async (data) => {
          if (!data.path) {
            data.path = data.customerFile.customer_name;
          } else {
            const newFormUrl = await getFolderPath(
              data.path,
              data.customerFile_idx,
              ' > '
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
            attributes: ['customer_name'],
          },
        ],
        attributes: attributesData,
        raw: true,
        nest: true,
      });
      return findFoldersResult;
    };
    // 그냥 text로 변환

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
    findCustomerResult.forEach((data) => {
      data.Type = 'Customer';
      totalFindResult.push(data);
    });

    findFoldersResult.forEach((data) => {
      data.Type = 'Folder';
      totalFindResult.push(data);
    });
    findFilesResult.forEach((data) => {
      data.Type = 'File';
      totalFindResult.push(data);
    });
    return totalFindResult;
  },
  searchingByTitle: async (pureText) => {
    const searchResult = await db.formLink.findAll({
      where: {
        searchingTitle: {
          [Op.like]: `%${pureText}%`,
        },
      },
      attributes: searchFormLinkAttributes,
      order: [['createdAt', 'DESC']],
    });

    return searchResult;
  },
  findMembers: async (whereData, company_idxData) => {
    const result = await db.userCompany.findAll({
      where: whereData,
      include: [
        {
          model: db.user,
          attributes: getCompanyProfileMemberUserAttributes,
        },
        {
          model: db.config,
          attributes: ['template_name'],
        },
      ],
      attributes: getCompanyProfileMemberMainAttributes,
      raw: true,
      nest: true,
    });

    let No = 0;
    const findResult = result.map((data) => {
      data.No = No + 1;
      data.template_name = data.config.template_name;
      data.user_name = data.user.user_name;
      data.user_phone = data.user.user_phone;
      data.user_email = data.user.user_email;
      data.personal_code = data.user.personal_code;

      data.user_profile = data.user.user_profile;
      delete data.user;
      delete data.config;
      return data;
    });

    return findResult;
  },
  checkTitle: async (findDBdata, whereData, title, req) => {
    // 중복된 form이 있는지 확인
    const checkTitle = await findDBdata.findOne(
      { where: whereData },
      { attributes: ['duplicateCount'] }
    );
    // 중복된 title이 있는 경우
    if (checkTitle) {
      req.title = `${title}_${checkTitle.duplicateCount + 1}`;

      findDBdata.increment({ duplicateCount: 1 }, { where: whereData });
    }

    return req;
  },

  sendCompanyAlarm: async (
    message,
    companyIdx,
    findMembers,
    alarm_type,
    io
  ) => {
    try {
      findMembers.forEach(async (data) => {
        await db.alarm.create({
          user_idx: data.user_idx,
          message,
          company_idx: companyIdx,
          alarm_type,
        });
      });

      const Alarm = await db.alarm.findAll({
        where: { company_idx: companyIdx },
        attributes: alarmAttributes,
        raw: true,
      });
      Alarm.forEach((data) => {
        console.log(data);
        console.log(Alarm);
        io.to(data.user_idx).emit('sendAlarm', Alarm);
      });
    } catch (err) {
      console.log(err);
    }
  },
};
