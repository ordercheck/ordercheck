const formSchedule = require("node-schedule");
const db = require("../model/db");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
const { Op } = require("sequelize");
const { Alarm } = require("./classes/AlarmClass");
const { alarm } = require("../model/db");
const db_config = require("./config/db_config");
// '초 분 시 일 월 요일  (0 과 7 은 일요일)'

const oneAlarmDate = "0 0 16 * * *";

const resetDate = "0 0 15 * * *";

const tenAlarmDate = "0 0 1 * * *";
const testAlarm = "*/1 * * * * *";

console.log("12시 매달 초기화 스케줄러");
formSchedule.scheduleJob(resetDate, async function () {
  const now = moment();
  const limitDate = moment().add("1", "d");
  const newDate = moment().add("1", "M");

  // 초기화
  await db.company.update(
    { form_link_count: 0, customer_count: 0 },
    {
      where: {
        resetDate: { [Op.between]: [now, limitDate] },
      },
    }
  );

  // resetDate 업데이트
  const findCompany = await db.company.findAll({
    where: { resetDate: { [Op.between]: [now, limitDate] } },
    attributes: ["idx"],
    raw: true,
  });

  findCompany.forEach(async (data) => {
    await db.company.update(
      { resetDate: newDate },
      { where: { idx: data.idx } }
    );
  });
});

formSchedule.scheduleJob(oneAlarmDate, async function () {
  // bread 삭제
  await db.store.destroy({
    truncate: true,
  });

  // 만료된 알람 삭제
  const nowDate = moment().toISOString();
  await db.alarm.destroy({
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
console.log("오전 10시 알람 스케쥴러");
formSchedule.scheduleJob(tenAlarmDate, async function () {
  const alarm = new Alarm({});
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

  // const findCustomerCompany = await db.customer.findAll({
  //   where: {
  //     status: 3,
  //   },
  //   attributes: ["company_idx"],
  //   group: ["company_idx"],
  //   raw: true,
  // });

  // findCustomerCompany.forEach(async (data) => {
  //   const companyIssue = await db.company.findByPk(data.company_idx, {
  //     attributes: ["huidx"],
  //   });

  //   const findIssue = await db.customer.count({
  //     where: { company_idx: data.company_idx, status: 3 },
  //   });

  //   const message = alarm.issueAlarm(findIssue);
  //   const insertData = {
  //     message,
  //     alarm_type: 4,
  //     user_idx: companyIssue.huidx,
  //   };
  //   alarm.createAlarm(insertData);
  // });
  // 2일동안 상담신청 상태인 것들
  const beforeTwoDate = moment().subtract(2, "d");
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
      where: { status: 0, contact_person: data.contact_person },
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

  // const findStatusCompany = await db.customer.findAll({
  //   where: {
  //     status: 0,
  //   },
  //   attributes: ["company_idx"],
  //   group: ["company_idx"],
  //   raw: true,
  // });

  // findStatusCompany.forEach(async (data) => {
  //   const companyIssue = await db.company.findByPk(data.company_idx, {
  //     attributes: ["huidx"],
  //   });

  //   const findStatusCustomer = await db.customer.count({
  //     where: {
  //       company_idx: data.company_idx,
  //       status: 0,
  //       updatedAt: { [Op.lte]: beforeTwoDate },
  //     },
  //   });

  //   const message = alarm.nonChangeAlarm(findStatusCustomer);

  //   const insertData = {
  //     message,
  //     alarm_type: 9,
  //     user_idx: companyIssue.huidx,
  //   };

  //   alarm.createAlarm(insertData);
  // });
});
