module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('formOpen', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    user_name: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
  });
};
