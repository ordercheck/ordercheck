// const plan = [
//     {"idx":0,"plan":"month","title":"Starter","limitCount":40,"price":43000,"whiteLabel":0,"analystic":21500,"chat":21500},
//     {"idx":1,"plan":"month","title":"Professional","limitCount":100,"price":75800,"whiteLabel":0,"analystic":60700,"chat":60700},
//     {"idx":2,"plan":"month","title":"Team","limitCount":205,"price":125300,"whiteLabel":150400,"analystic":150400,"chat":150400},
//     {"idx":3,"plan":"month","title":"Company","limitCount":410,"price":227200,"whiteLabel":454300,"analystic":340700,"chat":340700},

//     {"idx":4,"plan":"year","title":"Starter","limitCount":40,"price":38000,"whiteLabel":0,"analystic":19000,"chat":19000},
//     {"idx":5,"plan":"year","title":"Professional","limitCount":100,"price":68000,"whiteLabel":0,"analystic":54000,"chat":54000},
//     {"idx":6,"plan":"year","title":"Team","limitCount":205,"price":112000,"whiteLabel":135000,"analystic":135000,"chat":135000},
//     {"idx":7,"plan":"year","title":"Company","limitCount":410,"price":204000,"whiteLabel":408000,"analystic":306000,"chat":306000},
// ]

module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('plan', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    plan: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.STRING(100),
    },

    start_plan: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.STRING(100),
    },
    free_plan: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.STRING(100),
    },
    expire_plan: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.STRING(100),
    },

    result_price: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.STRING(100),
    },
    whiteLabelChecked: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.STRING(100),
    },
    chatChecked: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.STRING(100),
    },
    analysticChecked: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.STRING(100),
    },
    imp_uid: {
      allowNull: true,
      unique: true,
      type: DataTypes.STRING,
    },
    active: {
      allowNull: false,
      defaultValue: 1,
      type: DataTypes.INTEGER(4),
    },
  });
};
