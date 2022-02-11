module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('consultingTimeLine', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },

    status: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
    memo: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
  });
};
