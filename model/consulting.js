module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('consulting', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },

    choice: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    address: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    detail_address: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    building_type: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    size: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    elv: {
      allowNull: false,
      defaultValue: 'true',
      type: DataTypes.STRING(100),
    },
    hope_Date: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    predicted_living: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    budget: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    customer_name: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    customer_phoneNumber: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    active: {
      allowNull: false,
      defaultValue: '상담 신청',
      type: DataTypes.STRING(100),
    },
    contract_possibility: {
      allowNull: false,
      defaultValue: '없음',
      type: DataTypes.STRING(100),
    },
  });
};
