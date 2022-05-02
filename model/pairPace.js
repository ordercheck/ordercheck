module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define("pairPace", {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },

    customer_idx: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    strPpAppliIdx: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    address: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    detail_address: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    post_address: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },

    jibun_address: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    form_type: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },

    customer_name: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },

    company_name: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    customer_phone: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },

    submission_date: {
      allowNull: true,
      type: DataTypes.DATE(),
    },
  });
};
