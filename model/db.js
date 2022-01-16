const db_config = require('../lib/config/db_config');
//우리가 사용할 sequelize 라이브러리를 설치합니다.
var Sequelize = require('sequelize');
//대문자 Sequelize를 통해 연결한 결과를 받을 소문자 sequelize 변수를 뒀습니다
//이 이름은 마음껏 지어도 무방합니다.
var sequelize;

var env = process.env.NODE_ENV || 'development';
sequelize = new Sequelize(
  db_config.database,
  db_config.user,
  db_config.password,
  {
    host: db_config.host,
    port: db_config.port,
    dialect: 'mysql',
    // operatorsAliases: false,
    timezone: '+09:00', //한국 시간 셋팅
    logging: false,
    define: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      freezeTableName: true,
    },
  }
);

var db = {};
//객체식으로 데이터베이스 테이블을 구성하고, 직접 해당 테이블에 접속을 할 수 있습니다
//따라서 이런 ORM 방식을 통해, 직접 쿼리를 날리지 않아도 테이블 정보가 담긴 객체를 이용하여
//데이터 조회,생성,변경,삭제를 할 수 있습니다.
db.kakaoPush = sequelize.import(__dirname + '/kakaoPush.js');
db.user = sequelize.import(__dirname + '/user.js');
db.plan = sequelize.import(__dirname + '/plan.js');
db.card = sequelize.import(__dirname + '/card.js');
db.company = sequelize.import(__dirname + '/company.js');
db.consulting = sequelize.import(__dirname + '/consulting.js');
db.userCompany = sequelize.import(__dirname + '/userCompany.js');
db.timeLine = sequelize.import(__dirname + '/consultingTimeLine.js');
db.calculate = sequelize.import(__dirname + '/calculate.js');
db.test = sequelize.import(__dirname + '/test.js');

//consulting과 timeLine, calculate
db.consulting.hasMany(db.timeLine, { foreignKey: 'consulting_idx' });
db.consulting.hasMany(db.calculate, { foreignKey: 'consulting_idx' });
db.timeLine.belongsTo(db.consulting, {
  foreignKey: 'consulting_idx',
});
db.calculate.belongsTo(db.consulting, {
  foreignKey: 'consulting_idx',
});

// consulting과 company
db.consulting.belongsTo(db.company, {
  foreignKey: 'company_idx',
});

// consulting과 user
db.consulting.belongsTo(db.user, {
  foreignKey: 'contact_person',
});
// plan과 company
db.plan.belongsTo(db.company, {
  foreignKey: 'company_idx',
});
// card와 company
db.card.belongsTo(db.company, {
  foreignKey: 'company_idx',
});
// userCompany와 user
db.userCompany.belongsTo(db.user, {
  foreignKey: 'user_idx',
});
// userCompany와 company
db.userCompany.belongsTo(db.company, {
  foreignKey: 'company_idx',
});
//추후에 연결된 sequelize 객체를 통해, 직접적으로 데이터베이스에 쿼리도 날릴 수 있습니다
//그래서 앞으로 우리가 사용할 db 객체에 sequelize 객체와 바로 위에서 만든 모델들을 채워 넣습니다.
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
