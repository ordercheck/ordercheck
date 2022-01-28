module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('card', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },

    card_name: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    card_number: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    expiry: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    pwd_2digit: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    birth: {
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
    customer_uid: {
      allowNull: true,
      unique: true,
      type: DataTypes.STRING,
    },
    customer_uid: {
      allowNull: true,
      unique: true,
      type: DataTypes.STRING,
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
