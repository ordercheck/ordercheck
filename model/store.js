module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('store', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    bread: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
  });
};
