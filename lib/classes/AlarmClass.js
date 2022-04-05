const db = require("../../model/db");
const { alarmAttributes, findAlarmAttributes } = require("../attributes");
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
        const findAlarmData = await this.findAlarmsByPk(
          createResult.idx,
          findAlarmAttributes
        );
        io.to(parseInt(data)).emit("addAlarm", findAlarmData);
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

  findAlarmsByPk = async (alarmId, attributesData) => {
    const findAlarmResult = await db.alarm.findByPk(alarmId, {
      attributes: attributesData,
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
    return `<b>${companyName}</b>(으)로부터 <b>가입 승인이 완료</b>되었습니다.`;
  };
  approveAlarmAuth = (approveAuth, approvedMember) => {
    // 수신인 : 승인 권한자 전체
    return `<b>${approveAuth}</b>님이 <b>${approvedMember}</b>님의 가입을 승인했습니다.`;
  };

  nonChangeAlarm = (customerCount) => {
    // 수신인 : 해당 고객에 접근 가능한 팀원에게만 발송
    return `<b>상담 지연 고객</b>이 <b>${customerCount}명</b> 있습니다.`;
  };

  issueAlarm = (issuePeople) => {
    // 수신인 : 해당 고객에 접근 가능한 팀원에게만 발송
    return `처리되지 않은 <b>이슈 고객</b>이 <b>${issuePeople}명</b> 있습니다.`;
  };

  setContactAlarm = (companyMember, customer) => {
    // 수신인 : 담당자
    const now = moment().format("YY/MM/DD");
    return `<b>${companyMember}</b>님이 회원님을 <b>[${customer} ${now}] 담당자</b>로 지정하였습니다.`;
  };

  notSharedCalculateAlarm = (customer, date) => {
    // 수신인 : 담당자
    return `<b>[${customer} ${date}]</b> 공유되지 않은 견적서가 있습니다.`;
  };

  delCustomerAlarm = (companyMember, customer) => {
    // 수신인 : 담당자
    const now = moment().format("YY/MM/DD");
    return `<b>${companyMember}</b>님이 <b>[${customer} ${now}]</b> 정보를 삭제했습니다.`;
  };

  integrateCustomer = (
    companyMember,
    customerName,
    mainCustomerName,
    beforeDate,
    afterDate
  ) => {
    // 수신인 : 연동된 모든 고객 담당자, 연동 실행자 제외

    return `<b>${companyMember}</b>님이 <b>[${customerName} ${beforeDate}]</b> 정보를 <b>[${mainCustomerName} ${afterDate}]</b> 으로 <b>연동</b>하였습니다.`;
  };

  formLinkLimitAlarm50 = () => {
    // 수신인 : 소유주
    return `당월 상담 신청 수가 <b>50%</b> 찼습니다. 상담 신청 수 초과 시 신청폼의 링크 접근이 제한됩니다.`;
  };

  formLinkLimitAlarm80 = () => {
    // 수신인 : 소유주
    return `당월 상담 신청 수가 <b>80%</b> 찼습니다. 상담 신청 수 초과 시 신청폼의 링크 접근이 제한됩니다.`;
  };

  formLinkLimitAlarm100 = () => {
    // 수신인 : 소유주
    return `당월 상담 신청 수가 <b>초과</b>되어 생성된 상담 신청폼의 <b>링크 접근이 제한</b>됩니다.`;
  };

  changeFormAlarm = (companyMember, formName) => {
    // 수신인 : 열람 권한자 전체
    return `<b>${companyMember}</b>님이 <b>[${formName}]</b> 신청폼을 <b>수정</b>하였습니다.`;
  };

  changeFormTitleAlarm = (companyMember, formName, changedFormName) => {
    // 수신인 : 열람 권한자 전체
    return `<b>${companyMember}</b>님이 <b>[${formName}]</b> 신청폼명을 <b>[${changedFormName}]</b>으로 변경하였습니다.`;
  };

  inviteFormAlarm = (companyMember, formName) => {
    // 수신인 : 초대 받은 사람
    return `<b>${companyMember}</b>님이 <b>[${formName}]</b> 신청폼에 회원님을 <b>초대</b>했습니다.`;
  };

  inviteDefaultMemberAlarm = (
    inviterName,
    formName,
    companyMember,
    invitedNumber
  ) => {
    if (invitedNumber == 0) {
      return `<b>${inviterName}</b>님이 <b>[${formName}]</b> 신청폼에 <b>${companyMember}</b>님을 <b>초대</b>했습니다.`;
    } else {
      // 수신인 : 초대 받은 사람
      return `<b>${inviterName}</b>님이 <b>[${formName}]</b> 신청폼에 <b>${companyMember}</b>님 외<b>${invitedNumber}</b>을 초대했습니다.`;
    }
  };

  excludeFormAlarm = (companyMember, formName) => {
    // 수신인 : 제외된 사람
    return `<b>${companyMember}</b>님이 <b>[${formName}]</b> 신청폼에서 회원님을 <b>제외</b>했습니다.`;
  };

  createFormAlarm = (companyMember, formName) => {
    // 수신인 : 소유주
    return `<b>${companyMember}</b>님이 새로운 신청폼 <b>[${formName}]</b>을(를) 등록하였습니다.`;
  };

  delFormAlarm = (companyMember, formName) => {
    // 수신인 : 열람 권한자 전체
    return `<b>${companyMember}</b>님이 <b>[${formName}]</b> 신청폼을 <b>삭제</b>하였습니다.`;
  };

  fileLimitAlarm50 = () => {
    // 수신인 : 소유주
    return `파일 보관함 용량이 <b>50%</b> 찼습니다. 저장용량 초과 시 파일 업로드가 제한됩니다.`;
  };

  fileLimitAlarm80 = () => {
    // 수신인 : 소유주
    return `파일 보관함 용량이 <b>80%</b> 찼습니다. 저장용량 초과 시 파일 업로드가 제한됩니다.`;
  };

  fileLimitAlarm100 = () => {
    // 수신인 : 소유주
    return `파일보관함 용량이 <b>초과</b>되어 <b>파일 업로드가 제한</b>됩니다.`;
  };

  failedPlanAlarm = () => {
    // 수신인 : 소유주
    `플랜 정기 결제가 <b>실패</b>하였습니다. 등록된 카드를 확인해주세요.`;
  };

  failedAutoMessageAlarm = () => {
    // 수신인 : 소유주
    return `자동 문자 충전이 <b>실패</b>하였습니다. 등록된 카드를 확인해주세요.`;
  };

  failedSendAlimTalkAlarm = () => {
    // 수신인 : 소유주
    return `<b>문자 잔액 부족</b>으로 알림톡을 발송하지 못했습니다. 잔액을 확인해주세요.`;
  };

  messageCostAlarm = (cost) => {
    // 수신인 : 소유주, 잔액이 1000원 이하인 경우
    return `문자 잔액이 <b>${cost}원</b> 남았습니다. 잔액을 충전해주세요.`;
  };

  startFreeAlarm = (restDate) => {
    // 수신인 : 소유주, 잔액이 1000원 이하인 경우
    return `무료 체험 기간이 시작되었습니다. (남은 기간 ${restDate}일)`;
  };

  restFreeAlarm = (restDate) => {
    // 수신인 : 소유주, 30일, 7일 하루
    if (restDate == 1) {
      return `무료 체험 종료 <b>하루 전</b> 입니다.`;
    }
    return `무료 체험 종료 <b>${restDate}일 전</b>입니다.`;
  };

  addCustomer = (companyMember, customerName) => {
    // 수신인 : 소유주, 담당자
    const now = moment().format("YY/MM/DD");
    return `<b>${companyMember}</b>님이 <b>[${customerName} ${now}]</b> 을 등록했습니다.`;
  };
}

module.exports = { Alarm };
