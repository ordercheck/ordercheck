const db = require("../model/db");
const { limitPlan } = require("../lib/standardTemplate");
const { Alarm } = require("../lib/classes/AlarmClass");
const { delFile } = require("../lib/aws/fileupload").ufile;
const {
  sendForm5080,
  sendFormLimit,
  sendFileStoreEmail,
  sendFileStoreEmailLimit,
} = require("../mail/sendOrdercheckEmail");

const { fileStoreLimitKakaoPush } = require("../lib/kakaoPush");
// 고객 체크
const checkCustomerCount = async (company_idx, data) => {
  const findCompanyData = await db.company.findByPk(company_idx, {
    attributes: data,
  });
  const findPlanResult = await db.plan.findOne({
    where: { company_idx, active: 1 },
    attributes: ["plan"],
  });

  return {
    findCompanyData,
    findPlanResult,
  };
};

const check = async (reqData, data) => {
  try {
    const findCompanyByLink = await db.formLink.findOne({
      where: { form_link: reqData },
      attributes: ["company_idx"],
    });
    if (!findCompanyByLink) {
      return {
        success: false,
        message: "존재하지 않는 링크 입니다",
      };
    }

    const { findCompanyData, findPlanResult } = await checkCustomerCount(
      findCompanyByLink.company_idx,
      data
    );
    return {
      success: true,
      findCompanyData,
      findPlanResult,
    };
  } catch (err) {
    return {
      success: false,
      message: err,
    };
  }
};

module.exports = {
  checkFormLimit: async (req, res, next) => {
    const {
      params: { form_link },
    } = req;

    const { success, findCompanyData, findPlanResult, message } = await check(
      form_link,
      ["form_link_count"]
    );

    if (!success) {
      return res.send({ success: 400, message });
    }

    if (
      findCompanyData.form_link_count ==
      limitPlan[findPlanResult.plan].form_link_count
    ) {
      req.formClose = true;
      return next();
    }
    req.formClose = false;
    return next();
  },
  checkCustomerLimit: async (req, res, next) => {
    const { findCompanyData, findPlanResult } = await checkCustomerCount(
      req.company_idx,
      ["customer_count"]
    );

    if (
      findCompanyData.customer_count ==
      limitPlan[findPlanResult.plan].customer_count
    ) {
      return res.send({
        success: 400,
        message: "이달 고객 등록 가능 횟수가 초과하였습니다.",
      });
    }
    return next();
  },

  checkConsultingLimit: async (req, res, next) => {
    const {
      body: { form_link },
    } = req;

    const { success, findCompanyData, findPlanResult, message } = await check(
      form_link,
      ["form_link_count", "huidx"]
    );

    if (!success) {
      return res.send({ success: 400, message });
    }

    const alarm = new Alarm({});
    const io = req.app.get("io");
    // 50% 찼을 때
    if (
      limitPlan[findPlanResult.plan].form_link_count / 2 ==
      findCompanyData.form_link_count
    ) {
      const alarmMessage = alarm.formLinkLimitAlarm50();
      const insertData = {
        message: alarmMessage,
        alarm_type: 17,
      };
      const sendMember = [findCompanyData.huidx];

      alarm.sendMultiAlarm(insertData, sendMember, io);
      const findHuidx = await db.user.findByPk(findCompanyData.huidx, {
        attributes: ["user_email"],
      });
      sendForm5080(123, 50, 1, findHuidx.user_email);
    }

    // 80% 찼을 때
    if (
      limitPlan[findPlanResult.plan].form_link_count * 0.8 ==
      findCompanyData.form_link_count
    ) {
      const alarmMessage = alarm.formLinkLimitAlarm80();
      const insertData = {
        message: alarmMessage,
        alarm_type: 18,
      };
      const sendMember = [findCompanyData.huidx];

      alarm.sendMultiAlarm(insertData, sendMember, io);

      const findHuidx = await db.user.findByPk(findCompanyData.huidx, {
        attributes: ["user_email"],
      });
      sendForm5080(123, 80, 1, findHuidx.user_email);
    }

    // 초과 했을 때
    if (
      limitPlan[findPlanResult.plan].form_link_count ==
      findCompanyData.form_link_count
    ) {
      const alarmMessage = alarm.formLinkLimitAlarm100();
      const insertData = {
        message: alarmMessage,
        alarm_type: 19,
      };
      const sendMember = [findCompanyData.huidx];

      alarm.sendMultiAlarm(insertData, sendMember, io);

      const findHuidx = await db.user.findByPk(findCompanyData.huidx, {
        attributes: ["user_email"],
      });
      sendFormLimit(123, 1, findHuidx.user_email);
    }
    return;
  },

  checkFileLimit: async (req, res, next) => {
    const { company_idx } = req;
    const alarm = new Alarm({});
    const io = req.app.get("io");
    const findFilesResult = await db.files.findAll({
      where: {
        company_idx,
        isFolder: false,
      },
      attributes: ["file_size"],
      raw: true,
    });

    let mbFileSize = 0;
    findFilesResult.forEach((data) => {
      mbFileSize += data.file_size;
    });
    // TB로 변환
    const tbFileSize = mbFileSize / 1000000;

    const findPlanResult = await db.plan.findOne({
      where: { company_idx, active: 1 },
      attributes: ["plan"],
    });

    const findCompany = await db.company.findByPk(company_idx, {
      attributes: ["huidx"],
    });

    // 50% 찼을 때
    if (
      limitPlan[findPlanResult.plan].fileStore / 2 <= tbFileSize &&
      tbFileSize < limitPlan[findPlanResult.plan].fileStore * 0.8
    ) {
      const alarmMessage = alarm.fileLimitAlarm50();
      const insertData = {
        message: alarmMessage,
        alarm_type: 27,
      };
      const sendMember = [findCompany.huidx];
      alarm.sendMultiAlarm(insertData, sendMember, io);
      const restMB =
        (limitPlan[findPlanResult.plan].fileStore - tbFileSize) * 1000000;

      const findHuidx = await db.user.findByPk(findCompany.huidx, {
        attributes: ["user_email"],
      });

      sendFileStoreEmail(
        50,
        123,
        123,
        limitPlan[findPlanResult.plan].fileStore,
        restMB,
        findHuidx.user_email
      );
    }

    // 80% 찼을 때
    if (
      limitPlan[findPlanResult.plan].fileStore * 0.8 <= tbFileSize &&
      tbFileSize < limitPlan[findPlanResult.plan].fileStore
    ) {
      const alarmMessage = alarm.fileLimitAlarm80();
      const insertData = {
        message: alarmMessage,
        alarm_type: 28,
      };
      const sendMember = [findCompany.huidx];
      alarm.sendMultiAlarm(insertData, sendMember, io);
      const findHuidx = await db.user.findByPk(findCompany.huidx, {
        attributes: ["user_email"],
      });
      const restMB =
        (limitPlan[findPlanResult.plan].fileStore - tbFileSize) * 1000000;

      sendFileStoreEmail(
        80,
        123,
        123,
        limitPlan[findPlanResult.plan].fileStore,
        restMB,
        findHuidx.user_email
      );
    }
    // 100% 찼을 때
    if (limitPlan[findPlanResult.plan].fileStore <= tbFileSize) {
      const alarmMessage = alarm.fileLimitAlarm100();
      const insertData = {
        message: alarmMessage,
        alarm_type: 29,
      };
      const sendMember = [findCompany.huidx];
      alarm.sendMultiAlarm(insertData, sendMember, io);
      const findHuidx = await db.user.findByPk(findCompany.huidx, {
        attributes: ["user_email", "user_phone"],
      });
      // 이메일 보내기
      const now = moment().format("YY/MM/DD HH:mm:ss");

      sendFileStoreEmailLimit(now, 1, 1, findHuidx.user_email);

      // 알림톡 보내기
      fileStoreLimitKakaoPush(findHuidx.replace(/\./g, ""));
    }
    return;
  },
};
