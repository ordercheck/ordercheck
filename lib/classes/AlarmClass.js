const db = require("../../model/db");
const { alarmAttributes } = require("../attributes");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");

class Alarm {
  constructor(data) {
    this.alarmData = { ...data };
  }

  sendMultiAlarm = async (insertData, findMembers, io) => {
    try {
      findMembers.forEach(async (data) => {
        insertData.user_idx = data;

        const createResult = await this.createAlarm(insertData);

        io.to(data).emit("addAlarm", createResult.dataValues);
      });
    } catch (err) {
      console.log(err);
    }
  };

  createAlarm = async (createData) => {
    const expiry_date = moment().add("14", "day").format("YYYY-MM-DD HH:mm");
    createData.expiry_date = expiry_date;
    const createResult = await db.alarm.create(createData);
    return createResult;
  };

  delAlarms = (alarms) => {
    alarms.forEach(async (idx) => {
      await db.alarm.destroy({ where: { idx } });
    });
  };

  confirmAlarms = async (alarm) => {
    for (let i = 0; i < alarm.length; i++) {
      await this.updateAlarms({ confirm: true }, { idx: alarm[i] });
    }
  };

  findAllAlarms = async (whereData, sortData) => {
    await db.alarm.findAll({
      where: whereData,
      attributes: alarmAttributes,
      order: sortData,
      raw: true,
    });
  };

  findAlarmsByPk = async (alarm) => {
    const findAlarmResult = await db.alarm.findByPk(alarm, {
      attributes: alarmAttributes,
      raw: true,
    });
    return findAlarmResult;
  };
  updateAlarms = async (updateData, whereData) => {
    await db.alarm.update(updateData, {
      where: whereData,
    });
  };

  approveAlarmMember = (companyName) => {
    // 수신인 : 가입 요청자
    `${companyName}(으)로부터 가입 승인이 완료되었습니다.`;
  };
  approveAlarmAuth = (approveAuth, approvedMember) => {
    // 수신인 : 승인 권한자 전체
    `${approveAuth}님이 ${approvedMember}님의 가입을 승인했습니다.`;
  };

  nonChangeAlarm = (approveAuth, approvedMember) => {
    // 수신인 : 해당 고객에 접근 가능한 팀원에게만 발송
    `상담 지연 고객이 (이틀 전), 더 오래 전 상담 접수된 고객 중 상담 신청 상태인 고객 수)명 있습니다.`;
  };

  issueAlarm = (issuePeople) => {
    // 수신인 : 해당 고객에 접근 가능한 팀원에게만 발송
    `처리되지 않은 이슈 고객이 ${issuePeople}명 있습니다.`;
  };

  setContactAlarm = (companyMember, customer) => {
    // 수신인 : 담당자
    `${companyMember}님이 회원님을 [${customer} YY/MM/DD] 담당자로 지정하였습니다.`;
  };

  notSharedCalculateAlarm = (customer) => {
    // 수신인 : 담당자
    `[${customer} YY/MM/DD] 공유되지 않은 견적서가 있습니다.`;
  };

  delCustomerAlarm = (companyMember, customer) => {
    // 수신인 : 담당자
    `${companyMember}님이 [${customer} YY/MM/DD] 정보를 삭제했습니다.`;
  };

  integrateCustomer = (companyMember, customerName, mainCustomerName) => {
    // 수신인 : 연동된 모든 고객 담당자, 연동 실행자 제외
    `${companyMember}님이 [${customerName} YY/MM/DD] 정보를 [${mainCustomerName} YY/MM/DD] 으로 연동하였습니다.`;
  };

  formLinkLimitAlarm50 = () => {
    // 수신인 : 소유주
    `당월 상담 신청 수가 50% 찼습니다. 상담 신청 수 초과 시 신청폼의 링크 접근이 제한됩니다.`;
  };

  formLinkLimitAlarm80 = () => {
    // 수신인 : 소유주
    `당월 상담 신청 수가 80% 찼습니다. 상담 신청 수 초과 시 신청폼의 링크 접근이 제한됩니다.`;
  };

  formLinkLimitAlarm100 = () => {
    // 수신인 : 소유주
    `당월 상담 신청 수가 초과되어 생성된 상담 신청폼의 링크 접근이 제한됩니다.`;
  };

  changeFormAlarm = (companyMember, formName) => {
    // 수신인 : 열람 권한자 전체
    `${companyMember}님이 [${formName}] 신청폼을 수정하였습니다.`;
  };

  changeFormTitleAlarm = (companyMember, formName, changedFormName) => {
    // 수신인 : 열람 권한자 전체
    `${companyMember}님이 [${formName}] 신청폼명을 [${changedFormName}]으로 변경하였습니다.`;
  };

  inviteFormAlarm = (companyMember, formName) => {
    // 수신인 : 초대 받은 사람
    `${companyMember}님이 [${formName}] 신청폼에 회원님을 초대했습니다.`;
  };

  excludeFormAlarm = (companyMember, formName) => {
    // 수신인 : 제외된 사람
    `${companyMember}님이 [${formName}] 신청폼에서 회원님을 제외했습니다.`;
  };

  createFormAlarm = (companyMember, formName) => {
    // 수신인 : 소유주
    `${companyMember}님이 새로운 신청폼 [${formName}]을(를) 등록하였습니다.`;
  };

  delFormAlarm = (companyMember, formName) => {
    // 수신인 : 열람 권한자 전체
    `${companyMember}님이 [${formName}] 신청폼을 삭제하였습니다.`;
  };

  fileLimitAlarm50 = () => {
    // 수신인 : 소유주
    `파일 보관함 용량이 50% 찼습니다. 저장용량 초과 시 파일 업로드가 제한됩니다.`;
  };

  fileLimitAlarm80 = () => {
    // 수신인 : 소유주
    `파일 보관함 용량이 80% 찼습니다. 저장용량 초과 시 파일 업로드가 제한됩니다.`;
  };

  fileLimitAlarm100 = () => {
    // 수신인 : 소유주
    `파일보관함 용량이 초과되어 파일 업로드가 제한됩니다.`;
  };

  failedPlanAlarm = () => {
    // 수신인 : 소유주
    `플랜 정기 결제가 실패하였습니다. 등록된 카드를 확인해주세요.`;
  };

  failedAutoMessageAlarm = () => {
    // 수신인 : 소유주
    `자동 문자 충전이 실패하였습니다. 등록된 카드를 확인해주세요.`;
  };

  failedSendAlimTalkAlarm = () => {
    // 수신인 : 소유주
    `문자 잔액 부족으로 알림톡을 발송하지 못했습니다. 잔액을 확인해주세요.`;
  };

  messageCostAlarm = () => {
    // 수신인 : 소유주, 잔액이 1000원 이하인 경우
    `문자 잔액이 #원 남았습니다. 잔액을 충전해주세요.`;
  };

  startFreeAlarm = (restDate) => {
    // 수신인 : 소유주, 잔액이 1000원 이하인 경우
    `무료 체험 기간이 시작되었습니다. (남은 기간 ${restDate}일)`;
  };

  restFreeAlarm = (restDate) => {
    // 수신인 : 소유주, 30일, 7일 하루
    if (restDate == 1) {
      `무료 체험 종료 하루 전 입니다.`;
    }
    `무료 체험 종료 ${restDate}일 전입니다.`;
  };

  addCustomer = (companyMember, customerName) => {
    // 수신인 : 소유주, 담당자
    const now = moment().format("YY/MM/DD");
    return `${companyMember}님이 [${customerName} ${now}] 을 등록했습니다.`;
  };
}

module.exports = { Alarm };
