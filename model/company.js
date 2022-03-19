module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define("company", {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    //host uidx
    // huidx: {
    //   allowNull: true,
    //   unique: true,
    //   type: DataTypes.INTEGER,
    // },
    company_name: {
      allowNull: false,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },
    company_subdomain: {
      allowNull: false,
      defaultValue: "",
      unique: true,
      type: DataTypes.STRING(100),
    },
    address: {
      allowNull: false,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },
    detail_address: {
      allowNull: false,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },
    business_number: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    business_enrollment: {
      allowNull: true,
      type: DataTypes.TEXT(),
    },
    business_enrollment_title: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    form_link_count: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
    customer_count: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
    company_logo: {
      allowNull: true,
      defaultValue: "",
      type: DataTypes.TEXT(),
    },
    company_logo_title: {
      allowNull: true,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },
    deleted: {
      allowNull: true,
      type: DataTypes.DATE(),
    },

    companyexist: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
  });
};
