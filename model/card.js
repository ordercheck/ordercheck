module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('card', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    card_number: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    expired_date: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    card_pw: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    card_birth: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    card_email: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    business_number: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
    credit_yn: {
      allowNull: false,

      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    active: {
      allowNull: false,
      defaultValue: 1,
      type: DataTypes.INTEGER(4),
    },
  });
};
