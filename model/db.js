const db_config = require("../lib/config/db_config");
//우리가 사용할 sequelize 라이브러리를 설치합니다.
var Sequelize = require("sequelize");
//대문자 Sequelize를 통해 연결한 결과를 받을 소문자 sequelize 변수를 뒀습니다
//이 이름은 마음껏 지어도 무방합니다.
var sequelize;

var env = process.env.NODE_ENV || "development";

sequelize = new Sequelize(
  db_config.database,
  db_config.user,
  db_config.password,
  {
    host: db_config.host,
    port: db_config.port,
    dialect: "mysql",
    // operatorsAliases: false,
    timezone: "+09:00", //한국 시간 셋팅
    dialectOptions: {
      charset: "utf8mb4",
      dateStrings: true,
      typeCast: true,
      connectTimeout: 5000,
    },

    logging: false,
    pool: {
      max: 20,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
    define: {
      charset: "utf8",
      collate: "utf8_general_ci",
      timestamps: true,
      freezeTableName: true,
    },
  }
);

var db = {};
//객체식으로 데이터베이스 테이블을 구성하고, 직접 해당 테이블에 접속을 할 수 있습니다
//따라서 이런 ORM 방식을 통해, 직접 쿼리를 날리지 않아도 테이블 정보가 담긴 객체를 이용하여
//데이터 조회,생성,변경,삭제를 할 수 있습니다.
db.kakaoPush = sequelize.import(__dirname + "/kakaoPush.js");
db.user = sequelize.import(__dirname + "/user.js");
db.plan = sequelize.import(__dirname + "/plan.js");
db.card = sequelize.import(__dirname + "/card.js");
db.company = sequelize.import(__dirname + "/company.js");
db.consulting = sequelize.import(__dirname + "/consulting.js");
db.sms = sequelize.import(__dirname + "/sms.js");
db.config = sequelize.import(__dirname + "/config.js");
db.pairPace = sequelize.import(__dirname + "/pairPace.js");
db.alarm = sequelize.import(__dirname + "/alarm.js");
db.receipt = sequelize.import(__dirname + "/receipt.js");
db.customerAccount = sequelize.import(__dirname + "/customerAccount.js");
db.chatTemplate = sequelize.import(__dirname + "/chatTemplate.js");
db.customerFile = sequelize.import(__dirname + "/customerFile.js");
db.userCompany = sequelize.import(__dirname + "/userCompany.js");
db.smsHistory = sequelize.import(__dirname + "/smsHistory.js");
db.files = sequelize.import(__dirname + "/files.js");
db.formLink = sequelize.import(__dirname + "/formLink.js");
db.delReason = sequelize.import(__dirname + "/delReason.js");
db.folders = sequelize.import(__dirname + "/folders.js");
db.timeLine = sequelize.import(__dirname + "/consultingTimeLine.js");
db.formOpen = sequelize.import(__dirname + "/formOpenMember.js");
db.calculate = sequelize.import(__dirname + "/calculate.js");
db.store = sequelize.import(__dirname + "/store.js");
db.customer = sequelize.import(__dirname + "/customer.js");
db.planInfo = sequelize.import(__dirname + "/planInfo.js");
db.err = sequelize.import(__dirname + "/err.js");
// usre와 store
db.user.hasMany(db.store, { foreignKey: "user_idx" });
db.store.belongsTo(db.user, {
  foreignKey: "user_idx",
});

// company와 chatTemplate
db.company.hasMany(db.chatTemplate, {
  foreignKey: "company_idx",
});
db.chatTemplate.belongsTo(db.company, {
  foreignKey: "company_idx",
});

// sms와 smsHistory
db.sms.hasMany(db.smsHistory, { foreignKey: "sms_idx" });
db.smsHistory.belongsTo(db.sms, {
  foreignKey: "sms_idx",
});

// company와 sms
db.company.hasOne(db.sms, { foreignKey: "company_idx" });
db.sms.belongsTo(db.company, {
  foreignKey: "company_idx",
});

// company와 customerFile
db.company.hasMany(db.customerFile, {
  foreignKey: "company_idx",
});
db.customerFile.belongsTo(db.company, {
  foreignKey: "company_idx",
});
// company와 receipt
db.company.hasMany(db.receipt, {
  foreignKey: "company_idx",
});
db.receipt.belongsTo(db.company, {
  foreignKey: "company_idx",
});

// customerFile과 folders
db.customerFile.hasMany(db.folders, {
  foreignKey: "customerFile_idx",
});
db.folders.belongsTo(db.customerFile, {
  foreignKey: "customerFile_idx",
});

// customerFile과 files
db.customerFile.hasMany(db.files, {
  foreignKey: "customerFile_idx",
});
db.files.belongsTo(db.customerFile, {
  foreignKey: "customerFile_idx",
});

// company와 files
db.company.hasMany(db.files, {
  foreignKey: "company_idx",
});
db.files.belongsTo(db.company, {
  foreignKey: "company_idx",
});

// company와 folders
db.company.hasMany(db.folders, {
  foreignKey: "company_idx",
});
db.folders.belongsTo(db.company, {
  foreignKey: "company_idx",
});

// folders와 files
db.folders.hasMany(db.files, {
  foreignKey: "folder_uuid",
  sourceKey: "uuid",
});
db.files.belongsTo(db.folders, {
  foreignKey: "folder_uuid",
  targetKey: "uuid",
});

// customer와 timeLine
db.customer.hasMany(db.timeLine, { foreignKey: "customer_idx" });
db.timeLine.belongsTo(db.customer, {
  foreignKey: "customer_idx",
});
// customer와 calculate
db.customer.hasMany(db.calculate, { foreignKey: "customer_idx" });
db.calculate.belongsTo(db.customer, {
  foreignKey: "customer_idx",
});

// company와 calculate
db.company.hasMany(db.calculate, {
  foreignKey: "company_idx",
});
db.calculate.belongsTo(db.company, {
  foreignKey: "company_idx",
});

db.formLink.hasMany(db.formOpen, { foreignKey: "formLink_idx", as: "member" });
db.formOpen.belongsTo(db.formLink, {
  foreignKey: "formLink_idx",
});
//consulting과   customer
db.customer.hasMany(db.consulting, { foreignKey: "customer_idx" });
db.consulting.belongsTo(db.customer, {
  foreignKey: "customer_idx",
});
// company와 customer
db.company.hasMany(db.customer, {
  foreignKey: "company_idx",
});
db.customer.belongsTo(db.company, {
  foreignKey: "company_idx",
});

// alarm과 user, company, customer, formLink
db.user.hasMany(db.alarm, {
  foreignKey: "user_idx",
});
db.alarm.belongsTo(db.user, {
  foreignKey: "user_idx",
});

// company와 formLink
db.company.hasMany(db.formLink, {
  foreignKey: "company_idx",
});
db.formLink.belongsTo(db.company, { foreignKey: "company_idx" });

// consulting과 company
db.company.hasMany(db.consulting, {
  foreignKey: "company_idx",
});
db.consulting.belongsTo(db.company, { foreignKey: "company_idx" });

// plan과 company
db.company.hasMany(db.plan, {
  foreignKey: "company_idx",
});

db.plan.belongsTo(db.company, {
  foreignKey: "company_idx",
});

// company와 user
db.user.hasOne(db.company, {
  foreignKey: "huidx",
});
db.company.belongsTo(db.user, {
  foreignKey: "huidx",
});

// card와 user
db.user.hasMany(db.card, {
  foreignKey: "user_idx",
});

db.card.belongsTo(db.user, {
  foreignKey: "user_idx",
});

// userCompany와 user
db.user.hasMany(db.userCompany, {
  foreignKey: "user_idx",
});
db.userCompany.belongsTo(db.user, {
  foreignKey: "user_idx",
});

// config와 userCompany
db.config.hasOne(db.userCompany, {
  foreignKey: "config_idx",
});

db.userCompany.belongsTo(db.config, {
  foreignKey: "config_idx",
});

// config와 userCompany
db.user.hasMany(db.config, {
  foreignKey: "update_user_idx",
});

db.config.belongsTo(db.user, {
  foreignKey: "update_user_idx",
});

db.company.hasMany(db.userCompany, {
  foreignKey: "company_idx",
});
// userCompany와 company
db.userCompany.belongsTo(db.company, {
  foreignKey: "company_idx",
});

// formOpen과 userCompany
db.userCompany.hasMany(db.formOpen, {
  foreignKey: "user_idx",
  sourceKey: "user_idx",
});
db.formOpen.belongsTo(db.userCompany, {
  targetKey: "user_idx",
  foreignKey: "user_idx",
});

db.userCompany.hasMany(db.customer, {
  sourceKey: "user_idx",
  foreignKey: "contact_person",
});
db.customer.belongsTo(db.userCompany, {
  targetKey: "user_idx",
  foreignKey: "contact_person",
  as: "user",
});
// config와 company
db.company.hasMany(db.config, {
  foreignKey: "company_idx",
});
db.config.belongsTo(db.company, {
  foreignKey: "company_idx",
});

// customerAccount와 calculate 즐겨찾기
db.customerAccount.hasMany(db.calculate, {
  foreignKey: "favorites_customer_account_idx",
});
db.calculate.belongsTo(db.customerAccount, {
  foreignKey: "favorites_customer_account_idx",
});

//추후에 연결된 sequelize 객체를 통해, 직접적으로 데이터베이스에 쿼리도 날릴 수 있습니다
//그래서 앞으로 우리가 사용할 db 객체에 sequelize 객체와 바로 위에서 만든 모델들을 채워 넣습니다.
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
