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
      "start_plan": "2021.12.26",
      "free_plan": "2022.01.09",
      "expire_plan": "2022.02.08",
      "result_price": "426,100", 
      "whiteLabelChecked":"false",
      "chatChecked": "true",
      "analysticChecked":"true"
     }
     
     {
     "card_number": "1234123412341234", 
     "expired_date": "121234",  
     "card_pw":"ro", 
     "card_birth":"900501", 
     "card_email": "gunhee21@gmail.com", 
     "customerUid": "2"
     } 
     -----Consulting Token 만들기 --------

     {
      "choice":"창호"
      }
       
      {
      "address":"경기도 광명",
      "detail_address":"일직동", 
      "building_type":"아파트", 
      "size": 24, 
      "elv":"true" 
      }
      
      {
      "hope_Date":"2022.01.06", 
      "predicted_living" :"2022.01.07"
      }
       
      
      {
      "budget":"1,000만원"
      }
      
      {
      "customer_name":"김기태",
      "customer_phoneNumber" : "010-6719-6919",
      "company_idx" : 1
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
