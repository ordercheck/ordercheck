const formSchedule = require("node-schedule");
const db = require("../model/db");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
const { Op } = require("sequelize");
const { sendReport } = require("../mail/sendOrdercheckEmail");
const { userReportKakaoPush } = require("../lib/kakaoPush");
const { Alarm } = require("./classes/AlarmClass");
const { s3_delete_objects } = require("./aws/aws");
const axios = require("axios");
// '초 분 시 일 월 요일  (0 과 7 은 일요일)'
const oneAlarmDate = "0 0 16 * * *";
const resetDate = "0 0 15 * * *";
const tenAlarmDate = "0 0 1 * * *";
const sevenAlarmDate = "0 0 22 * * *";
const testAlarm = "*/1 * * * * *";

console.log("7시 스케줄러");
formSchedule.scheduleJob(sevenAlarmDate, async function () {
  console.log("삐빅 지금 7시");
  const beforeTwoDate = moment().subtract(2, "d");
  const beforeDate = moment().subtract(1, "days").startOf("day");
  const now = moment().startOf("day");
  // 고객 리포트
  let findAllCompany = await db.company.findAll({
    where: { deleted: null },
    include: [
      {
        model: db.user,
      },
    ],
  });
  findAllCompany = JSON.parse(JSON.stringify(findAllCompany));

  findAllCompany.forEach(async (data) => {
    // 알람 설정 체크
    const issueCount = await db.customer.count({
      where: {
        status: 3,
        company_idx: data.idx,
      },
    });

    const newConsulting = await db.consulting.count({
      where: {
        createdAt: { [Op.between]: [beforeDate, now] },
        company_idx: data.idx,
      },
    });
    const delayCount = await db.customer.count({
      where: {
        status: 0,
        updatedAt: { [Op.lte]: beforeTwoDate },
        company_idx: data.idx,
      },
    });

    if (data.user.kakaoCustomerStatusAlarm) {
      userReportKakaoPush(
        moment(beforeDate).format("YYYY.MM.DD"),
        newConsulting,
        delayCount,
        issueCount,
        data.user.user_phone.replace(
          /[ \{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\ '\"\\(\=]/gi,
          ""
        )
      );
    }

    if (data.user.emailCustomerStatusAlarm) {
      sendReport(
        data.compnay_name,
        "ordercheck.io",
        newConsulting,
        delayCount,
        issueCount,
        data.user.user_email
      );
    }
  });
});

console.log("24시 스케줄러");
formSchedule.scheduleJob(resetDate, async function () {
  console.log("삐빅 지금 24시");

  const now = moment();
  const limitDate = moment().add("1", "d");
  const newDate = moment().add("1", "M");
  //  플랜 변경
  // 무료체험 중인데 free로 이용할 때
  const findWillFreePlan = await db.plan.findAll({
    where: { will_free: { [Op.between]: [now, limitDate] } },
    raw: true,
  });

  findWillFreePlan.forEach((data) => {
    const changePlanOB = { active: 0 };
    //  무료 체험중일 때
    if (data.free_plan) {
      changePlanOB.free_period_expire = now;
    }
    db.plan.update(changePlanOB, {
      where: { active: 1, company_idx: data.company_idx },
    });
    db.plan.destroy({ where: { idx: data.idx } });
    db.plan.create({
      start_plan: data.start_plan,
      merchant_uid: data.merchant_uid,
      company_idx: data.company_idx,
      enrollment: null,
    });
  });

  // 초기화
  db.company.update(
    { form_link_count: 0, customer_count: 0 },
    {
      where: {
        resetDate: { [Op.between]: [now, limitDate] },
      },
    }
  );

  // resetDate 업데이트
  const findCompany = await db.company.findAll({
    where: { resetDate: { [Op.between]: [now, limitDate] }, deleted: null },
    attributes: ["idx"],
    raw: true,
  });

  findCompany.forEach((data) => {
    db.company.update({ resetDate: newDate }, { where: { idx: data.idx } });
  });
});

formSchedule.scheduleJob(oneAlarmDate, async function () {
  // bread 삭제
  db.store.destroy({
    truncate: true,
  });

  // 만료된 알람 삭제
  const nowDate = moment().toISOString();
  db.alarm.destroy({
    where: {
      expiry_date: { [Op.lte]: nowDate },
    },
  });

  // 무료 플랜 30일 찾기
  const findFreePlan = await db.plan.findAll({
    where: { free_plan: { [Op.ne]: null }, active: 1 },
    attributes: ["start_plan", "company_idx"],
    raw: true,
  });

  // // 프리플랜 여부 체크
  const alarm = new Alarm({});
  let now = moment();

  findFreePlan.forEach(async (data) => {
    // 남은 날짜 구하기
    const freePlan = moment(data.start_plan.replace(/\./g, "-"));
    let diffTime = moment.duration(freePlan.diff(now)).asDays();
    diffTime = Math.ceil(diffTime);

    const findCompanyResult = await db.company.findByPk(data.company_idx, {
      attributes: ["huidx", "company_subdomain"],
    });

    if (diffTime == 30 || diffTime == 7 || diffTime == 1) {
      const message = alarm.restFreeAlarm(diffTime);

      alarm.createAlarm({
        message,
        alarm_type: 38,
        user_idx: findCompanyResult.huidx,
        path: `/setting/manage_subscribe`,
      });
    }
  });
  // 2일동안 공유되지 않은 견
  const beforeTwoDate = moment().subtract(2, "d");

  const findCalculate = await db.calculate.findAll({
    where: {
      sharedDate: "",
      updatedAt: { [Op.lte]: beforeTwoDate },
    },
    include: [
      {
        model: db.customer,
        where: { contact_person: { [Op.ne]: null } },
        attributes: ["idx"],
      },
    ],
    attributes: [
      "company_idx",
      [
        db.sequelize.fn(
          "date_format",
          db.sequelize.col("calculate.updatedAt"),
          "%Y/%m/%d"
        ),
        "updatedAt",
      ],
    ],
    raw: true,
    nest: true,
  });

  findCalculate.forEach(async (data) => {
    const message = alarm.notSharedCalculateAlarm(
      data.customer.customer_name,
      data.updatedAt
    );

    const insertData = {
      message,
      alarm_type: 12,
      path: `/custom_manage/detail/${data.customer.idx}/estimate`,
      user_idx: data.customer.contact_person,
    };
    alarm.createAlarm(insertData);
  });
});
// 오전 10시 스케줄러
console.log("오전 10시 스케쥴러");
formSchedule.scheduleJob(tenAlarmDate, async function () {
  const alarm = new Alarm({});
  const beforeTwoDate = moment().subtract(2, "d");

  //  이슈고객 알림 (담당자)
  const findCustomer = await db.customer.findAll({
    where: {
      status: 3,
      contact_person: { [Op.ne]: null },
    },
    attributes: ["contact_person", "company_idx"],
    group: ["contact_person"],
    raw: true,
  });

  findCustomer.forEach(async (data) => {
    const findCustomerData = await db.customer.count({
      where: { status: 3, contact_person: data.contact_person },
      attributes: ["contact_person"],
    });

    const message = alarm.issueAlarm(findCustomerData);

    const insertData = {
      message,
      path: `/custom_manage`,
      alarm_type: 4,
      user_idx: data.contact_person,
    };

    alarm.createAlarm(insertData);
  });

  // 2일이상 상담신청 상태인 것들
  const findStatus = await db.customer.findAll({
    where: {
      status: 0,
      updatedAt: { [Op.lte]: beforeTwoDate },
      contact_person: { [Op.ne]: null },
    },
    attributes: ["contact_person", "company_idx"],
    group: ["contact_person"],
    raw: true,
  });

  findStatus.forEach(async (data) => {
    const findCustomerData = await db.customer.count({
      where: { deleted: null, status: 0, contact_person: data.contact_person },
    });
    const message = alarm.nonChangeAlarm(findCustomerData);
    const insertData = {
      message,
      path: `/custom_manage`,
      alarm_type: 9,
      user_idx: data.contact_person,
    };
    alarm.createAlarm(insertData);
  });
});
// formSchedule.scheduleJob(testAlarm, async function () {
//   const params = {
//     Bucket: "ordercheck",
//     Delete: {
//       Objects: null,
//     },
//   };

//   const findDeletedFiles = await db.files.findAll({
//     where: { deleted: true },
//     raw: true,
//   });
//   const deleteObjects = [];
//   findDeletedFiles.forEach((data) => {
//     const [, , , folder, file] = data.file_url.split("/");
//     deleteObjects.push({ Key: [folder, file].join("/") });
//   });
//   params.Delete.Objects = deleteObjects;

//   s3_delete_objects(params);
// });
// formSchedule.scheduleJob(testAlarm, async function () {
//   const startDate = moment().startOf("day").format("YYYY-MM-DD HH:mm:ss");
//   const endDate = moment().format("YYYY-MM-DD HH:mm:ss");

//   const payResult = await axios({
//     url: "http://210.126.20.144:8888/ordercheck/rest/api/missData",
//     method: "post", // POST method
//     headers: {
//       "Content-Type": "application/json",
//     }, // "Content-Type": "application/json"
//     data: {
//       startDate,
//       endDate,
//     },
//   });
//   console.log(payResult.data);
// });
