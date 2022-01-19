module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('company', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    //host uidx
    huidx: {
      allowNull: true,
      unique: true,
      type: DataTypes.INTEGER,
    },
    company_name: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    company_subdomain: {
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
    business_number: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    business_enrollment: {
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
