module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('calculate', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },

    pdf_data: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    pdf_name: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    title: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    predicted_price: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
  });
};
