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
      unique: true,
      defaultValue: 0,
      type: DataTypes.STRING(100),
    },
    customer_uid: {
      allowNull: false,
      unique: true,
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
  });
};
