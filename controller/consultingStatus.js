const {
  checkUserCompany,
  getFileName,
  createFileStore,
  getDetailCustomerInfo,
  check,
} = require('../lib/apiFunctions');
const axios = require('axios');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');

const {
  patchCalculateAttributes,
  findSameUserAttributes,
  showCalculateAttributes,
} = require('../lib/attributes');
const db = require('../model/db');
const { checkDetailCustomerUpdateField } = require('../lib/checkData');
const { down_one_file } = require('../lib/aws/aws');
const { delFile } = require('../lib/aws/fileupload').ufile;
const {
  TeamkakaoPushNewForm,
  customerkakaoPushNewForm,
  customerkakaoPushNewCal,
  checkKakaoPushResult,
} = require('../lib/kakaoPush');
const changeToSearch = (body) => {
  const searchingPhoneNumber = body.customer_phoneNumber.replace(/-/g, '');
  const searchingAddress = `${body.address.replace(
    / /g,
    ''
  )}${body.detail_address.replace(/ /g, '')}`;
  return {
    searchingPhoneNumber,
    searchingAddress,
  };
};

module.exports = {
  addConsultingForm: async (req, res, next) => {
    const t = await db.sequelize.transaction();
    try {
      // url을 string으로 연결
      const { body, files } = req;

      const selectUrl = (fileData) => {
        try {
          return (result = fileData.map((element) => {
            return element.location;
          }));
        } catch (err) {
          return;
        }
      };

      const createConsultingAndIncrement = async (bodyData) => {
        try {
          await db.consulting.create(bodyData, { transaction: t });
          await t.commit();

          db.company.increment(
            { form_link_count: 1, customer_count: 1 },
            { where: { idx: formLinkCompany.company_idx } }
          );
          res.send({ success: 200 });

          // 고객 카카오 푸쉬 보내기
          // await customerkakaoPushNewForm(
          //   bodyData.customer_phoneNumber,
          //   bodyData.company_name,
          //   bodyData.customer_name,
          //   '접수 내용 확인',
          //   bodyData.title
          // );

          // 팀원 카카오 푸쉬 보내기
          // const getMembers = await db.userCompany.findAll({
          //   where: { company_idx: bodyData.company_idx },
          //   include: [
          //     {
          //       model: db.user,
          //       attributes: ['user_phone'],
          //     },
          //   ],
          //   attributes: ['user_idx'],
          // });
          // getMembers.forEach(async (data) => {
          //   await TeamkakaoPushNewForm(
          //     data.user.user_phone,
          //     bodyData.title,
          //     bodyData.customer_name,
          //     '확인하기',
          //     bodyData.customer_phoneNumber
          //   );
          // });
        } catch (err) {
          await t.rollback();
          next(err);
        }
      };

      const formLinkCompany = await db.formLink.findOne({
        where: { form_link: body.form_link },
        include: [
          {
            model: db.company,
            attributes: ['company_name'],
          },
        ],
        attributes: ['company_idx', 'title'],
      });

      const { searchingAddress, searchingPhoneNumber } = changeToSearch(body);

      body.searchingAddress = searchingAddress;
      body.searchingPhoneNumber = searchingPhoneNumber;
      body.company_idx = formLinkCompany.company_idx;
      body.company_name = formLinkCompany.company.company_name;
      body.title = formLinkCompany.title;

      const createCustomerResult = await db.customer.create(body, {
        transaction: t,
      });

      body.customer_phoneNumber = createCustomerResult.customer_phoneNumber;
      body.customer_name = createCustomerResult.customer_name;
      body.customer_idx = createCustomerResult.idx;

      // 파일 보관함 db 생성
      const createFileStoreResult = await createFileStore(body, t);
      if (!createFileStoreResult.success) {
        next(createFileStoreResult.err);
        return;
      }

      // 이미지나 파일이 없을 때  간편 Form
      if (!files.img && !files.concept) {
        body.choice = JSON.parse(body.choice).join(', ');
        createConsultingAndIncrement(body);
        return;
      }
      // 이미지나 파일이 있을 때

      const imgUrlString = selectUrl(files.img);
      const conceptUrlString = selectUrl(files.concept);
      body.floor_plan = JSON.stringify(imgUrlString);
      body.hope_concept = JSON.stringify(conceptUrlString);
      body.expand = JSON.parse(body.expand).join(', ');
      body.carpentry = JSON.parse(body.carpentry).join(', ');
      body.paint = JSON.parse(body.paint).join(', ');
      body.bathroom_option = JSON.parse(body.bathroom_option).join(', ');
      body.floor = JSON.parse(body.floor).join(', ');
      body.tile = JSON.parse(body.tile).join(', ');
      body.electricity_lighting = JSON.parse(body.electricity_lighting).join(
        ', '
      );
      body.kitchen_option = JSON.parse(body.kitchen_option).join(', ');
      body.furniture = JSON.parse(body.furniture).join(', ');
      body.facility = JSON.parse(body.facility).join(', ');
      body.film = JSON.parse(body.film).join(', ');
      body.etc = JSON.parse(body.etc).join(', ');

      await createConsultingAndIncrement(body);

      return;
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },

  setConsultingContactMember: async (req, res, next) => {
    const {
      params: { customer_idx, contract_person },
    } = req;
    try {
      await db.customer.update(
        { contact_person: contract_person },
        { where: { idx: customer_idx } }
      );

      const consultResult = await getDetailCustomerInfo(
        { idx: customer_idx, company_idx: req.company_idx },
        next
      );
      if (!consultResult) {
        return;
      }

      return res.send({ success: 200, consultResult });
    } catch (err) {
      next(err);
    }
  },

  delConsulting: async (req, res, next) => {
    const {
      params: { customer_idx },

      company_idx,
    } = req;
    try {
      await db.customer.destroy({
        where: { idx: customer_idx, company_idx },
      });
      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },
  addCompanyCustomer: async (req, res, next) => {
    const { body, user_idx, company_idx } = req;
    if (body.contact_person == '') {
      body.contact_person = null;
    }

    const t = await db.sequelize.transaction();
    try {
      // 검색용으로 변경
      const { searchingPhoneNumber, searchingAddress } = changeToSearch(body);

      body.user_idx = user_idx;
      body.company_idx = company_idx;
      body.searchingAddress = searchingAddress;
      body.searchingPhoneNumber = searchingPhoneNumber;
      const createCustomerResult = await db.customer.create(body, {
        transaction: t,
      });
      body.customer_phoneNumber = createCustomerResult.customer_phoneNumber;
      body.customer_name = createCustomerResult.customer_name;
      const { success, err } = await createFileStore(body, t);
      if (!success) {
        next(err);
      }
      db.company.increment({ customer_count: 1 }, { where: { idx: user_idx } });
      await t.commit();
      await db.customer.findByPk(createCustomerResult.idx, {
        attributes: [
          'idx',
          'address',
          'customer_name',
          'customer_phoneNumber',
          'detail_address',
        ],
      });

      return res.send({ success: 200 });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  patchConsultingStatus: async (req, res, next) => {
    const {
      body: {
        room_size_kind,
        room_size,
        contract_possibility,

        detail_address,
        address,
        customer_phoneNumber,
        customer_name,
        memo,
        status,
      },
      params: { customer_idx },
    } = req;

    const consultResult = await checkDetailCustomerUpdateField(
      customer_idx,
      room_size_kind,
      room_size,
      contract_possibility,

      detail_address,
      address,
      customer_phoneNumber,
      customer_name,
      memo,
      status,
      next
    );

    return res.send({ success: 200, consultResult });
  },

  addCalculate: async (req, res, next) => {
    console.log('이것은 바디', req.body);
    console.log('이것은 파람', req.params);
    const {
      params: { customer_idx },
      company_idx,
      body,
      file,
    } = req;
    body.customer_idx = customer_idx;
    const addCalculateLogic = async () => {
      // 몇차 인지 체크
      const findCalculate = await db.calculate.findOne({
        where: { customer_idx },
        order: [['createdAt', 'DESC']],
        attributes: ['calculateNumber'],
      });
      let calculateCreateResult;
      if (!findCalculate) {
        calculateCreateResult = await db.calculate.create(body);
      } else {
        // 견적서 차수 +1씩 올리기
        let splitCalculateResult = findCalculate.calculateNumber.split('차');
        splitCalculateResult[0] = parseInt(splitCalculateResult[0]) + 1;
        splitCalculateResult = splitCalculateResult.join('차');
        body.calculateNumber = splitCalculateResult;
        calculateCreateResult = await db.calculate.create(body);
      }

      const findResult = {
        idx: calculateCreateResult.idx,
        title: calculateCreateResult.title,
        file_url: calculateCreateResult.file_url,
        file_name: calculateCreateResult.file_name,
        predicted_price: calculateCreateResult.predicted_price,
        sharedDate: calculateCreateResult.sharedDate,
        calculateNumber: calculateCreateResult.calculateNumber,
        isMain: calculateCreateResult.isMain,
        status: calculateCreateResult.status,
        createdAt: new Date(calculateCreateResult.createdAt)
          .toISOString()
          .split('T')[0]
          .replace(/-/g, '.'),
      };
      return findResult;
    };

    // 파일이 없을때
    if (!file) {
      const findResult = await addCalculateLogic();
      res.send({ success: 200, findResult });
      return;
    }
    try {
      const file_name = getFileName(file.key);
      body.file_name = file_name;
      body.file_url = file.location;
      const findResult = await addCalculateLogic();
      return res.send({ success: 200, findResult });
    } catch (err) {
      next(err);
    }
  },
  delCalculate: async (req, res, next) => {
    const { customer_idx, calculate_idx } = req.params;
    // 견적서 내용 찾기
    const findCalculateResult = await db.calculate.findByPk(calculate_idx, {
      attributes: ['file_name'],
    });
    // s3에서 삭제
    delFile(
      findCalculateResult.file_name,
      `ordercheck/calculate/${customer_idx}`
    );
    await db.calculate.destroy({
      where: { customer_idx, idx: calculate_idx },
    });

    return res.send({ success: 200 });
  },
  patchCalculate: async (req, res, next) => {
    const {
      body,
      file,
      params: { calculate_idx },
    } = req;

    const addCalculateLogic = async (bodyData) => {
      await db.calculate.update(bodyData, {
        where: { idx: calculate_idx },
      });
      const findCalculate = await db.calculate.findByPk(calculate_idx, {
        attributes: patchCalculateAttributes,
      });
      return findCalculate;
    };

    // 파일이 있을때
    if (file) {
      try {
        const file_name = getFileName(file.key);

        const findCalculateResult = await db.calculate.findByPk(calculate_idx, {
          attributes: ['file_name'],
        });
        // s3에서 삭제
        delFile(
          findCalculateResult.file_name,
          `ordercheck/calculate/${body.customer_idx}`
        );
        body.file_name = file_name;
        body.file_url = file.location;

        const findResult = await addCalculateLogic(body);

        return res.send({ success: 200, findResult });
      } catch (err) {
        next(err);
      }
    }

    // file_name이 없을 때 (파일 삭제 되었을 때)
    if (!body.file_name) {
      const findFilename = await db.calculate.findByPk(
        req.params.calculate_idx,
        {
          attributes: ['file_name'],
        }
      );
      // s3에서 삭제
      delFile(
        findFilename.file_name,
        `ordercheck/calculate/${body.customer_idx}`
      );

      body.file_name = null;
      body.file_url = null;
      const findResult = await addCalculateLogic(body);

      return res.send({ success: 200, findResult });
    }
    // 파일이 변함 없을 때
    const findResult = await addCalculateLogic();
    return res.send({ success: 200, findResult });
  },

  shareCalculate: async (req, res, next) => {
    const {
      params: { customer_idx, calculate_idx },
      body: { calculateReload },
    } = req;
    const customerFindResult = await db.customer.findByPk(customer_idx, {
      attributes: ['customer_phoneNumber', 'customer_name'],
    });

    const companyFindResult = await db.company.findByPk(req.company_idx, {
      attributes: ['company_name'],
    });

    const calculateFindResult = await db.calculate.findByPk(calculate_idx, {
      attributes: ['file_url', 'calculateNumber'],
    });
    // 견적서 다시보기 동의여부
    // if (calculateReload !== '') {
    //   await db.config.update(
    //     { calculateReload },
    //     { where: { user_idx: req.user_idx, company_idx: req.company_idx } }
    //   );
    // }

    const fileUrl = !calculateFindResult.file_url
      ? `orderchecktest.s3-website.ap-northeast-2.amazonaws.com/signin`
      : calculateFindResult.file_url.split('//')[1];

    const sharedDate = moment().format('YYYY.MM.DD');
    await db.calculate.update(
      { sharedDate },
      { where: { customer_idx, idx: calculate_idx } }
    );
    const findResult = await db.calculate.findByPk(calculate_idx, {
      attributes: showCalculateAttributes,
    });
    res.send({ success: 200, findResult });

    // 알림톡 보내기
    const messageId = await customerkakaoPushNewCal(
      customerFindResult.customer_phoneNumber,
      companyFindResult.company_name,
      customerFindResult.customer_name,
      calculateFindResult.calculateNumber,
      '견적서 확인',
      fileUrl
    );
    // 알림톡 보낸 결과 조회
    if (messageId) {
      const checkKakaoPromise = () => {
        return new Promise(function (resolve, reject) {
          setTimeout(async () => {
            const sendResult = await checkKakaoPushResult(messageId);
            resolve(sendResult);
          }, 1000);
        });
      };
      const sendResult = await checkKakaoPromise();
      //문자 다시 보내기

      // 메시지 전송못할때 3018 (차단, 카톡 없을때)
      // 전화번호 오류 3008
      // 정상발송 0000
      if (sendResult.sendResult === '3018') {
        const message = `
[${companyFindResult.company_name}]
${customerFindResult.customer_name} 고객님, 
${calculateFindResult.calculateNumber}차 견적서가 발송되었습니다.
감사합니다.
  
견적서 확인:
${calculateFindResult.file_url}
  `;
        user_phone = customerFindResult.customer_phoneNumber;

        await axios({
          url: '/api/send/sms',
          method: 'post', // POST method
          headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
          data: { user_phone, message, type: 'LMS' },
        });
      }
    }
    return;
  },
  setMainCalculate: async (req, res, next) => {
    const updateCalculateStatus = async (trueOrfalse, whereData) => {
      await db.calculate.update(
        {
          isMain: trueOrfalse,
        },
        { where: { idx: whereData } }
      );
    };
    try {
      const { customer_idx, calculate_idx } = req.params;
      // 이미 대표상태인 견적서 찾기
      const findCalculateResult = await db.calculate.findOne({
        where: { customer_idx, isMain: true },
      });

      // 이미 대표인 견적서가 없을 때 타겟 견적서 대표로 등록
      if (!findCalculateResult) {
        await updateCalculateStatus(true, calculate_idx);
        return res.send({ success: 200 });
      }

      // 이미 대표인 견적서가 있을 때는 isMain false로 바꾼 후 타겟 견적서 대표로 등록
      await updateCalculateStatus(false, findCalculateResult.idx);
      await updateCalculateStatus(true, calculate_idx);
      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },
  downCalculate: async (req, res, next) => {
    const params = {
      Bucket: `ordercheck`,
      Key: `fileStore/${req.body.customerFile_idx}/${req.body.path}/${req.body.title}`,
    };

    down_one_file(params, (err, url) => {
      if (err) {
        next(err);
      } else {
        res.attachment(req.body.title);
        return res.send(url.Body);
      }
    });
  },
  doIntegratedUser: async (req, res, next) => {
    const { body } = req;

    try {
      // 대표 상담폼과 병합
      await body.target_idx.forEach(async (data) => {
        try {
          await db.consulting.update(
            {
              customer_idx: body.main_idx,
            },
            {
              where: { customer_idx: data },
            }
          );
          await db.timeLine.update(
            {
              customer_idx: body.main_idx,
            },
            {
              where: { customer_idx: data },
            }
          );
          await db.calculate.update(
            {
              customer_idx: body.main_idx,
            },
            {
              where: { customer_idx: data },
            }
          );
          await db.customer.destroy({
            where: { idx: data },
          });
        } catch (err) {
          console.log(err);
        }
      });

      const findCustomerResult = await db.customer.findByPk(body.main_idx, {
        attributes: ['customer_phoneNumber', 'customer_name'],
      });

      const findSameUser = await db.customer.findAll({
        where: {
          customer_phoneNumber: findCustomerResult.customer_phoneNumber,
        },
        attributes: findSameUserAttributes,
        raw: true,
        nest: true,
      });

      // 통합한 후 파일 보관함 유저 이름 main으로 변경
      await db.customerFile.update(
        {
          customer_name: findCustomerResult.customer_name,
        },
        {
          where: {
            customer_phoneNumber: findCustomerResult.customer_phoneNumber,
          },
        }
      );

      return res.send({ success: 200, findSameUser });
    } catch (err) {
      next(err);
    }
  },
};
