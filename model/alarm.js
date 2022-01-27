module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('alarm', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    message: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
  });
};
