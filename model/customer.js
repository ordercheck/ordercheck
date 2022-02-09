module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('customer', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
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

    room_size: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
    room_size_kind: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },

    active: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },

    searchingAddress: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING(100),
    },
    searchingPhoneNumber: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING(100),
    },
    contract_possibility: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
  });
};
