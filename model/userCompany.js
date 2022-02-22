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
      defaultValue: 1,
      type: DataTypes.INTEGER,
    },
    searchingName: {
      allowNull: false,
      defaultValue: '',
      unique: true,
      type: DataTypes.STRING(100),
    },
    deleted: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.STRING(100),
    },
  });
};
