module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define("plan", {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    plan: {
      allowNull: false,
      defaultValue: "프리",
      type: DataTypes.STRING(100),
    },

    start_plan: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },
    free_plan: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },
    expire_plan: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    plan_price: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
    result_price: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
    result_price_levy: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },

    whiteLabelChecked: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },

    chatChecked: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    analysticChecked: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },

    whiteLabel_price: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },

    chat_price: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
    analystic_price: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },

    merchant_uid: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },

    pay_type: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },

    active: {
      allowNull: false,
      defaultValue: 1,
      type: DataTypes.INTEGER,
    },
    enrollment: {
      allowNull: true,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    will_free: {
      type: DataTypes.DATE(),
    },

    failed_count: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
  });
};
