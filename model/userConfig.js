module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('userConfig', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },

    calculateReload: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
  });
};
