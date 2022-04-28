module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define("pairPace", {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },

    company_name: {
      allowNull: false,
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
    road_address: {
      allowNull: false,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },

    detail_address: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },

    customer_idx: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },

    submission_date: {
      allowNull: false,
      type: DataTypes.DATE(),
    },
  });
};
