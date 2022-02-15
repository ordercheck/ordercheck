module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('calculate', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },

    calculateNumber: {
      allowNull: true,
      defaultValue: '0차 견적서',
      type: DataTypes.STRING(100),
    },

    file_url: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    file_name: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    title: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    predicted_price: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },

    sharedDate: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },

    status: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
  });
};
