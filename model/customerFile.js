module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('customerFile', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    customer_phoneNumber: {
      allowNull: false,
      defaultValue: '',

      type: DataTypes.STRING(100),
    },
    customer_name: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    searchingPhoneNumber: {
      allowNull: false,

      type: DataTypes.STRING(100),
    },
  });
};
