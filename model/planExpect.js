module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('planExpect', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    merchant_uid: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.STRING(100),
    },
  });
};
