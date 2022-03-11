const { kakaoPush, kakaoGetResult } = require('../lib/functions');
module.exports = {
  TeamkakaoPushNewForm: async (
    userPhoneNumber,
    formTitle,
    customerName,
    buttonName,
    customer_phoneNumber
  ) => {
    try {
      await kakaoPush(
        userPhoneNumber,
        'form1',
        `
새로운 ${formTitle}이 접수되었습니다.
            
▶ 고객명: ${customerName}
▶ 연락처: ${customer_phoneNumber}
            
접수내용을 오더체크 페이지에서 확인하세요.`,
        buttonName,
        'orderchecktest.s3-website.ap-northeast-2.amazonaws.com'
      );
    } catch (err) {
      console.log(err);
    }
  },
  customerkakaoPushNewForm: async (
    customerPhoneNumber,
    companyName,
    customerName,
    buttonName,
    formTitle
  ) => {
    await kakaoPush(
      customerPhoneNumber.replace(/-/g, ''),
      'form3',
      `
[${companyName}]
${customerName} 고객님, ${formTitle} 접수가 완료되었습니다.
감사합니다.`,
      buttonName,
      `orderchecktest.s3-website.ap-northeast-2.amazonaws.com/`
    );
  },
  customerkakaoPushNewCal: async (
    customerPhoneNumber,
    companyName,
    customerName,
    Num,
    buttonName,
    buttonUrl
  ) => {
    const message = `
[${companyName}]
${customerName} 고객님, 
${Num}차 견적서가 발송되었습니다.
감사합니다.`;

    const kakaoPushResult = await kakaoPush(
      customerPhoneNumber.replace(/-/g, ''),
      'calculate7',
      message,
      buttonName,
      buttonUrl
    );
    return { kakaoPushResult, message };
  },
  checkKakaoPushResult: async (messageId) => {
    const sendResult = await kakaoGetResult(messageId);
    return sendResult;
  },
};
