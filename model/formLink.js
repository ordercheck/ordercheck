module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('formLink', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    form_link: {
      allowNull: false,
      defaultValue: '',
      unique: true,
      type: DataTypes.STRING(100),
    },
    form_type: {
      allowNull: false,
      defaultValue: 1,
      type: DataTypes.INTEGER,
    },
  });
};
