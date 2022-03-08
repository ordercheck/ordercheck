module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('delReason', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    reason: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.TEXT,
    },
  });
};
