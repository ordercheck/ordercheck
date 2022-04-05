const formSchedule = require("node-schedule");
const db = require("../model/db");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
const { Op } = require("sequelize");
const { Alarm } = require("./classes/AlarmClass");
const { alarm } = require("../model/db");
// '초 분 시 일 월 요일  (0 과 7 은 일요일)'
const countReset = "0 0 17 1 * *";

const alarmDate = "0 0 16 * * *";
const tenAlarmDate = "0 0 1 * * *";
const testAlarm = "*/1 * * * * *";
console.log("매달 form 개수 초기화 스케쥴러");
formSchedule.scheduleJob(countReset, async function () {
  await db.company.update(
    { form_link_count: 0, customer_count: 0 },
    { where: {} }
  );
});

console.log("1시 스케줄러");
formSchedule.scheduleJob(alarmDate, async function () {
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
    diffTime = 30;
    const findCompanyResult = await db.company.findByPk(data.company_idx, {
      attributes: ["huidx"],
    });
    // 30일
    if (diffTime == 30 || diffTime == 7 || diffTime == 1) {
      const message = alarm.restFreeAlarm(diffTime);

      alarm.createAlarm({
        message,
        alarm_type: 38,
        user_idx: findCompanyResult.huidx,
        company_idx: data.company_idx,
      });
    }
  });

  // 만료된 알람 삭제
  const beforeTwoDate = moment().subtract(2, "d");
  // 2일동안 공유되지 않은 견
  const findCalculate = await db.calculate.findAll({
    where: {
      sharedDate: "",
      updatedAt: { [Op.lte]: beforeTwoDate },
    },
    include: [
      {
        model: db.customer,
        where: { contact_person: { [Op.ne]: null } },
      },
    ],
    attributes: [
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

  findCalculate.forEach((data) => {
    const message = alarm.notSharedCalculateAlarm(
      data.customer.customer_name,
      data.updatedAt
    );
    const insertData = {
      message,
      alarm_type: 12,
      user_idx: data.customer.contact_person,
    };
    alarm.createAlarm(insertData);
  });
});
// 오전 10시 스케줄러
console.log("오전 10시 스케쥴러");
formSchedule.scheduleJob(tenAlarmDate, async function () {
  const alarm = new Alarm({});
  //  이슈고객 알림 (담당자와 소유자)
  const findCustomer = await db.customer.findAll({
    where: {
      status: 3,
      contact_person: { [Op.ne]: null },
    },
    attributes: ["contact_person"],
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
      alarm_type: 4,
      user_idx: data.contact_person,
    };

    alarm.createAlarm(insertData);
  });

  const findCustomerCompany = await db.customer.findAll({
    where: {
      status: 3,
    },
    attributes: ["company_idx"],
    group: ["company_idx"],
    raw: true,
  });

  findCustomerCompany.forEach(async (data) => {
    const companyIssue = await db.company.findAndCountAll({
      where: { idx: data.company_idx },
      attributes: ["huidx"],
    });

    const message = alarm.issueAlarm(companyIssue.count);
    const insertData = {
      message,
      alarm_type: 4,
      user_idx: companyIssue.rows[0].huidx,
    };
    alarm.createAlarm(insertData);
  });
});
