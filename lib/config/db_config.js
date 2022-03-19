let database;

if (process.env.NODE_MODE == 'DEV') {
  // 개발용
  database = 'ordercheckDev';
}

if (process.env.NODE_MODE == 'TEST') {
  // 테스트 배포용
  database = 'ordercheckTest';
}

if (process.env.NODE_MODE == 'IO') {
  // 테스트 후 배포용
  database = 'ordercheckIo';
}

const db_config = {
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
<<<<<<< HEAD
  database: 'ordercheckIo',
=======
  database
>>>>>>> 408dc5aa65ba56eec1b74f69184766f3e4aef521
};
module.exports = db_config;
