const {
  checkUserCompany,
  getFileName,
  createFileStore,
  getDetailCustomerInfo,
  sendCompanyAlarm,
  findMemberExceptMe,
  decreasePriceAndHistory,
} = require("../lib/apiFunctions");
const { Form } = require("../lib/classes/FormClass");
const { Customer } = require("../lib/classes/CustomerClass");
const { Alarm } = require("../lib/classes/AlarmClass");
const axios = require("axios");
const _f = require("../lib/functions");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
const {
  patchCalculateAttributes,
  findSameUserAttributes,
  showCalculateAttributes,
} = require("../lib/attributes");
const db = require("../model/db");
const { checkDetailCustomerUpdateField } = require("../lib/checkData");
const { s3_get } = require("../lib/aws/aws");
const { delFile } = require("../lib/aws/fileupload").ufile;
const {
  TeamkakaoPushNewForm,
  customerkakaoPushNewForm,
  customerkakaoPushNewCal,
  checkKakaoPushResult,
} = require("../lib/kakaoPush");
const { formLink } = require("../model/db");
const {
  targetCustomerAttributes,
  mainCustomerAttributes,
} = require("../lib/attributes");
const changeToSearch = (body) => {
  const searchingPhoneNumber = body.customer_phoneNumber.replace(/\./g, "");
  const searchingAddress = `${body.address.replace(
    / /g,
    ""
  )}${body.detail_address.replace(/ /g, "")}`;
  return {
    searchingPhoneNumber,
    searchingAddress,
  };
};

module.exports = {
  addConsultingForm: async (req, res, next) => {
    const t = await db.sequelize.transaction();
    const selectUrl = (fileData) => {
      try {
        return (result = fileData.map((element) => {
          return element.location;
        }));
      } catch (err) {
        return;
      }
    };
    try {
      // url을 string으로 연결
      const { body, files } = req;
      const createConsultingAndIncrement = async (bodyData) => {
        try {
          await db.consulting.create(bodyData, {
            transaction: t,
          });

          await t.commit();

          db.company.increment(
            { form_link_count: 1 },
            { where: { idx: formLinkCompany.company_idx } }
          );

          res.send({ success: 200 });

          // 총 문자 비용 계산
          // const findCompany = await db.company.findByPk(bodyData.company_idx, {
          //   attributes: ["huidx"],
          // });
          // const findSms = await db.sms.findOne({
          //   where: { user_idx: findCompany.huidx },
          // });
          // let text_cost = findSms.text_cost;
          // if (text_cost < 10) {
          //   return;
          // }

          const customer_phoneNumber = bodyData.customer_phoneNumber.replace(
            /\./g,
            ""
          );

          const { kakaoPushResult, message } = await customerkakaoPushNewForm(
            customer_phoneNumber,
            bodyData.company_name,
            bodyData.customer_name,
            bodyData.title
          );

          if (kakaoPushResult) {
            const checkKakaoPromise = async () => {
              return new Promise(function (resolve, reject) {
                setTimeout(async () => {
                  const sendResult = await checkKakaoPushResult(
                    kakaoPushResult
                  );
                  resolve(sendResult);
                }, 1000);
              });
            };
            const sendResult = await checkKakaoPromise();
            //문자 다시 보내기

            // 메시지 전송못할때 3018 (차단, 카톡 없을때)
            // 전화번호 오류 3008
            // 정상발송 0000
            if (sendResult.sendResult === "3018") {
              // 문자 보내기 전 문자 비용 체크

              // if (text_cost < 11) {
              //   return;
              // }

              // text_cost -= 11;
              // LMS 비용 차감 후 저장

              await _f.smsPush(customer_phoneNumber, message, "SMS");

              // decreasePriceAndHistory(
              //   { text_cost: 11 },
              //   findSms.idx,
              //   "SMS",
              //   message,
              //   bodyData.customer_phoneNumber
              // );
            } else {
              console.log("알람톡 보내짐");
              // 알림톡 비용 차감 후 저장
              // decreasePriceAndHistory(
              //   { text_cost: 10 },
              //   findSms.idx,
              //   "알림톡",
              //   message,
              //   bodyData.customer_phoneNumber
              // );
            }
          }

          // if (text_cost < 10) {
          //   return;
          // }
          // 팀원 카카오 푸쉬 보내기
          const getMembers = await db.userCompany.findAll({
            where: {
              company_idx: bodyData.company_idx,
              active: true,
              standBy: false,
            },
            include: [
              {
                attributes: ["user_phone"],
                model: db.user,
              },
            ],
            attributes: ["user_idx"],
          });

          getMembers.forEach(async (data) => {
            // if (text_cost < 10) {
            //   return;
            // } else {
            const user_phone = data.user.user_phone.replace(/\./g, "");

            const { kakaoPushResult, message } = await TeamkakaoPushNewForm(
              user_phone,
              bodyData.title,
              bodyData.customer_name,
              "확인하기",
              bodyData.customer_phoneNumber
            );

            if (kakaoPushResult) {
              const checkKakaoPromise = async () => {
                return new Promise(function (resolve, reject) {
                  setTimeout(async () => {
                    const sendResult = await checkKakaoPushResult(
                      kakaoPushResult
                    );
                    resolve(sendResult);
                  }, 1000);
                });
              };
              const sendResult = await checkKakaoPromise();

              //문자 다시 보내기

              // 메시지 전송못할때 3018 (차단, 카톡 없을때)
              // 전화번호 오류 3008
              // 정상발송 0000
              if (sendResult.sendResult === "3018") {
                // 문자 보내기 전 문자 비용 체크

                // if (text_cost < 11) {
                //   return;
                // }

                await _f.smsPush(user_phone, message, "LMS");

                // decreasePriceAndHistory(
                //   { text_cost: 11 },
                //   findSms.idx,
                //   "LMS",
                //   message,
                //   bodyData.customer_phoneNumber
                // );
              } else {
                // 알림톡 비용 차감 후 저장
                // decreasePriceAndHistory(
                //   { text_cost: 10 },
                //   findSms.idx,
                //   "알림톡",
                //   message,
                //   bodyData.customer_phoneNumber
                // );
              }
            }
            // }
          });
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
            attributes: ["company_name"],
          },
        ],
        attributes: ["company_idx", "title", "tempType"],
      });

      body.company_name = formLinkCompany.company.company_name;
      body.title = formLinkCompany.title;
      body.company_idx = formLinkCompany.company_idx;
      body.tempType = formLinkCompany.tempType;

      const bodyClass = new Form(body);

      const { searchingAddress, searchingPhoneNumber } = changeToSearch(
        bodyClass.bodyData
      );

      const customerData = bodyClass.createCustomerData(
        searchingAddress,
        searchingPhoneNumber
      );

      const createCustomerResult = await db.customer.create(customerData, {
        transaction: t,
      });

      const fileStoreData = bodyClass.fileStoreData(
        createCustomerResult.customer_phoneNumber,
        createCustomerResult.customer_name,
        createCustomerResult.idx,
        searchingPhoneNumber
      );

      // 파일 보관함 db 생성
      const createFileStoreResult = await createFileStore(fileStoreData, t);
      if (!createFileStoreResult.success) {
        next(createFileStoreResult.err);
        return;
      }

      // 이미지나 파일이 없을 때  간편 Form
      if (bodyClass.bodyData.tempType == 1) {
        bodyClass.bodyData.choice = bodyClass.bodyData.choice.join(", ");
        createConsultingAndIncrement(bodyClass.bodyData);
        return;
      }

      const imgUrlString = files.floor_plan
        ? selectUrl(files.floor_plan)
        : null;

      const conceptUrlString = files.hope_concept
        ? selectUrl(files.hope_concept)
        : null;

      const formBodyData = files.hope_concept
        ? bodyClass.createNewUrl(imgUrlString, conceptUrlString)
        : bodyClass.bodyData;

      await createConsultingAndIncrement(formBodyData);
      return;
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },

  setConsultingContactMember: async (req, res, next) => {
    const {
      params: { customer_idx, contract_person },
      company_idx,
      user_idx,
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

      res.send({ success: 200, consultResult });

      // 팀원에게 알림 보내기
      const check = await db.user.findByPk(user_idx, {
        attributes: ["user_name"],
      });
      const io = req.app.get("io");

      const alarm = new Alarm({});
      const message = alarm.setContactAlarm(
        check.user_name,
        consultResult.customer_name
      );
      const insertData = {
        message,
        user_idx: contract_person,
        company_idx,
        alarm_type: 11,
        customer_idx: consultResult.idx,
      };

      sendMember = [contract_person];
      alarm.sendMultiAlarm(insertData, sendMember, io);

      return;
    } catch (err) {
      next(err);
    }
  },

  delConsulting: async (req, res, next) => {
    const {
      params: { customer_idx },
      company_idx,
      user_idx,
    } = req;
    try {
      // 고객 전화번호 찾기
      const findCustomerResult = await db.customer.findByPk(
        customer_idx,

        {
          attributes: [
            "customer_phoneNumber",
            "customer_name",
            "contact_person",
          ],
        }
      );
      const deletedTime = moment();
      // 고객 지우기
      await db.customer.update(
        { deleted: deletedTime },
        {
          where: { idx: customer_idx },
        }
      );

      // 전화번호로 찾기
      const findResultCustomers = await db.customer.count({
        where: {
          customer_phoneNumber: findCustomerResult.customer_phoneNumber,
          company_idx,
          deleted: null,
        },
      });

      // 같은 전화번호가 없을 경우, fileStore도 삭제
      if (findResultCustomers == 0) {
        await db.customerFile.destroy({
          where: {
            customer_phoneNumber: findCustomerResult.customer_phoneNumber,
          },
        });
      }

      res.send({ success: 200 });

      const alarm = new Alarm({});

      const findUser = await db.user.findByPk(user_idx, {
        attributes: ["user_name"],
      });

      const message = alarm.delCustomerAlarm(
        findUser.user_name,
        findCustomerResult.customer_name
      );

      const data = {
        message,
        alarm_type: 13,
      };

      const findMembers = [findCustomerResult.contact_person];

      const io = req.app.get("io");

      alarm.sendMultiAlarm(data, findMembers, io);
    } catch (err) {
      next(err);
    }
  },
  addCompanyCustomer: async (req, res, next) => {
    const { body, user_idx, company_idx } = req;
    if (body.contact_person == "") {
      body.contact_person = null;
    }

    const t = await db.sequelize.transaction();
    try {
      // 검색용으로 변경
      const { searchingPhoneNumber, searchingAddress } = changeToSearch(body);

      body.user_idx = user_idx;
      body.company_idx = company_idx;
      const classBody = new Customer(body);
      const customerData = classBody.createCustomerData(
        searchingAddress,
        searchingPhoneNumber
      );

      const createCustomerResult = await db.customer.create(customerData, {
        transaction: t,
      });

      const consultingData = {
        ...customerData,
        tempType: 3,
        customer_idx: createCustomerResult.idx,
        company_idx,
      };

      delete consultingData.idx;

      await db.consulting.create(consultingData, {
        transaction: t,
      });

      const fileStoreData = classBody.fileStoreData(
        createCustomerResult.customer_phoneNumber,
        createCustomerResult.customer_name,
        createCustomerResult.customer_idx,
        customerData.searchingPhoneNumber
      );

      const { success, err } = await createFileStore(fileStoreData, t);
      if (!success) {
        next(err);
      }
      db.company.increment({ customer_count: 1 }, { where: { idx: user_idx } });
      await t.commit();

      res.send({ success: 200 });

      // 소유주랑 담당자에게 알람 보내기
      const checkCompany = await db.company.findByPk(company_idx, {
        attributes: ["huidx"],
      });

      const checkAddUser = await db.user.findByPk(user_idx, {
        attributes: ["user_name"],
      });

      const alarm = new Alarm({});
      const message = alarm.addCustomer(
        checkAddUser.user_name,
        createCustomerResult.customer_name
      );
      const insertData = {
        message,
        company_idx,
        alarm_type: 14,
        customer_idx: createCustomerResult.idx,
      };

      let findMembers = [];
      // contact_person 체크
      if (createCustomerResult.contact_person) {
        findMembers.push(createCustomerResult.contact_person);
      }
      findMembers.push(checkCompany.huidx);

      findMembers = [...new Set(findMembers)];

      const io = req.app.get("io");

      await alarm.sendMultiAlarm(insertData, findMembers, io);

      return;
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
      company_idx,
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
      company_idx,
      status,
      next
    );
    if (!consultResult) {
      return;
    }
    res.send({ success: 200, consultResult });

    if (customer_phoneNumber) {
      // 전화번호 바꿨을 때 파일보관함에 바꾼 전화번호가 있으면 그대로
      const checkFileStore = await db.customerFile.findOne({
        where: { customer_phoneNumber, company_idx },
        attributes: ["idx"],
      });

      if (!checkFileStore) {
        const searchingPhoneNumber = customer_phoneNumber.replace(/\./g, "");

        const findCustomer = await db.customer.findOne({
          where: { customer_phoneNumber, company_idx },
          attributes: ["customer_name"],
        });
        await db.customerFile.create({
          customer_phoneNumber,
          searchingPhoneNumber,
          customer_name: findCustomer.customer_name,
          company_idx,
        });
        return;
      }
    }
    return;
  },

  addCalculate: async (req, res, next) => {
    const {
      params: { customer_idx },
      company_idx,
      body,
      file,
    } = req;

    body.customer_idx = customer_idx;
    body.company_idx = company_idx;
    const addCalculateLogic = async () => {
      // 몇차 인지 체크
      const findCalculate = await db.calculate.findOne({
        where: { customer_idx },
        order: [["createdAt", "DESC"]],
        attributes: ["calculateNumber"],
      });
      let calculateCreateResult;
      if (!findCalculate) {
        calculateCreateResult = await db.calculate.create(body);
      } else {
        // 견적서 차수 +1씩 올리기
        let splitCalculateResult = findCalculate.calculateNumber.split("차");
        splitCalculateResult[0] = parseInt(splitCalculateResult[0]) + 1;
        splitCalculateResult = splitCalculateResult.join("차");
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
          .split("T")[0]
          .replace(/-/g, "."),
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
      body.file_name = file.originalname;
      body.file_url = file.location;
      const findResult = await addCalculateLogic();
      return res.send({ success: 200, findResult });
    } catch (err) {
      next(err);
    }
  },
  delCalculate: async (req, res) => {
    const { customer_idx, calculate_idx } = req.params;

    // 견적서 내용 찾기
    const findCalculateResult = await db.calculate.findByPk(calculate_idx, {
      attributes: ["file_name"],
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
        // s3에서 삭제
        delFile(file.originalname, `ordercheck/calculate/${body.customer_idx}`);
        body.file_name = file.originalname;
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
          attributes: ["file_name"],
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
    const findResult = await addCalculateLogic(body);
    return res.send({ success: 200, findResult });
  },

  shareCalculate: async (req, res, next) => {
    const {
      params: { customer_idx, calculate_idx },
      body: { calculateReload },
      huidx,
      text_cost,
      repay,
      sms_idx,
      huidxToken,
    } = req;
    const alarm = new Alarm({});
    const io = req.app.get("io");
    // 알림톡 보내기 전 알림톡 비용 체크
    if (text_cost < 10) {
      res.send({ success: 400, message: "알림톡 비용 부족" });

      const message = alarm.failedSendAlimTalkAlarm();
      const insertData = {
        message,
        alarm_type: 35,
      };

      const sendMember = [huidx];

      alarm.sendMultiAlarm(insertData, sendMember, io);
      return;
    }

    const customerFindResult = await db.customer.findByPk(customer_idx, {
      attributes: ["customer_phoneNumber", "customer_name", "idx"],
    });

    const companyFindResult = await db.company.findByPk(req.company_idx, {
      attributes: ["company_name"],
    });

    const calculateFindResult = await db.calculate.findByPk(calculate_idx, {
      attributes: ["file_url", "calculateNumber"],
    });

    const [calculateNumber] = calculateFindResult.calculateNumber.split("차");

    const fileUrl = !calculateFindResult.file_url
      ? `orderchecktest.s3-website.ap-northeast-2.amazonaws.com/signin`
      : calculateFindResult.file_url.split("//")[1];

    const sharedDate = moment().format("YYYY.MM.DD");

    const customer_phoneNumber =
      customerFindResult.customer_phoneNumber.replace(/\./g, "");
    const { kakaoPushResult, message } = await customerkakaoPushNewCal(
      customer_phoneNumber,
      companyFindResult.company_name,
      customerFindResult.customer_name,
      calculateNumber,
      "견적서 확인",
      fileUrl
    );

    // 알림톡 보낸 결과 조회
    if (kakaoPushResult) {
      const checkKakaoPromise = () => {
        return new Promise(function (resolve, reject) {
          setTimeout(async () => {
            const sendResult = await checkKakaoPushResult(kakaoPushResult);
            resolve(sendResult);
          }, 1000);
        });
      };
      const sendResult = await checkKakaoPromise();
      //문자 다시 보내기
      console.log(sendResult.sendResult);
      // 메시지 전송못할때 3018 (차단, 카톡 없을때)
      // 전화번호 오류 3008
      // 정상발송 0000
      if (sendResult.sendResult === "3018") {
        // 문자 보내기 전 문자 비용 체크

        if (text_cost - 10 < 37) {
          return res.send({ success: 400, message: "LMS 비용 부족" });
        }

        // LMS 비용 차감 후 저장
        decreasePriceAndHistory(
          { text_cost: 37 },
          sms_idx,
          "LMS",
          message,
          customerFindResult.customer_phoneNumber
        );

        user_phone = customerFindResult.customer_phoneNumber.replace(
          /\./g,
          "-"
        );
        await axios({
          url: "/api/send/sms",
          method: "post", // POST method
          headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
          data: { user_phone, message, type: "LMS" },
        });
      } else {
        // 알림톡 비용 차감 후 저장
        decreasePriceAndHistory(
          { text_cost: 10 },
          sms_idx,
          "알림톡",
          message,
          customerFindResult.customer_phoneNumber
        );
      }
    }

    // 문자 자동 충전
    if (repay) {
      const autoSms = await db.sms.findByPk(sms_idx, {
        attributes: ["text_cost", "auto_min", "auto_price"],
      });

      if (autoSms.text_cost < autoSms.auto_min) {
        await axios({
          url: "/api/config/company/sms/pay",
          method: "post",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${huidxToken} `,
          },
          data: { text_cost: autoSms.auto_price },
        });
      }
    }

    // 견적서 다시보기 동의여부
    if (calculateReload !== "") {
      await db.userConfig.update(
        { calculateReload },
        { where: { user_idx: req.user_idx } }
      );
    }

    await db.calculate.update(
      { sharedDate },
      { where: { customer_idx, idx: calculate_idx } }
    );

    const findResult = await db.calculate.findByPk(calculate_idx, {
      attributes: showCalculateAttributes,
    });
    res.send({ success: 200, findResult });

    const alarmSMS = await db.sms.findByPk(sms_idx, {
      attributes: ["text_cost"],
    });

    if (alarmSMS.text_cost < 1000) {
      const message = alarm.messageCostAlarm(alarmSMS.text_cost);
      const insertData = {
        message,
        alarm_type: 36,
      };
      const sendMember = [huidx];
      alarm.sendMultiAlarm(insertData, sendMember, io);
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
    var params = {
      Bucket: "ordercheck",
      Delimiter: "/",
      Prefix: `fileStore/10/`,
    };

    s3_get(params, (err, data) => {
      return res.send(data);
    });
  },
  doIntegratedUser: async (req, res, next) => {
    const { body, company_idx, user_idx } = req;
    const deletedTime = moment();
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
          await db.customer.update(
            {
              deleted: deletedTime,
            },
            {
              where: { idx: data },
            }
          );
        } catch (err) {
          console.log(err);
        }
      });

      const findCustomerResult = await db.customer.findByPk(body.main_idx, {
        attributes: ["customer_phoneNumber", "customer_name"],
      });

      const findSameUser = await db.customer.findAll({
        where: {
          customer_phoneNumber: findCustomerResult.customer_phoneNumber,
          deleted: null,
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

      res.send({ success: 200, findSameUser });

      const alarm = new Alarm({});

      const integratingUser = await db.user.findByPk(user_idx, {
        attributes: ["user_name"],
      });

      const targetCustomer = await db.customer.findByPk(body.target_idx[0], {
        attributes: targetCustomerAttributes,
      });

      const mainCustomer = await db.customer.findByPk(body.main_idx, {
        attributes: mainCustomerAttributes,
      });

      const message = alarm.integrateCustomer(
        integratingUser.user_name,
        targetCustomer.customer_name,
        mainCustomer.customer_name,
        targetCustomer.createdAt,
        mainCustomer.createdAt
      );

      const io = req.app.get("io");
      // null 제외
      let contactArr = [];
      if (mainCustomer.contact_person) {
        // 자기 자신 제외
        if (user_idx !== mainCustomer.contact_person) {
          contactArr.push(mainCustomer.contact_person);
        }
      }

      for (i = 0; i < body.target_idx.length; i++) {
        const findContact = await db.customer.findByPk(body.target_idx[i], {
          attributes: ["contact_person"],
          group: ["contact_person"],
        });

        if (
          findContact.contact_person &&
          findContact.contact_person !== mainCustomer.contact_person
        ) {
          contactArr.push(findContact.contact_person);
        }
      }

      const insertData = {
        message,
        alarm_type: 8,
      };
      alarm.sendMultiAlarm(insertData, contactArr, io);
    } catch (err) {
      next(err);
    }
  },
};
