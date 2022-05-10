module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define("planInfo", {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    plan: {
      allowNull: false,
      type: DataTypes.STRING(15),
    },

    plan_price: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },

    whiteLabel_price: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },

    analystic_price: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },

    chat_price: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },

    plan_price_levy: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    whiteLabel_price_levy: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    analystic_price_levy: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    chat_price_levy: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    form_link_count: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    customer_count: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    fileStore: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
  });
};
