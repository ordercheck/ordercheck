module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define("receipt", {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },

    company_name: {
      allowNull: false,
      type: DataTypes.STRING(100),
    },

    card_code: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },

    card_name: {
      allowNull: false,
      type: DataTypes.STRING(100),
    },

    plan: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },

    plan_price: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
    receiptId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },

    receipt_kind: {
      allowNull: false,
      type: DataTypes.STRING(100),
    },
    card_number: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },

    status: {
      allowNull: true,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    result_price: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },

    result_price_levy: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },

    whiteLabel_price: {
      allowNull: true,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },

    chat_price: {
      allowNull: true,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
    analystic_price: {
      allowNull: true,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
  });
};
