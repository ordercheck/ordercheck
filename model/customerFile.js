module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('customerFile', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    file_Url: {
      allowNull: true,
      defaultValue: '',
      type: DataTypes.TEXT,
    },
  });
};
