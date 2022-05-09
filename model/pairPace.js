module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define("pairPace", {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },

    sender_idx: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    user_idx: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    pp_appli_idx: {
      allowNull: true,
      unique: true,
      type: DataTypes.STRING(100),
    },
    first_address: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    detail_address: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    post_number: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },

    second_address: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    apply_type: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },

    sender_name: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },

    company_name: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    phone_number: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },

    applied_date: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },

    ordercheck_error_idx: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
  });
};
