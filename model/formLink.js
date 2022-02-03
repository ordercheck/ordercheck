module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('formLink', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    thumbNail: {
      allowNull: false,
      type: DataTypes.STRING(100),
    },
    title: {
      allowNull: false,
      type: DataTypes.STRING(100),
    },
    form_link: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING(100),
    },
    tempType: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
  });
};
