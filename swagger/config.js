const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: '오더체크 API',
    version: '1.0.0',
    description: `
    -----Plan, Card Token 만들기--------
    {
      "planIdx": "2",
      "free_plan": "2021.12.26",
      "start_plan": "2022.01.09",
      "expire_plan": "2022.02.08",
      "result_price": "426,100", 
      "whiteLabelChecked":"false",
      "chatChecked": "true",
      "analysticChecked":"true"
     }
     일반카드
     {
     "card_number": "5387208246852660", 
     "expiry": "2026-05",  
     "pwd_2digit":"49", 
     "birth":"961005", 
     "card_email": "rlxo6919@naver.com", 
     } 
     법인카드
     {
      "card_number": "1234123412341234", 
      "expiry": "2026-05",  
      "pwd_2digit":"ro", 
      "business_number":"900501", 
      "card_email": "gunhee21@gmail.com", 
      } 
     -----Consulting Form 1 --------
      복수선택은 배열 형태로 넘겨주기
     {
      "choice":"창호"
      "address":"경기도 광명",
      "detail_address":"일직동", 
      "building_type":"아파트", 
      "size": 24, 
      "elv":"true" 
      "hope_Date":"2022.01.06", 
      "predicted_living" :"2022.01.07"
      "budget":"1,000만원"
      "customer_name":"김기태",
      "customer_phoneNumber" : "010-6719-6919",
      "company_idx" : 1
      }
      -----Consulting Form 2 --------
      복수선택은 배열 형태로 넘겨주기
      {
        "customer_name":"김기태",
        "customer_phoneNumber" : "010-6719-6919",
        "customer_email":"이메일", 
         "application_route": "신청경로", 
         "address":"주소",
         "detail_address":"상세주소", 
         "building_type":"시공선택", 
         "size":34, 
         "rooms_count":3,
          "bathrooms_count":1, 
          "completion_year":"준공 연도", 
          "floor_plan":"평면도 첨부(File)", 
          "hope_Date":"시공 희망일(2022.01.06)",
          "predicted_living":"입주 예정일(2022.01.06)", 
          "budget":"예산(1,000만원)", 
          "destruction":"철거",
          "expand ": "(확장)", 
          "window": "샷시", 
          "carpentry": "목공", 
          "paint":"도장", 
          "papering":"도배", 
          "bathroom":"욕실",
          "bathroom_option":"욕실 옵션", 
          "floor":"바닥", 
          "tile":"타일", 
          "electricity_lighting":"전기 및 조명", 
          "kitchen":"주방",
          "kitchen_option":"주방 옵션", 
          "furniture":"가구",
          "facility":"설비", 
          "film":"필름", 
          "art_wall":"아트월", 
          "etc":"기타", 
          "hope_concept":"희망컨셉(file)",
          "contact_time":"연락 가능 시간", 
          "etc_question":"기타 문의",
          "company_idx":1
         }
      `,
  },
  basePath: '/',
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./swagger/*.js'],
};
const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
