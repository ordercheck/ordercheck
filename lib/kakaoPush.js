const { kakaoPush, kakaoGetResult } = require("../lib/functions");
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
module.exports = {
  TeamkakaoPushNewForm: async (
    userPhoneNumber,
    formTitle,
    customerName,
    customer_phoneNumber
  ) => {
    try {
      const message = `[알림] 새로운 상담 신청이 접수되었습니다. 

${formTitle}에 새로운 상담 신청이 접수되었습니다. 

▶ 고객명: ${customerName}
▶ 연락처: ${customer_phoneNumber}

접수 내용을 오더체크 페이지에서 확인하세요.`;

      const url = `ordercheck.io/ordercheck_info`;
      const kakaoPushResult = await kakaoPush(
        userPhoneNumber,
        "newConsult",
        message,
        true,
        [
          {
            type: "WL",
            name: "확인하기",
            linkMobile: `https://${url}`,
            linkPc: `https://${url}`,
          },
        ]
      );
      return { kakaoPushResult };
    } catch (err) {
      console.log(err);
    }
  },
  customerkakaoPushNewForm: async (
    customerPhoneNumber,
    companyName,
    customerName,
    formTitle
  ) => {
    const message = `[${companyName}]
${customerName} 고객님,
${formTitle} 접수가 완료되었습니다.
감사합니다.`;

    const kakaoPushResult = await kakaoPush(
      customerPhoneNumber.replace(/-/g, ""),
      "formAdd",
      message,
      false
    );

    return { kakaoPushResult, message };
  },
  customerkakaoPushNewCal: async (
    customerPhoneNumber,
    companyName,
    customerName,
    Num,
    buttonUrl
  ) => {
    let message = `[${companyName}]
${customerName} 고객님, 
${Num}차 견적서가 발송되었습니다.
감사합니다.`;

    const kakaoPushResult = await kakaoPush(
      customerPhoneNumber,
      "calculate7",
      message,
      true,
      [
        {
          type: "WL",
          name: "견적서 확인",
          linkMobile: `http://${buttonUrl}`,
          linkPc: `http://${buttonUrl}`,
        },
      ]
    );

    message = `${message} 
  ${buttonUrl}`;
    return { kakaoPushResult, message };
  },

  fileStoreLimitKakaoPush: async (customerPhoneNumber) => {
    const now = moment().format("YY/MM/DD HH:mm:ss");
    let message = `[안내] 파일보관함 저장용량을 초과하였습니다.

사용중인 파일보관함 용량이 가득 찼습니다.
    
현 시점부터 새로운 파일 업로드가 제한됩니다. ${now}. 
보관중인 파일은 유지되오나 새로운 폴더 및 파일 생성이 불가합니다.
    
파일보관함을 계속 사용하고 사진, 문서 등을 업로드하려면 저장용량을 추가하거나 불필요한 파일을 제거해야 합니다. 
    
파일보관함 저장용량 추가를 원하신다면 오더체크팀으로 문의바랍니다.`;

    const fileStoreLink = "ordercheck.io";
    const ordercheckLink = "ordercheck.io";
    const kakaoPushResult = await kakaoPush(
      customerPhoneNumber,
      "fileReport",
      message,
      true,
      [
        {
          type: "WL",
          name: "파일보관함으로 이동",
          linkMobile: `https://${fileStoreLink}`,
          linkPc: `https://${fileStoreLink}`,
        },

        {
          type: "WL",
          name: "오더체크팀 문의하기",
          linkMobile: `https://${ordercheckLink}`,
          linkPc: `https://${ordercheckLink}`,
        },
      ]
    );

    return { kakaoPushResult };
  },

  failSmsPay: async (companyName, customerPhoneNumber) => {
    let message = `[결제 실패] 자동 문자 충전이 실패하였습니다.

${companyName} 님,
자동 문자 충전이 실패하였습니다.
    
문자 잔액 소진 시 알림톡 및 문자 푸시가 전송되지 않을 수 있습니다.
문자 잔액과 등록된 카드를 확인해주세요.
만일 계속해서 결제가 실패하는 경우 고객센터에 문의해주세요.
    
오더체크 사이트에서 등록 카드를 확인하세요.
    `;

    const confirmLink = "ordercheck.io";

    const kakaoPushResult = await kakaoPush(
      customerPhoneNumber,
      "failText",
      message,
      true,
      [
        {
          type: "WL",
          name: "확인하기",
          linkMobile: `https://${confirmLink}`,
          linkPc: `https://${confirmLink}`,
        },
      ]
    );

    return { kakaoPushResult };
  },

  failSmsPay: async (companyName, customerPhoneNumber) => {
    let message = `[안내] 자동 문자 잔액이 부족합니다.

${companyName} 님,
문자 잔액이 소진되어 알림톡 및 문자 푸시 전송이 중지되었습니다. 
문자 잔액과 등록된 카드를 확인해주세요. 
충전 전까지 모든 알림톡 및 문자 푸시 전송과 견적 공유 기능이 중지될 예정입니다.
    
문자 충전을 원하신다면 클릭하세요.`;

    const confirmLink = "ordercheck.io";

    const kakaoPushResult = await kakaoPush(
      customerPhoneNumber,
      "failAlim",
      message,
      true,
      [
        {
          type: "WL",
          name: "문자 잔액 충전하기",
          linkMobile: `https://${confirmLink}`,
          linkPc: `https://${confirmLink}`,
        },
      ]
    );

    return { kakaoPushResult };
  },

  userReportKakaoPush: async (
    date,
    newConsult,
    delayCustomer,
    issueCustomer,
    userPhoneNumber
  ) => {
    let message = `[알림] 고객 리포트가 도착했습니다.

기간: ${date} 0시~24시
    
▶ 새 상담 신청 : ${newConsult} 명
▶ 상담 지연 : ${delayCustomer} 명
▶ 이슈 상태 : ${issueCustomer} 명
    
자세한 정보는 오더체크 페이지에서 확인하세요.`;

    const confirmLink = "ordercheck.io";

    const kakaoPushResult = await kakaoPush(
      userPhoneNumber,
      "report",
      message,
      true,
      [
        {
          type: "WL",
          name: "고객 리스트 보기",
          linkMobile: `https://${confirmLink}`,
          linkPc: `https://${confirmLink}`,
        },
      ]
    );

    return { kakaoPushResult };
  },

  checkKakaoPushResult: async (messageId) => {
    const sendResult = await kakaoGetResult(messageId);
    return sendResult;
  },
};
