module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('payment', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    imp_uid: {
      allowNull: false,
      defaultValue: 0,
      unique: true,
      type: DataTypes.STRING(100),
    },

    customer_uid: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.STRING(100),
    },

    user_name: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.STRING(100),
    },
    user_phone: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.STRING(100),
    },
    user_email: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.STRING(100),
    },
    pay_type: {
      allowNull: false,
      type: DataTypes.STRING(100),
    },
    plan: {
      allowNull: false,
      type: DataTypes.STRING(100),
    },
    period: {
      allowNull: false,
      type: DataTypes.STRING(100),
    },
    whiteLabel: {
      allowNull: false,
      type: DataTypes.STRING(100),
    },
    chat: {
      allowNull: false,
      type: DataTypes.STRING(100),
    },
    analystic: {
      allowNull: false,
      type: DataTypes.STRING(100),
    },
  });
};
