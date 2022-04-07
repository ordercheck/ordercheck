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
      message
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

  checkKakaoPushResult: async (messageId) => {
    const sendResult = await kakaoGetResult(messageId);
    return sendResult;
  },
};
