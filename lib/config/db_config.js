let database;
let host;
if (process.env.NODE_MODE == "DEV") {
  // 개발용
  database = "ordercheckDev";
  host = process.env.DB_HOST;
}

if (process.env.NODE_MODE == "TEST") {
  // 테스트 배포용
  database = "ordercheckTest";
  host = process.env.DB_HOST;
}

if (process.env.NODE_MODE == "IO") {
  // 테스트 후 배포용
  database = "ordercheckIo";
  host = process.env.DB_PRO_HOST;
}

const db_config = {
  host,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database,
};
console.log(db_config);
module.exports = db_config;
