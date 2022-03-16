module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define("smsHistory", {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    sender_phoneNumber: {
      allowNull: false,
      type: DataTypes.STRING(100),
    },

    receiver_phoneNumber: {
      allowNull: false,
      type: DataTypes.STRING(100),
    },
    type: {
      allowNull: false,
      type: DataTypes.STRING(100),
    },
    text: {
      allowNull: false,
      type: DataTypes.TEXT,
    },
    price: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
  });
};
