module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('userCompany', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    active: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    searchingName: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    deleted: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },
  });
};
