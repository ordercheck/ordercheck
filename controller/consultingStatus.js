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
            { form_link_count: 1, customer_count: 1 },
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

      console.log("imgUrl", imgUrlString);
      console.log("concept", conceptUrlString);

      const formBodyData = files.hope_concept
        ? bodyClass.createNewUrl(imgUrlString, conceptUrlString)
        : bodyClass.bodyData;
      console.log("formBodyData", formBodyData);
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

      const io = req.app.get("io");

      const message = `[${consultResult.customer_name}]님의 담당자로 지정되었습니다.`;
      const alarm = new Alarm({});
      const createResult = await alarm.createAlarm({
        message,
        user_idx: contract_person,
        company_idx,
        alarm_type: 2,
        customer_idx: consultResult.idx,
      });
      const sendAlarm = new Alarm(createResult);

      io.to(parseInt(createResult.user_idx)).emit(
        "addAlarm",
        sendAlarm.alarmData.dataValues
      );
      return;
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
      // 고객 전화번호 찾기
      const findCustomerResult = await db.customer.findByPk(
        customer_idx,

        { attributes: ["customer_phoneNumber"] }
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

      return res.send({ success: 200 });
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

      // 팀원들에게 알람 보내기
      const findCustomer = await db.customer.findByPk(
        createCustomerResult.idx,
        {
          attributes: ["customer_name", "idx"],
        }
      );

      const findUser = await db.user.findByPk(user_idx, {
        attributes: ["user_name"],
      });

      const now = moment().format("YY.MM.DD");

      const message = `${findUser.user_name}님이 [${findCustomer.customer_name} ${now}]을 신규 등록했습니다.`;

      const io = req.app.get("io");

      const findMembers = await findMemberExceptMe(company_idx, user_idx);

      const insertData = {
        message,
        company_idx,
        alarm_type: 1,
        customer_idx: findCustomer.idx,
      };

      await sendCompanyAlarm(insertData, findMembers, io);
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

    // 파일 보관함 있는지 체크
    // await
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
      const file_name = getFileName(file.key);
      body.file_name = file_name;
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
      company_idx,
      text_cost,
      repay,
      sms_idx,
      token,
      user_idx,
    } = req;
    // 알림톡 보내기 전 알림톡 비용 체크
    if (text_cost < 10) {
      return res.send({ success: 400, message: "알림톡 비용 부족" });
    }

    const customerFindResult = await db.customer.findByPk(customer_idx, {
      attributes: ["customer_phoneNumber", "customer_name", "idx"],
    });

    const findSender = await db.user.findByPk(user_idx, {
      attributes: ["user_phone", "user_name"],
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
          method: "post", // POST method
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token} `,
          }, // "Content-Type": "application/json"
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

    // 팀원들에게 알람 보내기

    const io = req.app.get("io");
    const now = moment().format("YY/MM/DD");

    const findMembers = await findMemberExceptMe(company_idx, user_idx);
    const alarmMessage = `${findSender.user_name}님이 [${customerFindResult.customer_name} ${now}] 고객님께 ${calculateFindResult.calculateNumber}차 견적서를 발송했습니다.`;

    const data = {
      customer_idx: customerFindResult.idx,
      message: alarmMessage,
      company_idx,
      alarm_type: 3,
    };

    await sendCompanyAlarm(data, findMembers, io);
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

      // 팀원들에게 알람 보내기
      const findCustomer = await db.customer.findByPk(body.main_idx, {
        attributes: ["customer_name", "idx"],
      });

      const message = `[${findCustomer.customer_name}] 고객님의 고객 연동이 완료되었습니다.`;

      const io = req.app.get("io");

      const findMembers = await findMemberExceptMe(company_idx, user_idx);

      const insertData = {
        message,
        company_idx,
        alarm_type: 4,
        customer_idx: findCustomer.idx,
      };
      await sendCompanyAlarm(insertData, findMembers, io);
      return;
    } catch (err) {
      next(err);
    }
  },
};
