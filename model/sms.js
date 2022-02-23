module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('sms', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    text_cost: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.STRING(100),
    },

    repay: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    auto_min: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.STRING(100),
    },
    auto_price: {
      allowNull: false,
      defaultValue: '5,000',
      type: DataTypes.STRING(100),
    },
  });
};
