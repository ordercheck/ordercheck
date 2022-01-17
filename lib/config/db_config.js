// const db_config = {
//   host: process.env.DB_HOST,
//   port: 3306,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: 'ordercheck',
// };
// module.exports = db_config;

const db_config = {
  host: process.env.Pro_DB_HOST,
  port: 3306,
  user: process.env.Pro_DB_USER,
  password: process.env.Pro_DB_PASS,
  database: 'ordercheck',
};
module.exports = db_config;
