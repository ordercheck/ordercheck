const axios = require('axios');
module.exports = {
  addCard: async (
    card_number,
    expiry,
    birth,
    pwd_2digit,
    customer_uid,
    business_number
  ) => {
    birth ? true : (birth = business_number);

    // 인증 토큰 발급 받기
    try {
      const getToken = await axios({
        url: 'https://api.iamport.kr/users/getToken',
        method: 'post', // POST method
        headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
        data: {
          imp_key: process.env.IM_PORT_RESTKEY, // REST API 키
          imp_secret: process.env.IM_PORT_SECRETKEY, // REST API Secret
        },
      });

      // 빌링키 발급 요청
      const issueBilling = await axios({
        url: `https://api.iamport.kr/subscribe/customers/${customer_uid}`,
        method: 'post',
        headers: { Authorization: getToken.data.response.access_token }, // 인증 토큰 Authorization header에 추가
        data: {
          card_number, // 카드 번호
          expiry, // 카드 유효기간
          birth, // 생년월일
          pwd_2digit, // 카드 비밀번호 앞 두자리
        },
      });
      const { code, message } = issueBilling.data;

      if (code === 0) {
        // 빌링키 발급 성공
        return {
          success: true,
        };
      } else {
        // 빌링키 발급 실패
        return { success: false, message };
      }
    } catch (err) {
      return err.message;
    }
  },

  payNow: async (customer_uid, price, merchant_uid, name) => {
    // "/billings" 에 대한 POST 요청을 처리하는 controller
    try {
      const getToken = await axios({
        url: 'https://api.iamport.kr/users/getToken',
        method: 'post', // POST method
        headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
        data: {
          imp_key: process.env.IM_PORT_RESTKEY, // REST API 키
          imp_secret: process.env.IM_PORT_SECRETKEY, // REST API Secret
        },
      });
      // 결제(재결제) 요청
      const paymentResult = await axios({
        url: `https://api.iamport.kr/subscribe/payments/again`,
        method: 'post',
        headers: { Authorization: getToken.data.response.access_token }, // 인증 토큰을 Authorization header에 추가
        data: {
          customer_uid,
          merchant_uid, // 새로 생성한 결제(재결제)용 주문 번호
          amount: price,
          name,
        },
      });

      if (paymentResult.data.code === 0) {
        // 카드사 통신에 성공(실제 승인 성공 여부는 추가 판단이 필요함)
        if (paymentResult.data.response.status === 'paid') {
          //카드 정상 승인

          return {
            success: true,
            imp_uid: paymentResult.data.response.imp_uid,
            card_name: paymentResult.data.response.card_name,
          };
        } else {
          //카드 승인 실패 (예: 고객 카드 한도초과, 거래정지카드, 잔액부족 등)
          //paymentResult.status : failed 로 수신됨
          return {
            success: false,
            message: paymentResult.data.response.fail_reason,
          };
        }
      }

      return {
        success: false,
        message: paymentResult.data.message,
      };
    } catch (err) {
      const Err = err.message;
      return {
        success: false,
        message: Err,
      };
    }
  },
  refund: async (imp_uid, price) => {
    /* 액세스 토큰(access token) 발급 */
    try {
      const getToken = await axios({
        url: 'https://api.iamport.kr/users/getToken',
        method: 'post', // POST method
        headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
        data: {
          imp_key: process.env.IM_PORT_RESTKEY, // REST API 키
          imp_secret: process.env.IM_PORT_SECRETKEY, // REST API Secret
        },
      });
      const reason = '카드 입출금 확인';

      /* 결제정보 조회 */

      /* 아임포트 REST API로 결제환불 요청 */
      await axios({
        url: 'https://api.iamport.kr/payments/cancel',
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getToken.data.response.access_token, // 아임포트 서버로부터 발급받은 엑세스 토큰
        },
        data: {
          reason, // 가맹점 클라이언트로부터 받은 환불사유
          imp_uid,
          amount: price, // 가맹점 클라이언트로부터 받은 환불금액
        },
      });
      return {
        success: true,
      };
    } catch (err) {
      const Err = err.message;
      return {
        success: false,
        message: Err,
      };
    }
  },

  schedulePay: async (
    unixtime,
    customer_uid,
    price,
    buyer_name,
    buyer_tel,
    buyer_email,
    merchant_uid
  ) => {
    try {
      const getToken = await axios({
        url: 'https://api.iamport.kr/users/getToken',
        method: 'post', // POST method
        headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
        data: {
          imp_key: process.env.IM_PORT_RESTKEY, // REST API 키
          imp_secret: process.env.IM_PORT_SECRETKEY, // REST API Secret
        },
      });
      const result = await axios({
        url: `https://api.iamport.kr/subscribe/payments/schedule`,
        method: 'post',
        headers: { Authorization: getToken.data.response.access_token }, // 인증 토큰 Authorization header에 추가
        data: {
          customer_uid, // 카드(빌링키)와 1:1로 대응하는 값
          schedules: [
            {
              merchant_uid, // 주문 번호
              schedule_at: unixtime, // 결제 시도 시각 in Unix Time Stamp. 예: 다음 달 1일
              amount: price,
              name: '월간 이용권 정기결제',
              buyer_name,
              buyer_tel,
              buyer_email,
            },
          ],
        },
      });
    } catch (err) {}
  },
  getPayment: async (imp_uid) => {
    // 액세스 토큰(access token) 발급 받기
    const getToken = await axios({
      url: 'https://api.iamport.kr/users/getToken',
      method: 'post', // POST method
      headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
      data: {
        imp_key: process.env.IM_PORT_RESTKEY, // REST API 키
        imp_secret: process.env.IM_PORT_SECRETKEY, // REST API Secret
      },
    });
    const { access_token } = getToken.data.response; // 인증 토큰
    const getPaymentData = await axios({
      url: `https://api.iamport.kr/payments/${imp_uid}`, // imp_uid 전달
      method: 'get', // GET method
      headers: { Authorization: access_token }, // 인증 토큰 Authorization header에 추가
    });
    const paymentData = getPaymentData.data.response;
    return paymentData;
  },
  delCardPort: async (customer_uid) => {
    const getToken = await axios({
      url: 'https://api.iamport.kr/users/getToken',
      method: 'post', // POST method
      headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
      data: {
        imp_key: process.env.IM_PORT_RESTKEY, // REST API 키
        imp_secret: process.env.IM_PORT_SECRETKEY, // REST API Secret
      },
    });

    await axios({
      url: `https://api.iamport.kr/subscribe/customers/${customer_uid}`,
      method: 'delete',
      headers: { Authorization: getToken.data.response.access_token }, // 인증 토큰을 Authorization header에 추가
    });
  },

  cancelSchedule: async (customer_uid) => {
    const getToken = await axios({
      url: 'https://api.iamport.kr/users/getToken',
      method: 'post', // POST method
      headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
      data: {
        imp_key: process.env.IM_PORT_RESTKEY, // REST API 키
        imp_secret: process.env.IM_PORT_SECRETKEY, // REST API Secret
      },
    });

    await axios({
      url: `https://api.iamport.kr/subscribe/payments/unschedule`,
      method: 'post',
      headers: { Authorization: getToken.data.response.access_token }, // 인증 토큰을 Authorization header에 추가
      data: {
        customer_uid,
      },
    });
  },
};

// const card_number = 5387208246852660;
// const expiry = '2026-05';
// const birth = 961005;
// const pwd_2digit = 49;
