module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define("customerAccount", {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },

    customer_name: {
      allowNull: false,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },

    customer_phoneNumber: {
      allowNull: false,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },

    use_agree: {
      allowNull: true,
      type: DataTypes.BOOLEAN,
    },

    private_agree: {
      allowNull: true,
      type: DataTypes.BOOLEAN,
    },

    marketing_agree: {
      allowNull: true,
      type: DataTypes.BOOLEAN,
    },
    deleted: {
      allowNull: true,
      type: DataTypes.DATE(),
    },
  });
};
